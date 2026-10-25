import { checkConfig } from "./validation";
import type {
  Exercise,
  Muscle,
  PlanExercise,
  Program,
  Data,
  Workout,
} from "../core";
import { canUse, equipment } from "../catalog";
import {
  defaultConfig,
  goals,
  type PlanConfig,
  type ProgramInfo,
} from "./types";
export const hash = (s: string) => {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
};
export const estimateExercise = (p: PlanExercise, e?: Exercise) => {
  const seconds =
    e?.tracking === "seconds" ? (p.min + p.max) / 2 : ((p.min + p.max) / 2) * 3;
  return (p.sets * seconds + Math.max(0, p.sets - 1) * p.rest + 60) / 60;
};
export const estimateWorkout = (w: Workout, exercises: Exercise[]) =>
  Math.ceil(
    5 +
      w.exercises.reduce(
        (n, e) =>
          n +
          estimateExercise(
            e,
            exercises.find((x) => x.id === e.exerciseId),
          ),
        0,
      ),
  );
export function weeklyVolume(program: Program, exercises: Exercise[]) {
  const counts: Record<string, number> = {};
  for (const w of program.workouts.filter((w) => !w.recovery))
    for (const p of w.exercises) {
      const e = exercises.find((x) => x.id === p.exerciseId);
      if (e && e.kind !== "Mobility" && e.kind !== "Conditioning")
        counts[e.muscle] = (counts[e.muscle] || 0) + p.sets;
    }
  return counts;
}
export function validateConfig(c: PlanConfig) {
  if (!checkConfig(c))
    throw Error("Check days, time and equipment before generating.");
  if (c.repMin !== undefined || c.repMax !== undefined) {
    if (
      typeof c.repMin !== "number" ||
      typeof c.repMax !== "number" ||
      !Number.isInteger(c.repMin) ||
      !Number.isInteger(c.repMax) ||
      c.repMin < 1 ||
      c.repMax < c.repMin ||
      c.repMax > 30
    )
      throw Error("Check the preferred rep range.");
  }
}
const anchors = [
  "Bench Press",
  "Dumbbell Bench Press",
  "Dumbbell Floor Press",
  "Machine Chest Press",
  "Push-up",
  "Incline Push-up",
  "Lat Pulldown",
  "Seated Cable Row",
  "Machine Pulldown",
  "Resistance Band Row",
  "Dumbbell Bent Over Row",
  "Inverted Row",
  "Bodyweight Squat",
  "Goblet Squat",
  "Squat",
  "Leg Press",
  "Romanian Deadlift",
  "Dumbbell Romanian Deadlift",
  "Seated Leg Curl",
  "Sliding Leg Curl",
  "Dumbbell Shoulder Press",
  "Shoulder Press",
  "Lateral Raises",
  "Biceps Curl",
  "Triceps Pushdown",
  "Bodyweight Standing Calf Raise",
  "Floor Crunch",
  "Dead Bug",
  "Prone W Raise",
];
const musclesByDay: Record<string, Muscle[]> = {
  Full: [
    "Quadriceps",
    "Chest",
    "Back",
    "Hamstrings",
    "Side deltoids",
    "Abdominals",
    "Biceps",
    "Triceps",
    "Calves",
  ],
  Upper: [
    "Chest",
    "Back",
    "Side deltoids",
    "Back",
    "Triceps",
    "Biceps",
    "Front deltoids",
  ],
  Lower: [
    "Quadriceps",
    "Hamstrings",
    "Calves",
    "Abdominals",
    "Quadriceps",
    "Hamstrings",
  ],
  Push: ["Chest", "Front deltoids", "Triceps", "Side deltoids", "Chest"],
  Pull: ["Back", "Back", "Rear deltoids", "Biceps", "Traps"],
  Legs: [
    "Quadriceps",
    "Hamstrings",
    "Calves",
    "Abdominals",
    "Quadriceps",
    "Hamstrings",
  ],
};
function split(days: number) {
  if (days <= 3)
    return Array.from({ length: days }, (_, i) => ({
      name: days === 1 ? "Full Body" : `Full Body ${"ABC"[i]}`,
      type: "Full",
    }));
  if (days === 4)
    return ["Upper A", "Lower A", "Upper B", "Lower B"].map((name) => ({
      name,
      type: name.split(" ")[0],
    }));
  if (days === 5)
    return ["Upper", "Lower", "Push", "Pull", "Legs"].map((name) => ({
      name,
      type: name,
    }));
  return ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"].map(
    (name) => ({ name, type: name.split(" ")[0] }),
  );
}
export interface GenerationResult {
  program: Program;
  warnings: string[];
  canActivate: boolean;
}
export function generatePlan(
  config: PlanConfig,
  exercises: Exercise[],
): GenerationResult {
  const c = structuredClone(config);
  validateConfig(c);
  c.equipment = [...new Set(c.equipment)].sort();
  c.excluded = [...new Set(c.excluded)].sort();
  c.preferred = [...new Set(c.preferred)].sort();
  c.disliked = [...new Set(c.disliked)].sort();
  c.limitations = [...new Set(c.limitations)].sort();
  c.priorities = Object.fromEntries(
    Object.entries(c.priorities).sort(([a], [b]) => a.localeCompare(b)),
  );
  const key = hash(JSON.stringify(c)),
    warnings: string[] = [];
  const strength = c.goal === "Maximal Strength",
    returning = c.goal === "Return to Training",
    endurance = c.goal === "Muscular Endurance";
  const pool = exercises
    .filter((e) => e.source !== "custom" || !!e.pattern)
    .filter(
      (e) =>
        canUse(e, c.equipment) &&
        !c.excluded.includes(e.id) &&
        !c.limitations.includes(e.pattern!) &&
        (c.experience === "Advanced" || e.difficulty !== "Advanced") &&
        e.kind !== "Mobility" &&
        e.kind !== "Conditioning",
    );
  const used = new Map<string, number>();
  const workouts: Workout[] = [];
  const priority = (e: Exercise) =>
    c.priorities[e.muscle] ||
    (e.regions || []).map((r) => c.priorities[r]).find(Boolean) ||
    "Maintain";
  function choose(muscle: Muscle, current: PlanExercise[], slot: number) {
    return pool
      .filter(
        (e) =>
          e.muscle === muscle &&
          !current.some((x) => x.exerciseId === e.id) &&
          !(
            (e.muscle === "Glutes" || e.muscle === "Hip abductors") &&
            priority(e) === "Reduce"
          ),
      )
      .map((e) => {
        const machine = [
          "Selectorized Machine",
          "Plate-loaded Machine",
          "Smith Machine",
        ].includes(equipment(e));
        const score =
          (anchors.includes(e.name) ? 60 : 0) +
          (c.preferred.includes(e.id) ? 120 : 0) -
          (c.disliked.includes(e.id) ? 100 : 0) +
          (priority(e) === "Prioritize"
            ? 25
            : priority(e) === "Reduce"
              ? -50
              : 0) +
          (c.preference === "Machines" && machine
            ? 30
            : c.preference === "Free weights" &&
                ["Dumbbell", "Barbell", "Kettlebell"].includes(equipment(e))
              ? 30
              : 0) +
          (strength && e.kind === "Compound" ? 30 : 0) -
          (current.some((p) => {
            const old = exercises.find((x) => x.id === p.exerciseId);
            return old?.muscle === muscle && old?.pattern === e.pattern;
          })
            ? 25
            : 0) -
          (e.difficulty === "Advanced" ? 40 : 0) -
          (used.get(e.id) || 0) * 7 +
          (e.regions?.includes("Upper chest") &&
          c.priorities["Upper chest"] === "Prioritize"
            ? 40
            : 0) +
          (c.seed === 0
            ? 0
            : parseInt(hash(e.id + ":" + c.seed + ":" + slot), 36) % 19);
        return { e, score };
      })
      .sort((a, b) => b.score - a.score || a.e.id.localeCompare(b.e.id))[0]?.e;
  }
  const definitions = split(c.days);
  for (let i = 0; i < definitions.length; i++) {
    const def = definitions[i];
    const w: Workout = {
      id: `gen-${key}-w${i}`,
      name: def.name,
      focus: musclesByDay[def.type].slice(0, 4).join(" · "),
      exercises: [],
      weekday: c.weekdays.length === c.days ? c.weekdays[i] : undefined,
    };
    const base = returning || c.experience === "Beginner" ? 2 : 3;
    const targets = [...musclesByDay[def.type]];
    const priorityMuscles = Object.entries(c.priorities)
      .filter(([, v]) => v === "Prioritize")
      .map(([m]) => (m === "Upper chest" ? "Chest" : (m as Muscle)))
      .filter(
        (m) =>
          def.type === "Full" ||
          (["Lower", "Legs"].includes(def.type)
            ? [
                "Quadriceps",
                "Hamstrings",
                "Glutes",
                "Adductors",
                "Hip abductors",
                "Calves",
                "Abdominals",
                "Tibialis anterior",
              ].includes(m)
            : def.type === "Upper"
              ? [
                  "Chest",
                  "Back",
                  "Front deltoids",
                  "Side deltoids",
                  "Rear deltoids",
                  "Biceps",
                  "Triceps",
                  "Traps",
                  "Forearms",
                ].includes(m)
              : targets.includes(m)),
      );
    // Priority accessories replace later optional slots; essentials keep their places.
    const essentials =
      def.type === "Full"
        ? 4
        : def.type === "Upper"
          ? 2
          : def.type === "Lower" || def.type === "Legs"
            ? 2
            : 2;
    if (priorityMuscles.length)
      targets.splice(essentials, 0, ...priorityMuscles);
    let time = 5;
    for (let slot = 0; slot < targets.length; slot++) {
      if (w.exercises.length >= (c.minutes <= 30 ? 5 : c.minutes <= 45 ? 6 : 8))
        break;
      const muscle = targets[slot];
      const e = choose(muscle, w.exercises, slot + i * 20);
      if (!e) {
        if (slot < essentials)
          warnings.push(
            "An essential movement could not be selected with the current equipment or exclusions.",
          );
        continue;
      }
      const repMin =
          e.tracking === "seconds"
            ? 20
            : (c.repMin ??
              (strength && e.kind === "Compound"
                ? 3
                : endurance
                  ? 12
                  : e.kind === "Isolation"
                    ? 10
                    : 8)),
        repMax =
          e.tracking === "seconds"
            ? 40
            : (c.repMax ??
              (strength && e.kind === "Compound"
                ? 6
                : endurance
                  ? 20
                  : e.kind === "Isolation"
                    ? 15
                    : 12));
      const rest =
        strength && e.kind === "Compound"
          ? 180
          : e.kind === "Compound"
            ? 120
            : 75;
      let sets = Math.max(
        1,
        Math.min(
          4,
          base +
            c.setsAdjustment +
            (priority(e) === "Prioritize"
              ? 1
              : priority(e) === "Reduce"
                ? -1
                : 0),
        ),
      );
      const plan: PlanExercise = {
        exerciseId: e.id,
        sets,
        min: repMin,
        max: repMax,
        rest,
        increment: 2.5,
      };
      while (
        sets > 1 &&
        time + estimateExercise({ ...plan, sets }, e) > c.minutes
      ) {
        sets--;
      }
      plan.sets = sets;
      const cost = estimateExercise(plan, e);
      if (time + cost > c.minutes) continue;
      time += cost;
      w.exercises.push(plan);
      used.set(e.id, (used.get(e.id) || 0) + 1);
    }
    workouts.push(w);
  }
  if (c.days === 7) {
    const recovery = exercises
      .filter(
        (e) =>
          (e.kind === "Mobility" || e.kind === "Conditioning") &&
          e.difficulty !== "Advanced" &&
          canUse(e, c.equipment) &&
          !c.excluded.includes(e.id) &&
          !c.limitations.includes(e.pattern!),
      )
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, 3);
    if (recovery.length)
      workouts.push({
        id: `gen-${key}-recovery`,
        name: "Active Recovery",
        focus: "Easy movement · comfortable pace",
        recovery: true,
        weekday: c.weekdays[6],
        exercises: recovery.map((e) => ({
          exerciseId: e.id,
          sets: 1,
          min: 20,
          max: 60,
          rest: 30,
          increment: 1,
        })),
      });
    warnings.push(
      "Seven available days includes six lifting sessions and one easy recovery day, not seven hard sessions.",
    );
  }
  if (c.days === 1)
    warnings.push(
      "One weekly session is useful, but twice-weekly muscle practice is not possible at this frequency.",
    );
  if (c.days >= 2 && c.weekdays.length && c.weekdays.length !== c.days)
    warnings.push(
      "Weekday selection does not match available days; the plan uses a flexible sequence.",
    );
  if (
    c.days <= 3 &&
    c.weekdays.some(
      (day, i) =>
        i > 0 && weekdayIndex(day) - weekdayIndex(c.weekdays[i - 1]) === 1,
    )
  )
    warnings.push(
      "Consecutive full-body days reduce recovery time. Spread them out when possible.",
    );
  if (c.goal === "Fat Loss Support")
    warnings.push(
      "Resistance training supports strength and activity; it does not guarantee fat loss. Nutrition and overall activity also matter.",
    );
  if (c.limitations.length)
    warnings.push(
      "Excluded movement patterns are respected. This tool cannot diagnose injuries; seek qualified guidance if safe exercise choice is uncertain.",
    );
  if (c.equipmentMode === "Bodyweight Only")
    warnings.push(
      "Without a bar, bands or weights, back loading and maximal-strength progression are limited.",
    );
  const program: Program = {
    id: `generated-${key}`,
    name: `${c.goal} · ${Math.min(c.days, 6)} days`,
    source: "generated",
    workouts,
    info: {
      description:
        "A local, rule-based plan shaped by your schedule, equipment and preferences.",
      goal: c.goal,
      difficulty: c.experience,
      frequency: Math.min(c.days, 6),
      equipment: c.equipment,
      progression:
        "Double progression: add repetitions within the range, then consider your configured load increment when all working sets reach the top with controlled effort. Return after a break with a lighter starting load.",
      rationale:
        c.days <= 3
          ? "Full-body sessions distribute essential movements across fewer available days."
          : c.days <= 5
            ? "Upper/lower and complementary sessions spread weekly volume with recovery between repeated muscle exposures."
            : "Push/pull/legs alternates muscle groups and offers two exposures per week when followed in sequence.",
      warnings: [],
      config: c,
    },
  };
  for (const m of ["Chest", "Back", "Quadriceps", "Hamstrings"])
    if (
      !workouts.some((w) =>
        w.exercises.some(
          (p) => exercises.find((e) => e.id === p.exerciseId)?.muscle === m,
        ),
      )
    )
      warnings.push(
        "Weekly muscle coverage is incomplete. Add equipment, allow another exercise or increase available time before activating.",
      );
  const volume = weeklyVolume(program, exercises);
  if (c.days > 1 && Object.values(volume).some((s) => s > 20))
    warnings.push(
      "Some direct weekly set totals are high. Reduce the set adjustment or priorities if recovery is difficult.",
    );
  for (const m of ["Chest", "Back", "Quadriceps", "Hamstrings"]) {
    const exposures = workouts.filter((w) =>
      w.exercises.some(
        (p) => exercises.find((e) => e.id === p.exerciseId)?.muscle === m,
      ),
    ).length;
    if (c.days >= 2 && exposures < 2)
      warnings.push(
        "Some muscles receive fewer than two direct weekly exposures under these constraints.",
      );
  }
  const unique = [...new Set(warnings)];
  program.info!.warnings = unique;
  return {
    program,
    warnings: unique,
    canActivate:
      !unique.includes(
        "Weekly muscle coverage is incomplete. Add equipment, allow another exercise or increase available time before activating.",
      ) &&
      workouts.length >= Math.min(c.days, 6) &&
      workouts.every((w) => w.exercises.length > 0),
  };
}
function weekdayIndex(day: string) {
  return [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ].indexOf(day);
}
export function duplicateProgram(p: Program, id: string): Program {
  const copy = structuredClone(p);
  copy.id = id;
  copy.name = p.name + " · Copy";
  copy.source = "custom";
  copy.workouts = copy.workouts.map((w, i) => ({ ...w, id: `${id}-w${i}` }));
  return copy;
}
export function savePlan(data: Data, program: Program, activate = false) {
  if (
    !program.workouts.length ||
    program.workouts.some((w) => !w.exercises.length)
  )
    throw Error("This plan has an empty workout.");
  const issues = planIssues(program, data.exercises);
  if (issues.length) throw Error(issues[0]);
  const snapshot = structuredClone(program);
  const existing = data.programs.findIndex((p) => p.id === program.id);
  if (existing < 0) data.programs.push(snapshot);
  else data.programs[existing] = snapshot;
  if (activate) {
    data.settings.activationHistory = [
      ...(data.settings.activationHistory || []),
      data.settings.programId,
    ].slice(-20);
    data.settings.programId = program.id;
  }
  if (program.info?.config)
    data.planProfile = structuredClone(program.info.config);
  data.settings.onboardingDismissed = true;
}
export { defaultConfig };
export function planIssues(program: Program, exercises: Exercise[]): string[] {
  const c = program.info?.config,
    issues: string[] = [];
  const used = new Map(exercises.map((e) => [e.id, e]));
  if (
    !program.workouts.length ||
    program.workouts.some((w) => !w.exercises.length)
  )
    issues.push("This plan has an empty workout.");
  for (const w of program.workouts) {
    if (
      new Set(w.exercises.map((p) => p.exerciseId)).size !== w.exercises.length
    )
      issues.push("Remove duplicate exercises within a workout.");
    for (const p of w.exercises) {
      if (
        !Number.isInteger(p.sets) ||
        p.sets < 1 ||
        p.sets > 30 ||
        !Number.isInteger(p.min) ||
        p.min < 1 ||
        !Number.isInteger(p.max) ||
        p.max < p.min ||
        p.max > 1000 ||
        !Number.isFinite(p.rest) ||
        p.rest < 1 ||
        !Number.isFinite(p.increment) ||
        p.increment <= 0
      )
        issues.push("Invalid prescription");
      const e = used.get(p.exerciseId);
      if (!e) {
        issues.push("An exercise is unavailable.");
        continue;
      }
      if (c) {
        if (!canUse(e, c.equipment))
          issues.push("This plan uses unavailable equipment.");
        if (c.excluded.includes(e.id) || c.limitations.includes(e.pattern!))
          issues.push("This plan contains an excluded exercise or movement.");
      }
    }
    if (c && estimateWorkout(w, exercises) > c.minutes)
      issues.push("This plan exceeds the selected session duration.");
  }
  if (c)
    for (const m of ["Chest", "Back", "Quadriceps", "Hamstrings"])
      if (
        !program.workouts.some((w) =>
          w.exercises.some((p) => used.get(p.exerciseId)?.muscle === m),
        )
      )
        issues.push(
          "Weekly muscle coverage is incomplete. Add equipment, allow another exercise or increase available time before activating.",
        );
  return [...new Set(issues)];
}
