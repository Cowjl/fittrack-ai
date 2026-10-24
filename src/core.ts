export type Muscle =
  | "Chest"
  | "Front deltoids"
  | "Side deltoids"
  | "Rear deltoids"
  | "Back"
  | "Traps"
  | "Biceps"
  | "Triceps"
  | "Quadriceps"
  | "Hamstrings"
  | "Adductors"
  | "Calves"
  | "Abdominals";
export const muscles: Muscle[] = [
  "Chest",
  "Front deltoids",
  "Side deltoids",
  "Rear deltoids",
  "Back",
  "Traps",
  "Biceps",
  "Triceps",
  "Quadriceps",
  "Hamstrings",
  "Adductors",
  "Calves",
  "Abdominals",
];
export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  secondary: Muscle[];
  equipment: string;
  instructions: string;
  mistakes: string;
  alternatives: string[];
  category: string;
  rest: number;
  eligible: boolean;
}
export interface PlanExercise {
  exerciseId: string;
  sets: number;
  min: number;
  max: number;
  rest: number;
  increment: number;
}
export interface Workout {
  id: string;
  name: string;
  focus: string;
  exercises: PlanExercise[];
}
export interface Program {
  id: string;
  name: string;
  workouts: Workout[];
}
export interface SetLog {
  id: string;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  warmup: boolean;
  done: boolean;
}
export interface SessionExercise extends PlanExercise {
  name: string;
  muscle: Muscle;
  secondary: Muscle[];
  eligible: boolean;
  logs: SetLog[];
  notes: string;
  feedback: string;
}
export interface Session {
  id: string;
  workoutId: string;
  programId: string;
  name: string;
  start: number;
  end?: number;
  pausedAt?: number;
  pausedMs: number;
  exercises: SessionExercise[];
}
export interface Settings {
  lang: "ar" | "en";
  unit: "kg" | "lb";
  autoRest: boolean;
  sound: boolean;
  rest: number;
  increment: number;
  coach: boolean;
  programId: string;
  lastBackup?: number;
  timerEnd?: number;
  timerRemaining?: number;
}
export interface Data {
  programs: Program[];
  exercises: Exercise[];
  sessions: Session[];
  active: Session | null;
  settings: Settings;
}
const rows: [string, Muscle, string, boolean][] = [
  ["Bench Press", "Chest", "Barbell", true],
  ["Incline Dumbbell Press", "Chest", "Dumbbell", true],
  ["Pec Fly Machine", "Chest", "Machine", false],
  ["Shoulder Press", "Front deltoids", "Machine", true],
  ["Lateral Raises", "Side deltoids", "Dumbbell", false],
  ["Triceps Pushdown", "Triceps", "Cable", false],
  ["Lat Pulldown", "Back", "Cable", true],
  ["Hammer Strength D.Y. Row", "Back", "Machine", true],
  ["Seated Cable Row", "Back", "Cable", true],
  ["Reverse Pec Deck", "Rear deltoids", "Machine", false],
  ["Biceps Curl", "Biceps", "Dumbbell", false],
  ["Hammer Curl", "Biceps", "Dumbbell", false],
  ["Squat", "Quadriceps", "Barbell", true],
  ["Leg Press", "Quadriceps", "Machine", true],
  ["Seated Leg Curl", "Hamstrings", "Machine", false],
  ["Hip Adduction", "Adductors", "Machine", false],
  ["Standing Calf Raises", "Calves", "Machine", false],
  ["Machine Abdominal Crunch", "Abdominals", "Machine", false],
  ["Incline Bench Press", "Chest", "Barbell", true],
  ["Decline Chest Press Machine", "Chest", "Machine", true],
  ["High to Low Cable Fly", "Chest", "Cable", false],
  ["Dumbbell Shoulder Press", "Front deltoids", "Dumbbell", true],
  ["Cable Lateral Raises", "Side deltoids", "Cable", false],
  ["Overhead Triceps Extension", "Triceps", "Cable", false],
  ["Pull-ups", "Back", "Bodyweight", false],
  ["T-Bar Row", "Back", "Machine", true],
  ["Dumbbell/Machine Shrugs", "Traps", "Dumbbell / Machine", false],
  ["Face Pull", "Rear deltoids", "Cable", false],
  ["Biceps Curl Machine", "Biceps", "Machine", false],
  ["Incline Dumbbell Curl", "Biceps", "Dumbbell", false],
  ["Hack Squat", "Quadriceps", "Machine", true],
  ["Leg Extension", "Quadriceps", "Machine", false],
  ["Lying Leg Curl", "Hamstrings", "Machine", false],
  ["Seated Calf Raises", "Calves", "Machine", false],
  ["Hanging Knee Raises", "Abdominals", "Bodyweight", false],
];
const cues: Record<string, string> = {
  Chest:
    "Set your shoulders against the support. Keep wrists stacked over elbows. Lower under control and press or bring your arms together without bouncing.",
  Back: "Brace your trunk and keep your spine neutral. Pull elbows toward your torso; return slowly without swinging.",
  Quadriceps:
    "Brace your trunk. Keep knees tracking with your toes and heels planted. Lower to a comfortable controlled depth, then drive up.",
  Hamstrings:
    "Align your knees with the machine pivot. Keep hips against the pad. Curl smoothly, pause, then extend under control.",
  Calves:
    "Use a stable support. Lower heels through a comfortable range, rise onto your toes and pause without bouncing.",
  Abdominals:
    "Exhale as you curl your pelvis toward your ribs. Avoid pulling with your neck or swinging your legs.",
  Adductors:
    "Align the pads comfortably inside your knees. Bring legs together slowly and return without forcing your hips.",
};
export const library: Exercise[] = rows.map(
  ([name, muscle, equipment, eligible], i) => ({
    id: "e" + i,
    name,
    muscle,
    secondary:
      muscle === "Chest"
        ? ["Triceps", "Front deltoids"]
        : muscle === "Back"
          ? ["Biceps"]
          : muscle === "Quadriceps"
            ? ["Hamstrings"]
            : [],
    equipment,
    eligible,
    category: eligible ? "Compound" : "Isolation / bodyweight",
    rest: eligible ? 120 : 90,
    instructions:
      cues[muscle] ||
      "Choose a stable position and a comfortable range of motion. Move the target joint smoothly, keep your trunk braced and control the return. Stop if you feel sharp pain.",
    mistakes:
      "Using momentum, rushing the lowering phase, forcing a painful range, or choosing a load you cannot control.",
    alternatives: rows
      .filter((r) => r[1] === muscle && r[0] !== name)
      .map((r) => r[0]),
  }),
);
const spec: [string, string, [number, number, number, number][]][] = [
  [
    "Push A",
    "Chest · Shoulders · Triceps",
    [
      [0, 3, 6, 10],
      [1, 2, 8, 12],
      [2, 2, 12, 15],
      [3, 2, 8, 12],
      [4, 3, 12, 15],
      [5, 2, 10, 15],
    ],
  ],
  [
    "Pull A",
    "Back · Rear delts · Biceps",
    [
      [6, 3, 8, 12],
      [7, 3, 8, 12],
      [8, 2, 10, 12],
      [9, 3, 12, 15],
      [10, 2, 10, 12],
      [11, 2, 10, 12],
    ],
  ],
  [
    "Legs A",
    "Quadriceps",
    [
      [12, 3, 6, 10],
      [13, 2, 10, 12],
      [14, 2, 10, 15],
      [15, 2, 12, 15],
      [16, 3, 12, 15],
      [17, 2, 12, 15],
    ],
  ],
  [
    "Push B",
    "Chest · Shoulders · Triceps",
    [
      [18, 3, 8, 12],
      [19, 2, 10, 12],
      [20, 2, 12, 15],
      [21, 2, 8, 12],
      [22, 3, 12, 15],
      [23, 2, 10, 15],
    ],
  ],
  [
    "Pull B",
    "Back · Traps · Biceps",
    [
      [24, 3, 6, 10],
      [25, 3, 8, 12],
      [26, 3, 10, 15],
      [27, 2, 12, 15],
      [28, 2, 10, 12],
      [29, 2, 10, 12],
    ],
  ],
  [
    "Legs B",
    "Hamstrings",
    [
      [14, 3, 10, 12],
      [30, 3, 8, 12],
      [31, 2, 12, 15],
      [32, 2, 10, 15],
      [33, 3, 12, 15],
      [34, 2, 12, 15],
    ],
  ],
];
export const defaultProgram = (): Program => ({
  id: "default",
  name: "PPL A/B",
  workouts: spec.map(([name, focus, es], i) => ({
    id: "w" + i,
    name,
    focus,
    exercises: es.map(([n, sets, min, max]) => ({
      exerciseId: "e" + n,
      sets,
      min,
      max,
      rest: library[n].rest,
      increment: 2.5,
    })),
  })),
});
export const initialData = (): Data => ({
  programs: [defaultProgram()],
  exercises: structuredClone(library),
  sessions: [],
  active: null,
  settings: {
    lang: "ar",
    unit: "kg",
    autoRest: true,
    sound: false,
    rest: 90,
    increment: 2.5,
    coach: true,
    programId: "default",
  },
});
export const uid = () => crypto.randomUUID();
export const newSet = (warmup = false): SetLog => ({
  id: uid(),
  weight: null,
  reps: null,
  rir: null,
  warmup,
  done: false,
});
export function nextWorkout(p: Program, s: Session[]) {
  const last = [...s]
    .filter((x) => x.programId === p.id && x.end)
    .sort((a, b) => b.end! - a.end!)[0];
  return p.workouts[
    (p.workouts.findIndex((w) => w.id === last?.workoutId) + 1) %
      p.workouts.length
  ];
}
export function startSession(
  w: Workout,
  p: Program,
  ex: Exercise[],
  now = Date.now(),
): Session {
  return {
    id: uid(),
    workoutId: w.id,
    programId: p.id,
    name: w.name,
    start: now,
    pausedMs: 0,
    exercises: w.exercises.map((e) => {
      const x = ex.find((x) => x.id === e.exerciseId)!;
      return {
        ...e,
        name: x.name,
        muscle: x.muscle,
        secondary: [...x.secondary],
        eligible: x.eligible,
        notes: "",
        feedback: "",
        logs: Array.from({ length: e.sets }, () => newSet()),
      };
    }),
  };
}
export function validSet(s: SetLog) {
  return (
    typeof s.weight === "number" &&
    Number.isFinite(s.weight) &&
    s.weight >= 0 &&
    s.weight <= 2000 &&
    typeof s.reps === "number" &&
    Number.isInteger(s.reps) &&
    s.reps > 0 &&
    s.reps <= 1000 &&
    (s.rir === null || (Number.isFinite(s.rir) && s.rir >= 0 && s.rir <= 10))
  );
}
export const working = (e: SessionExercise) =>
  e.logs.filter((s) => s.done && !s.warmup && validSet(s));
