import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import Dexie from "dexie";
import * as C from "../core";
import {
  canUse,
  searchExercises,
  substitutions,
  equipmentTypes,
} from "../catalog";
import { defaultConfig, goals, presets } from "./types";
import {
  generatePlan,
  estimateWorkout,
  planIssues,
  savePlan,
  weeklyVolume,
  duplicateProgram,
} from "./engine";
import { templates, programNames } from "./templates";
import { FitDB, load, save, db } from "../db";
const data = C.initialData(),
  ex = data.exercises;
const byName = (name: string) => ex.find((e) => e.name === name)!;
describe("curated offline catalog", () => {
  it("loads at least 300 unique stable, nonempty real named records and preserves all legacy IDs", () => {
    expect(ex.length).toBe(356);
    expect(new Set(ex.map((e) => e.id)).size).toBe(ex.length);
    expect(new Set(ex.map((e) => e.name.toLowerCase())).size).toBe(ex.length);
    for (let i = 0; i < 35; i++)
      expect(ex.find((e) => e.id === "e" + i)?.name).toBe(C.library[i].name);
    expect(C.initialData().exercises.map((e) => e.id)).toEqual(
      ex.map((e) => e.id),
    );
    for (const e of ex) {
      expect(e.nameAr?.length).toBeGreaterThan(3);
      expect(e.startingPosition?.length).toBeGreaterThan(15);
      expect(e.instructionsAr?.length).toBeGreaterThan(20);
      expect(e.mistakes?.length).toBeGreaterThan(10);
      expect(e.safety?.length).toBeGreaterThan(10);
      expect(e.pattern).toBeTruthy();
      expect(e.difficulty).toBeTruthy();
      expect(e.requiredEquipment?.length).toBeGreaterThan(0);
      expect(e.secondary).not.toContain(e.muscle);
    }
  });
  it("classifies representative muscles and avoids converting glute choices into the original program", () => {
    expect(byName("Hip Abduction Machine").muscle).toBe("Hip abductors");
    expect(byName("Hip Adduction").muscle).toBe("Adductors");
    expect(byName("Wall Tibialis Raise").muscle).toBe("Tibialis anterior");
    expect(byName("Bayesian Cable Curl").muscle).toBe("Biceps");
    expect(byName("Pallof Press").pattern).toBe("Core Stabilization");
    expect(
      data.programs[0].workouts
        .flatMap((w) => w.exercises)
        .some(
          (p) => ex.find((e) => e.id === p.exerciseId)?.muscle === "Glutes",
        ),
    ).toBe(false);
  });
  it("searches Arabic, synonyms, favorites, recent use and combined filters", () => {
    expect(
      searchExercises(ex, { query: "بنش" }).some((e) => e.id === "e0"),
    ).toBe(true);
    expect(searchExercises(ex, { query: "صدر" }).length).toBeGreaterThan(10);
    expect(
      searchExercises(ex, { query: "pec deck" }).some((e) => e.id === "e2"),
    ).toBe(true);
    expect(searchExercises(ex, { query: "الضغط" }).length).toBeGreaterThan(0);
    expect(
      searchExercises(ex, {
        muscle: "Upper chest",
        equipment: "Smith Machine",
      }).map((e) => e.name),
    ).toContain("Incline Smith Machine Press");
    expect(
      searchExercises(ex, {
        equipment: "Cable",
        kind: "Isolation",
        difficulty: "Beginner",
      }).every(
        (e) =>
          e.equipmentType === "Cable" &&
          e.kind === "Isolation" &&
          e.difficulty === "Beginner",
      ),
    ).toBe(true);
    expect(
      searchExercises(ex, { favoritesOnly: true, favoriteIds: ["e0"] }),
    ).toHaveLength(1);
    expect(
      searchExercises(ex, { recentOnly: true, recentIds: ["e14"] }),
    ).toHaveLength(1);
  });
  it("ranks similar presses, respects equipment and never calls a fly an equivalent press", () => {
    const result = substitutions(byName("Bench Press"), ex);
    expect(result.map((r) => r.exercise.name)).toContain(
      "Dumbbell Bench Press",
    );
    expect(
      result.every(
        (r) =>
          r.exercise.pattern === "Horizontal Push" &&
          r.exercise.kind === "Compound",
      ),
    ).toBe(true);
    expect(result.map((r) => r.exercise.name)).not.toContain("Pec Fly Machine");
    const restricted = substitutions(byName("Bench Press"), ex, {
      equipment: ["Dumbbell", "Bodyweight"],
      excluded: [byName("Dumbbell Floor Press").id],
    });
    expect(
      restricted.every(
        (r) =>
          canUse(r.exercise, ["Dumbbell", "Bodyweight"]) &&
          r.exercise.name !== "Dumbbell Floor Press",
      ),
    ).toBe(true);
  });
});
describe("ready-made plans", () => {
  it("contains exactly the 18 requested named templates with concrete valid prescriptions", () => {
    const ps = templates(ex);
    expect(ps.map((p) => p.name)).toEqual([...programNames]);
    expect(ps).toHaveLength(18);
    for (const p of ps) {
      expect(p.workouts.length).toBeGreaterThan(0);
      expect(p.info?.equipment.length).toBeGreaterThan(0);
      for (const w of p.workouts) {
        expect(w.exercises.length).toBeGreaterThan(2);
        expect(new Set(w.exercises.map((x) => x.exerciseId)).size).toBe(
          w.exercises.length,
        );
        for (const e of w.exercises) {
          expect(ex.some((x) => x.id === e.exerciseId)).toBe(true);
          expect(e.sets).toBeGreaterThan(0);
          expect(e.max).toBeGreaterThanOrEqual(e.min);
        }
      }
    }
    expect(
      ps[0].workouts.every((w) => w.exercises.every((e) => e.sets === 2)),
    ).toBe(true);
    expect(
      ps[14].workouts
        .flatMap((w) => w.exercises)
        .every((p) =>
          canUse(
            ex.find((e) => e.id === p.exerciseId)!,
            ["Bodyweight"],
          ),
        ),
    ).toBe(true);
  });
  it("preserves the exact original six-workout program and duplicates without aliasing", () => {
    const p = templates(ex)[7];
    expect(p.workouts.map((w) => w.exercises)).toEqual(
      C.defaultProgram().workouts.map((w) => w.exercises),
    );
    const duplicate = duplicateProgram(data.programs[0], "copy");
    duplicate.workouts[0].exercises[0].sets = 9;
    expect(data.programs[0].workouts[0].exercises[0].sets).toBe(3);
    expect(duplicate.id).toBe("copy");
  });
});
describe("deterministic plan generation", () => {
  for (let days = 1; days <= 7; days++)
    it(`generates a real, balanced ${days}-day plan within time`, () => {
      const c = { ...defaultConfig(), days, minutes: 45, weekdays: [] };
      const result = generatePlan(c, ex);
      expect(result.program.workouts).toHaveLength(days);
      expect(result.canActivate).toBe(true);
      expect(planIssues(result.program, ex)).toEqual([]);
      for (const w of result.program.workouts) {
        expect(estimateWorkout(w, ex)).toBeLessThanOrEqual(c.minutes);
        expect(w.exercises.length).toBeGreaterThan(0);
      }
      if (days === 7) expect(result.program.workouts[6].recovery).toBe(true);
      expect(generatePlan(c, ex)).toEqual(result);
    });
  for (const goal of goals)
    for (const experience of ["Beginner", "Intermediate", "Advanced"] as const)
      it(`adapts ${goal} for ${experience}`, () => {
        const c = { ...defaultConfig(), goal, experience };
        const p = generatePlan(c, ex).program;
        expect(p.info?.goal).toBe(goal);
        expect(planIssues(p, ex)).toEqual([]);
        if (goal === "Maximal Strength")
          expect(
            p.workouts
              .flatMap((w) => w.exercises)
              .some((e) => e.min === 3 && e.rest === 180),
          ).toBe(true);
        if (goal === "Muscular Endurance")
          expect(
            p.workouts
              .flatMap((w) => w.exercises)
              .filter(
                (e) =>
                  ex.find((x) => x.id === e.exerciseId)?.tracking !== "seconds",
              )
              .every((e) => e.min === 12),
          ).toBe(true);
      });
  for (const [mode, eq] of Object.entries(presets).filter(
    ([mode]) => mode !== "Custom Equipment Selection",
  ))
    it(`honors ${mode} restrictions`, () => {
      const c = {
        ...defaultConfig(),
        equipmentMode: mode as keyof typeof presets,
        equipment: [...eq],
      };
      const r = generatePlan(c, ex);
      expect(r.canActivate).toBe(true);
      expect(
        r.program.workouts
          .flatMap((w) => w.exercises)
          .every((p) =>
            canUse(
              ex.find((e) => e.id === p.exerciseId)!,
              eq,
            ),
          ),
      ).toBe(true);
    });
  it("never violates exercise exclusions or excluded movement patterns", () => {
    const c = {
      ...defaultConfig(),
      excluded: ["e0", "e12", "e6", byName("Goblet Squat").id],
      limitations: ["Vertical Push" as const],
    };
    const r = generatePlan(c, ex);
    expect(
      r.program.workouts
        .flatMap((w) => w.exercises)
        .every(
          (p) =>
            !c.excluded.includes(p.exerciseId) &&
            !c.limitations.includes(
              ex.find((e) => e.id === p.exerciseId)!.pattern as "Vertical Push",
            ),
        ),
    ).toBe(true);
  });
  it("reports impossible constraints instead of silently using forbidden equipment", () => {
    const c = {
      ...defaultConfig(),
      equipmentMode: "Custom Equipment Selection" as const,
      equipment: ["EZ Bar" as const],
    };
    const r = generatePlan(c, ex);
    expect(r.canActivate).toBe(false);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(
      r.program.workouts
        .flatMap((w) => w.exercises)
        .every((p) =>
          canUse(
            ex.find((e) => e.id === p.exerciseId)!,
            ["EZ Bar"],
          ),
        ),
    ).toBe(true);
    expect(() => generatePlan({ ...c, equipment: [] }, ex)).toThrow();
  });
  for (const minutes of [15, 30, 45, 60, 75, 90])
    it(`respects ${minutes}-minute duration and individualized volume`, () => {
      const c = {
        ...defaultConfig(),
        minutes,
        experience: "Advanced" as const,
        days: 4,
      };
      const r = generatePlan(c, ex);
      expect(
        r.program.workouts.every((w) => estimateWorkout(w, ex) <= minutes),
      ).toBe(true);
    });
  it("priority changes selection/volume without blindly lengthening sessions", () => {
    const c = { ...defaultConfig(), days: 4, minutes: 60 };
    const normal = generatePlan(c, ex).program;
    const priority = generatePlan(
      { ...c, priorities: { "Side deltoids": "Prioritize", Glutes: "Reduce" } },
      ex,
    ).program;
    expect(weeklyVolume(priority, ex)["Side deltoids"]).toBeGreaterThan(
      weeklyVolume(normal, ex)["Side deltoids"] || 0,
    );
    expect(priority.workouts.every((w) => estimateWorkout(w, ex) <= 60)).toBe(
      true,
    );
    const upper = generatePlan(
      { ...c, priorities: { "Upper chest": "Prioritize" } },
      ex,
    ).program;
    expect(
      upper.workouts
        .flatMap((w) => w.exercises)
        .some((p) =>
          ex
            .find((e) => e.id === p.exerciseId)
            ?.regions?.includes("Upper chest"),
        ),
    ).toBe(true);
  });
  it("regeneration varies only with an explicit seed and preferences influence selection", () => {
    const c = defaultConfig();
    const a = generatePlan(c, ex);
    expect(generatePlan({ ...c, seed: 1 }, ex).program.id).not.toBe(
      a.program.id,
    );
    const preferred = byName("Smith Machine Bench Press");
    expect(
      generatePlan(
        { ...c, preferred: [preferred.id] },
        ex,
      ).program.workouts.some((w) =>
        w.exercises.some((e) => e.exerciseId === preferred.id),
      ),
    ).toBe(true);
  });
  it("rejects constraint violations introduced during customization", () => {
    const c = {
      ...defaultConfig(),
      equipmentMode: "Bodyweight Only" as const,
      equipment: ["Bodyweight" as const],
    };
    const p = generatePlan(c, ex).program;
    p.workouts[0].exercises[0].exerciseId = "e0";
    expect(planIssues(p, ex)).toContain(
      "This plan uses unavailable equipment.",
    );
    p.info!.config!.excluded = ["e0"];
    expect(planIssues(p, ex)).toContain(
      "This plan contains an excluded exercise or movement.",
    );
  });
  it("preview is pure and activation preserves all historical and active snapshots", () => {
    const d = C.initialData();
    const active = C.startSession(
      d.programs[0].workouts[0],
      d.programs[0],
      d.exercises,
    );
    d.active = active;
    active.exercises[0].logs[0] = {
      ...active.exercises[0].logs[0],
      weight: 50,
      reps: 8,
      done: true,
    };
    d.sessions = [C.finishSession(active)];
    const history = structuredClone(d.sessions),
      original = structuredClone(d.programs[0]);
    const p = generatePlan(defaultConfig(), d.exercises).program;
    expect(d.programs).toHaveLength(1);
    savePlan(d, p);
    expect(d.settings.programId).toBe("default");
    savePlan(d, p, true);
    expect(d.settings.programId).toBe(p.id);
    expect(d.sessions).toEqual(history);
    expect(d.active).toEqual(active);
    expect(d.programs[0]).toEqual(original);
    expect(d.programs).toHaveLength(2);
  });
});
describe("v2 migration and backups", () => {
  it("creates a pre-upgrade checkpoint and preserves legacy user edits, history and references", async () => {
    const name = "v2-migration-safety";
    await Dexie.delete(name);
    const old = new Dexie(name);
    old.version(2).stores({ state: "id" });
    const d = C.initialData();
    d.exercises = structuredClone(C.library);
    delete d.catalogVersion;
    delete d.settings.favorites;
    delete d.settings.onboardingDismissed;
    d.programs[0].name = "PPL A/B";
    d.exercises[0].instructions = "My personal cue";
    d.exercises.push({
      ...C.library[0],
      id: "personal-custom",
      name: "My own movement",
    });
    const s = C.startSession(
      d.programs[0].workouts[0],
      d.programs[0],
      d.exercises,
    );
    s.exercises[0].logs[0] = {
      ...C.newSet(),
      done: true,
      weight: 47.5,
      reps: 9,
    };
    d.active = s;
    d.sessions = [C.finishSession(s)];
    const original = structuredClone(d);
    await old.table("state").put({ id: "personal", data: d, revision: 4 });
    old.close();
    const upgraded = new FitDB(name);
    await upgraded.open();
    const saved = (await upgraded.state.get("personal"))!;
    expect(saved.revision).toBe(4);
    expect(saved.data.sessions).toEqual(original.sessions);
    expect(saved.data.active).toEqual(original.active);
    expect(saved.data.programs[0].workouts).toEqual(
      original.programs[0].workouts,
    );
    expect(saved.data.settings.programId).toBe("default");
    expect(saved.data.settings.onboardingDismissed).toBe(true);
    expect(saved.data.exercises.find((e) => e.id === "e0")!.instructions).toBe(
      "My personal cue",
    );
    expect(saved.data.exercises.some((e) => e.id === "personal-custom")).toBe(
      true,
    );
    expect((await upgraded.recovery.get("before-v2-upgrade"))!.data).toEqual(
      original,
    );
    expect(C.upgradeData(saved.data).exercises).toEqual(saved.data.exercises);
    upgraded.close();
    await Dexie.delete(name);
  });
  it("imports v1 backups without losing sessions and exports v2 complete plans/profile/favorites", () => {
    const d = C.initialData();
    d.exercises = structuredClone(C.library);
    const legacy = JSON.stringify({ version: 1, data: d });
    const restored = C.parseBackup(legacy);
    expect(restored.exercises.length).toBeGreaterThanOrEqual(300);
    restored.settings.favorites = ["e0"];
    const p = generatePlan(defaultConfig(), restored.exercises).program;
    savePlan(restored, p, true);
    expect(JSON.parse(C.backup(restored)).version).toBe(2);
    expect(C.parseBackup(C.backup(restored))).toEqual(restored);
  });
  it("persists custom exercises, favorites and generated plans", async () => {
    await db.state.clear();
    await load();
    const d = C.initialData();
    d.exercises.push({
      ...byName("Bench Press"),
      id: "custom-test",
      name: "My Press",
      source: "custom",
    });
    d.settings.favorites = ["custom-test"];
    savePlan(d, generatePlan(defaultConfig(), d.exercises).program);
    await save(d);
    const restored = await load();
    expect(restored.exercises.find((e) => e.id === "custom-test")?.name).toBe(
      "My Press",
    );
    expect(restored.settings.favorites).toEqual(["custom-test"]);
    expect(restored.programs).toHaveLength(2);
    await db.state.clear();
    await load();
  });
});

