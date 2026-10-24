import "fake-indexeddb/auto";
import { describe, it, expect, afterEach } from "vitest";
import * as C from "./core";
import { db, load, save } from "./db";
const make = () => {
  const d = C.initialData();
  return C.startSession(
    d.programs[0].workouts[0],
    d.programs[0],
    d.exercises,
    1000,
  );
};
const log = (s: C.Session, reps = 10, weight = 50) => {
  s.exercises[0].logs.forEach((l) =>
    Object.assign(l, { weight, reps, rir: 2, done: true }),
  );
  return s;
};
afterEach(async () => {
  await db.state.clear();
  await load();
});
describe("default program", () => {
  it("initializes exactly six workouts with the requested prescriptions", () => {
    const p = C.defaultProgram();
    expect(p.workouts.map((w) => w.name)).toEqual([
      "Push A",
      "Pull A",
      "Legs A",
      "Push B",
      "Pull B",
      "Legs B",
    ]);
    expect(
      p.workouts.map((w) =>
        w.exercises.map((e) => [
          C.library.find((x) => x.id === e.exerciseId)!.name,
          e.sets,
          e.min,
          e.max,
        ]),
      ),
    ).toEqual([
      [
        ["Bench Press", 3, 6, 10],
        ["Incline Dumbbell Press", 2, 8, 12],
        ["Pec Fly Machine", 2, 12, 15],
        ["Shoulder Press", 2, 8, 12],
        ["Lateral Raises", 3, 12, 15],
        ["Triceps Pushdown", 2, 10, 15],
      ],
      [
        ["Lat Pulldown", 3, 8, 12],
        ["Hammer Strength D.Y. Row", 3, 8, 12],
        ["Seated Cable Row", 2, 10, 12],
        ["Reverse Pec Deck", 3, 12, 15],
        ["Biceps Curl", 2, 10, 12],
        ["Hammer Curl", 2, 10, 12],
      ],
      [
        ["Squat", 3, 6, 10],
        ["Leg Press", 2, 10, 12],
        ["Seated Leg Curl", 2, 10, 15],
        ["Hip Adduction", 2, 12, 15],
        ["Standing Calf Raises", 3, 12, 15],
        ["Machine Abdominal Crunch", 2, 12, 15],
      ],
      [
        ["Incline Bench Press", 3, 8, 12],
        ["Decline Chest Press Machine", 2, 10, 12],
        ["High to Low Cable Fly", 2, 12, 15],
        ["Dumbbell Shoulder Press", 2, 8, 12],
        ["Cable Lateral Raises", 3, 12, 15],
        ["Overhead Triceps Extension", 2, 10, 15],
      ],
      [
        ["Pull-ups", 3, 6, 10],
        ["T-Bar Row", 3, 8, 12],
        ["Dumbbell/Machine Shrugs", 3, 10, 15],
        ["Face Pull", 2, 12, 15],
        ["Biceps Curl Machine", 2, 10, 12],
        ["Incline Dumbbell Curl", 2, 10, 12],
      ],
      [
        ["Seated Leg Curl", 3, 10, 12],
        ["Hack Squat", 3, 8, 12],
        ["Leg Extension", 2, 12, 15],
        ["Lying Leg Curl", 2, 10, 15],
        ["Seated Calf Raises", 3, 12, 15],
        ["Hanging Knee Raises", 2, 12, 15],
      ],
    ]);
  });
  it("rotates through six workouts and wraps without weekday logic", () => {
    const d = C.initialData(),
      p = d.programs[0];
    for (let i = 0; i < 7; i++) {
      expect(C.nextWorkout(p, d.sessions).id).toBe(p.workouts[i % 6].id);
      const s = C.startSession(p.workouts[i % 6], p, d.exercises, i * 86400000);
      log(s);
      d.sessions.push(C.finishSession(s, i * 86400000 + 5000));
    }
  });
  it("rest days and incomplete sessions do not advance the program", () => {
    const d = C.initialData(),
      p = d.programs[0];
    d.active = make();
    expect(C.nextWorkout(p, d.sessions).name).toBe("Push A");
    d.sessions = [C.finishSession(log(make()), 10000)];
    expect(C.nextWorkout(p, d.sessions).name).toBe("Pull A");
  });
  it("edits templates without changing historical snapshots", () => {
    const d = C.initialData(),
      s = make();
    d.programs[0].workouts[0].exercises[0].sets = 9;
    d.exercises[0].name = "Changed";
    expect(s.exercises[0].sets).toBe(3);
    expect(s.exercises[0].name).toBe("Bench Press");
  });
});
describe("sessions and validation", () => {
  it("requires a completed working set before finishing", () => {
    expect(() => C.finishSession(make())).toThrow();
    const s = make();
    s.exercises[0].logs = [
      { ...C.newSet(true), done: true, weight: 20, reps: 10 },
    ];
    expect(() => C.finishSession(s)).toThrow();
  });
  it("finishes a snapshot and correctly excludes paused duration", () => {
    const s = log(make());
    s.pausedMs = 1000;
    s.pausedAt = 5000;
    const done = C.finishSession(s, 10000);
    expect(done.end).toBe(10000);
    expect(done.pausedAt).toBeUndefined();
    expect(C.duration(done)).toBe(3000 / 60000);
    expect(s.end).toBeUndefined();
  });
  it("accepts decimals and bodyweight, rejects invalid weight/reps/RIR", () => {
    const good = { ...C.newSet(), weight: 2.5, reps: 10 };
    expect(C.validSet(good)).toBe(true);
    expect(C.validSet({ ...good, weight: 0 })).toBe(true);
    for (const patch of [
      { weight: -1 },
      { weight: NaN },
      { weight: Infinity },
      { reps: 0 },
      { reps: 2.5 },
      { reps: null },
      { rir: 11 },
      { rir: -1 },
    ])
      expect(C.validSet({ ...good, ...patch })).toBe(false);
  });
  it("does not prefill or complete reference values", () => {
    expect(
      make().exercises[0].logs.every(
        (l) => l.weight === null && l.reps === null && !l.done,
      ),
    ).toBe(true);
  });
  it("persists active sessions and completed history through IndexedDB reload", async () => {
    const d = C.initialData();
    d.active = log(make());
    await save(d);
    const restored = await load();
    expect(restored.active).toEqual(d.active);
    restored.sessions.push(C.finishSession(restored.active!, 10000));
    restored.active = null;
    await save(restored);
    expect((await load()).sessions).toHaveLength(1);
    expect((await load()).active).toBeNull();
  });
});
describe("Smart Coach", () => {
  const end = Date.now();
  it("reports insufficient history", () => {
    expect(C.coach(make().exercises[0], []).key).toBe("insufficient");
  });
  it("increases by the configured increment only at the top of all sets", () => {
    const s = C.finishSession(log(make()), end),
      e = { ...s.exercises[0], increment: 1 };
    expect(C.coach(e, [s], end)).toEqual({ key: "increase", weight: 51 });
    s.exercises[0].logs[1].reps = 9;
    expect(C.coach(e, [s], end).key).toBe("keep");
  });
  it("excludes warmup and incomplete sets", () => {
    const s = C.finishSession(log(make()), end);
    s.exercises[0].logs[1].warmup = true;
    expect(C.coach(s.exercises[0], [s], end).key).toBe("keep");
  });
  it("respects reported difficulty and RIR", () => {
    const s = C.finishSession(log(make()), end);
    s.exercises[0].feedback = "reduce";
    expect(C.coach(s.exercises[0], [s], end).key).toBe("reduce");
    s.exercises[0].feedback = "";
    s.exercises[0].logs[0].rir = 0;
    expect(C.coach(s.exercises[0], [s], end).key).toBe("reduce");
  });
  it("suggests a conservative return after a break", () => {
    const s = C.finishSession(log(make()), end);
    expect(C.coach(s.exercises[0], [s], end + 22 * 86400000)).toEqual({
      key: "return",
      weight: 45,
    });
  });
});
describe("records and volume", () => {
  it("detects weight, estimated 1RM and repetitions at weight while excluding warmups", () => {
    const s = log(make());
    s.exercises[0].logs.push({
      ...C.newSet(true),
      weight: 100,
      reps: 10,
      done: true,
    });
    const r = C.records([s]).e0;
    expect(r.weight).toBe(50);
    expect(r.reps["50"]).toBe(10);
    expect(r.estimate).toBeCloseTo(66.6667);
    expect(C.volume(s)).toBe(1500);
  });
  it("does not estimate inappropriate movements or high repetitions", () => {
    expect(C.e1rm({ ...C.newSet(), weight: 50, reps: 12 }, true)).toBeNull();
    expect(C.e1rm({ ...C.newSet(), weight: 50, reps: 8 }, false)).toBeNull();
  });
});
describe("backups", () => {
  it("round trips complete personal data", () => {
    const d = C.initialData();
    d.active = log(make());
    d.sessions = [C.finishSession(log(make()), 10000)];
    expect(C.parseBackup(C.backup(d))).toEqual(d);
  });
  it("rejects malformed, unsupported and structurally invalid backups", () => {
    for (const text of [
      "oops",
      "{}",
      '{"version":2,"data":{}}',
      '{"version":1,"data":{}}',
    ])
      expect(() => C.parseBackup(text)).toThrow();
    const d = C.initialData();
    d.programs[0].workouts[0].exercises[0].sets = -1;
    expect(() => C.parseBackup(C.backup(d))).toThrow();
  });
  it("invalid import cannot mutate stored data", async () => {
    const d = C.initialData();
    await save(d);
    try {
      C.parseBackup("{broken");
    } catch {}
    expect(await load()).toEqual(d);
  });
});