export const volume = (s: Session) =>
  s.exercises.reduce(
    (n, e) => n + working(e).reduce((v, x) => v + x.weight! * x.reps!, 0),
    0,
  );
export const duration = (s: Session) =>
  Math.max(
    0,
    ((s.end || s.pausedAt || Date.now()) - s.start - s.pausedMs) / 60000,
  );
export function finishSession(s: Session, now = Date.now()): Session {
  if (!s.exercises.some((e) => working(e).length))
    throw Error("Log at least one working set.");
  return {
    ...structuredClone(s),
    end: now,
    pausedMs: s.pausedMs + (s.pausedAt ? now - s.pausedAt : 0),
    pausedAt: undefined,
  };
}
export function coach(
  e: PlanExercise,
  history: Session[],
  now = Date.now(),
): { key: string; weight?: number } {
  const past = [...history]
    .filter(
      (s) =>
        s.end &&
        s.exercises.some(
          (x) => x.exerciseId === e.exerciseId && working(x).length,
        ),
    )
    .sort((a, b) => b.end! - a.end!);
  if (!past.length) return { key: "insufficient" };
  const x = past[0].exercises.find((x) => x.exerciseId === e.exerciseId)!;
  const sets = working(x);
  const weight = sets[0].weight!;
  if (now - past[0].end! > 21 * 86400000)
    return { key: "return", weight: Math.round(weight * 0.9 * 10) / 10 };
  if (x.feedback || sets.some((s) => s.rir !== null && s.rir < 1))
    return { key: "reduce", weight };
  if (
    sets.length >= e.sets &&
    sets.every(
      (s) =>
        s.weight === weight &&
        s.reps! >= e.max &&
        (s.rir === null || s.rir >= 1),
    )
  )
    return { key: "increase", weight: weight + e.increment };
  return { key: "keep", weight };
}
export const e1rm = (s: SetLog, eligible: boolean) =>
  eligible && s.weight! > 0 && s.reps! >= 1 && s.reps! <= 10
    ? s.weight! * (1 + s.reps! / 30)
    : null;