describe("backup profile safety", () => {
  it("replacing with an older backup clears optional profile fields from the previous dataset", () => {
    const d = C.initialData();
    savePlan(d, generatePlan(defaultConfig(), d.exercises).program, true);
    expect(d.planProfile).toBeDefined();
    const clean = C.initialData();
    C.replacePersonalData(d, clean);
    expect(d.planProfile).toBeUndefined();
    expect(d).toEqual(clean);
  });
  it("rejects malformed v2 metadata and profiles without accepting invalid rep ranges", () => {
    const malformed = C.initialData();
    malformed.exercises[0].synonyms = 123 as unknown as string[];
    expect(() => C.parseBackup(C.backup(malformed))).toThrow();
    const d = C.initialData();
    d.planProfile = { ...defaultConfig(), days: 8 };
    expect(() => C.parseBackup(C.backup(d))).toThrow();
    expect(() => generatePlan({ ...defaultConfig(), repMax: 5 }, ex)).toThrow();
    expect(() =>
      generatePlan({ ...defaultConfig(), repMin: 12, repMax: 6 }, ex),
    ).toThrow();
  });
  it("timed sets and mobility do not become loaded-volume strength records", () => {
    const d = C.initialData();
    const e = byName("Forearm Plank");
    const p = {
      exerciseId: e.id,
      sets: 1,
      min: 20,
      max: 40,
      rest: 60,
      increment: 1,
    };
    const s = C.startSession(
      { id: "timed", name: "Timed", focus: "Core", exercises: [p] },
      d.programs[0],
      ex,
    );
    s.exercises[0].logs[0] = { ...C.newSet(), weight: 5, reps: 30, done: true };
    expect(C.volume(s)).toBe(0);
    expect(C.records([s])).toEqual({});
    const mobility = { ...s.exercises[0], kind: "Mobility" as const };
    expect(C.muscleSetCount(mobility)).toBe(0);
  });
});
it("supports normal cardio durations without treating seconds as repetitions for records", () => {
  const l = { ...C.newSet(), weight: 0, reps: 1800, done: true };
  expect(C.validSet(l, "seconds")).toBe(true);
  expect(C.validSet(l, "reps")).toBe(false);
  expect(C.validSet({ ...l, reps: 90000 }, "seconds")).toBe(false);
});