describe("storage safety", () => {
  it("rejects a stale tab rather than overwriting newer data", async () => {
    const d = await load();
    await save(d);
    const row = (await db.state.get("personal"))!;
    await db.state.put({
      ...row,
      revision: row.revision! + 1,
      data: { ...d, settings: { ...d.settings, unit: "lb" } },
    });
    await expect(save(d)).rejects.toThrow("Another tab");
    expect((await db.state.get("personal"))!.data.settings.unit).toBe("lb");
  });
  it("safely migrates the v1 schema without changing personal data", async () => {
    const { default: Dexie } = await import("dexie");
    const { FitDB } = await import("./db");
    const name = "fittrack-migration-test";
    await Dexie.delete(name);
    const old = new Dexie(name);
    old.version(1).stores({ state: "id" });
    const d = C.initialData();
    d.active = log(make());
    await old.table("state").put({ id: "personal", data: d });
    old.close();
    const migrated = new FitDB(name);
    await migrated.open();
    expect((await migrated.state.get("personal"))!.data).toEqual(d);
    expect((await migrated.state.get("personal"))!.revision).toBe(0);
    migrated.close();
    await Dexie.delete(name);
  });
  it("rejects malformed settings, duplicate IDs and invalid historical data", () => {
    for (const mutate of [
      (d: C.Data) => {
        d.settings.autoRest = "yes" as unknown as boolean;
      },
      (d: C.Data) => {
        d.exercises.push(d.exercises[0]);
      },
      (d: C.Data) => {
        d.programs[0].workouts[0].exercises[0].max = 0;
      },
      (d: C.Data) => {
        d.sessions = [C.finishSession(log(make()), 10000)];
        d.sessions[0].exercises[0].logs[0].reps = -1;
      },
      (d: C.Data) => {
        d.active = make();
        d.active.exercises[0].logs[0].weight = -1;
      },
    ]) {
      const d = C.initialData();
      mutate(d);
      expect(() => C.parseBackup(C.backup(d))).toThrow();
    }
  });
});