export function records(sessions: Session[]) {
  const result: Record<
    string,
    {
      name: string;
      weight: number;
      estimate: number;
      reps: Record<string, number>;
    }
  > = {};
  sessions.forEach((s) =>
    s.exercises.forEach((e) =>
      working(e).forEach((x) => {
        const r = result[e.exerciseId] || {
          name: e.name,
          weight: 0,
          estimate: 0,
          reps: {},
        };
        r.weight = Math.max(r.weight, x.weight!);
        r.estimate = Math.max(r.estimate, e1rm(x, e.eligible) || 0);
        r.reps[x.weight!] = Math.max(r.reps[x.weight!] || 0, x.reps!);
        result[e.exerciseId] = r;
      }),
    ),
  );
  return result;
}
export function backup(data: Data) {
  return JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), data },
    null,
    2,
  );
}
export function parseBackup(text: string): Data {
  const envelope = JSON.parse(text, (key, value) => {
    if (["__proto__", "constructor", "prototype"].includes(key))
      throw Error("Invalid backup");
    return value;
  });
  if (!envelope || envelope.version !== 1 || !envelope.data)
    throw Error("Unsupported backup");
  const d = envelope.data as Data;
  const assert = (condition: unknown, message: string) => {
    if (!condition) throw Error(message);
  };
  const num = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
  const str = (v: unknown) => typeof v === "string" && v.length > 0;
  const prescription = (e: PlanExercise) =>
    str(e.exerciseId) &&
    Number.isInteger(e.sets) &&
    num(e.sets, 1, 30) &&
    Number.isInteger(e.min) &&
    num(e.min, 1, 1000) &&
    Number.isInteger(e.max) &&
    num(e.max, e.min, 1000) &&
    num(e.rest, 1, 3600) &&
    num(e.increment, 0.01, 100);
  assert(
    Array.isArray(d.programs) &&
      d.programs.length &&
      Array.isArray(d.exercises) &&
      d.exercises.length &&
      Array.isArray(d.sessions) &&
      d.settings &&
      (d.active === null || typeof d.active === "object"),
    "Invalid backup",
  );
  const ids = new Set<string>();
  d.exercises.forEach((e) => {
    assert(
      e &&
        str(e.id) &&
        !ids.has(e.id) &&
        str(e.name) &&
        muscles.includes(e.muscle) &&
        Array.isArray(e.secondary) &&
        e.secondary.every((m) => muscles.includes(m)) &&
        str(e.equipment) &&
        str(e.instructions) &&
        typeof e.mistakes === "string" &&
        Array.isArray(e.alternatives) &&
        e.alternatives.every(str) &&
        str(e.category) &&
        num(e.rest, 1, 3600) &&
        typeof e.eligible === "boolean",
      "Invalid exercise",
    );
    ids.add(e.id);
  });
  const programIds = new Set<string>();
  d.programs.forEach((p) => {
    assert(
      p &&
        str(p.id) &&
        !programIds.has(p.id) &&
        str(p.name) &&
        Array.isArray(p.workouts) &&
        p.workouts.length,
      "Invalid program",
    );
    programIds.add(p.id);
    const workoutIds = new Set<string>();
    p.workouts.forEach((w) => {
      assert(
        w &&
          str(w.id) &&
          !workoutIds.has(w.id) &&
          str(w.name) &&
          typeof w.focus === "string" &&
          Array.isArray(w.exercises) &&
          w.exercises.length,
        "Invalid workout",
      );
      workoutIds.add(w.id);
      w.exercises.forEach((e) =>
        assert(
          e && prescription(e) && ids.has(e.exerciseId),
          "Invalid prescription",
        ),
      );
    });
  });
  const sessionIds = new Set<string>();
  const validateSession = (s: Session, completed: boolean) => {
    assert(
      s &&
        str(s.id) &&
        !sessionIds.has(s.id) &&
        str(s.workoutId) &&
        str(s.programId) &&
        str(s.name) &&
        num(s.start) &&
        num(s.pausedMs) &&
        (completed ? num(s.end, s.start) : s.end === undefined) &&
        (s.pausedAt === undefined || num(s.pausedAt, s.start)) &&
        Array.isArray(s.exercises),
      "Invalid session",
    );
    sessionIds.add(s.id);
    s.exercises.forEach((e) => {
      assert(
        e &&
          prescription(e) &&
          str(e.name) &&
          muscles.includes(e.muscle) &&
          Array.isArray(e.secondary) &&
          e.secondary.every((m) => muscles.includes(m)) &&
          typeof e.eligible === "boolean" &&
          typeof e.notes === "string" &&
          typeof e.feedback === "string" &&
          Array.isArray(e.logs),
        "Invalid session exercise",
      );
      const logIds = new Set<string>();
      e.logs.forEach((l) => {
        assert(
          l &&
            str(l.id) &&
            !logIds.has(l.id) &&
            typeof l.done === "boolean" &&
            typeof l.warmup === "boolean" &&
            (l.weight === null || num(l.weight, 0, 2000)) &&
            (l.reps === null ||
              (Number.isInteger(l.reps) && num(l.reps, 1, 1000))) &&
            (l.rir === null || num(l.rir, 0, 10)) &&
            (!l.done || validSet(l)),
          "Invalid set",
        );
        logIds.add(l.id);
      });
    });
  };
  d.sessions.forEach((s) => validateSession(s, true));
  if (d.active) validateSession(d.active, false);
  const s = d.settings;
  assert(
    ["ar", "en"].includes(s.lang) &&
      ["kg", "lb"].includes(s.unit) &&
      programIds.has(s.programId) &&
      num(s.increment, 0.01, 100) &&
      num(s.rest, 1, 3600) &&
      ["autoRest", "sound", "coach"].every(
        (k) => typeof s[k as keyof Settings] === "boolean",
      ) &&
      (s.lastBackup === undefined || num(s.lastBackup)) &&
      (s.timerEnd === undefined || num(s.timerEnd)) &&
      (s.timerRemaining === undefined || num(s.timerRemaining, 0, 86400)),
    "Invalid settings",
  );
  return d;
}
