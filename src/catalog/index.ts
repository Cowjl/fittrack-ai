import type { Exercise, Muscle } from "../core";
import { catalogRows } from "./rows";
import { guidance } from "./guidance";
import type { CatalogRow, Pattern, EquipmentType } from "./types";
export * from "./types";
export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export function movement(e: Exercise): Pattern | undefined {
  return e.pattern;
}
export function equipment(e: Exercise): EquipmentType {
  return (
    e.equipmentType ||
    (
      {
        Machine: "Selectorized Machine",
        "Dumbbell / Machine": "Dumbbell",
      } as Record<string, EquipmentType>
    )[e.equipment] ||
    (e.equipment as EquipmentType)
  );
}
function make(row: CatalogRow, legacy?: Exercise): Exercise {
  let pattern = row.pattern;
  if (row.name === "Bird Dog") pattern = "Core Stabilization";
  if (row.name === "Hamstring Walkout") pattern = "Knee Flexion";
  if (row.muscle === "Tibialis anterior") pattern = "Ankle Dorsiflexion";
  if (row.muscle === "Forearms" && pattern === "Shoulder Isolation")
    pattern = row.name.includes("Reverse")
      ? "Wrist Extension"
      : row.name.includes("Pronation")
        ? "Forearm Rotation"
        : row.name.includes("Pinch")
          ? "Grip"
          : "Wrist Flexion";
  const guide = guidance[pattern];
  const timed =
    row.kind === "Mobility" ||
    row.kind === "Conditioning" ||
    row.pattern === "Carry" ||
    /Plank$|Wall Sit|Hollow Body Hold|Pinch Hold/.test(row.name);
  const advanced =
    /Archer|Handstand|Pistol Squat$|Nordic Hamstring|Ab Wheel|Z Press|Meadows|Renegade|Pendlay|Kettlebell Clean/.test(
      row.name,
    ) && !row.name.includes("Assisted");
  const unilateral =
    /Single|One Arm|Alternating|Split Squat|Lunge|Step-up|Suitcase|Side Plank|Side Lying|Meadows/.test(
      row.name,
    );
  const secondary: Muscle[] =
    (row.secondary as Muscle[]) ||
    (row.kind === "Compound"
      ? row.pattern === "Horizontal Push"
        ? ["Triceps", "Front deltoids"]
        : row.pattern === "Vertical Push"
          ? ["Triceps", "Side deltoids"]
          : row.pattern.includes("Pull")
            ? ["Biceps", "Rear deltoids"]
            : ["Squat", "Lunge"].includes(row.pattern)
              ? ["Glutes", "Adductors"]
              : row.pattern === "Hip Hinge"
                ? ["Glutes", "Spinal erectors"]
                : []
      : []);
  const extra: EquipmentType[] = [];
  if (
    /Bench Press|Incline Dumbbell|Decline Dumbbell|Dumbbell Fly|Preacher|Chest Supported|Seal Row|Incline Push-up|Decline Push-up|Dumbbell Step-up|Dumbbell Bulgarian|Reverse Nordic|Nordic Hamstring|Wall Handstand|Box Squat|Box Step|Seated Calf/.test(
      row.name,
    ) &&
    !["Selectorized Machine", "Plate-loaded Machine", "Smith Machine"].includes(
      row.equipment,
    )
  )
    extra.push("Other");
  if (row.name === "Inverted Row") extra.push("Other");
  if (row.name === "Band Assisted Pull-up") extra.push("Pull-up Bar");
  if (row.name === "Assisted Nordic Curl") extra.push("Other");
  const safety =
    "Use a controllable load and stable equipment. Stop if you feel sharp pain, dizziness or unusual symptoms. This is exercise guidance, not injury diagnosis.";
  return {
    ...legacy,
    id: legacy?.id || "cat-" + slug(row.name),
    name: row.name,
    catalogName: row.name,
    nameAr: row.ar,
    synonyms: [
      ...(row.synonyms || []),
      ...((
        {
          "Bench Press": ["بنش", "بنش برس", "ضغط صدر مستوي"],
          "Incline Dumbbell Press": ["انكلين دمبل"],
          "Lat Pulldown": ["سحب امامي", "لات بول داون"],
          Squat: ["قرفصاء"],
          "Pec Fly Machine": ["بيك ديك", "فراشة"],
          "Biceps Curl": ["باي", "بايسيبس"],
        } as Record<string, string[]>
      )[row.name] || []),
    ],
    muscle: row.muscle as Muscle,
    primaryMuscles: [row.muscle as Muscle],
    secondary: secondary.filter((m) => m !== row.muscle),
    equipment: legacy?.equipment || row.equipment,
    equipmentType: row.equipment,
    requiredEquipment: [row.equipment, ...extra],
    pattern,
    exerciseFunction:
      row.muscle === "Traps"
        ? row.name.includes("Shrug")
          ? "Scapular elevation"
          : row.name === "Scapular Pull-up"
            ? "Scapular depression"
            : row.name === "Prone T Raise"
              ? "Scapular retraction"
              : "Scapular upward rotation"
        : pattern,
    kind: row.kind,
    category: row.kind,
    difficulty:
      row.difficulty ||
      (advanced
        ? "Advanced"
        : row.equipment === "Barbell" || row.equipment === "Kettlebell"
          ? "Intermediate"
          : "Beginner"),
    regions: row.regions,
    unilateral,
    additionalLoading:
      row.loading ??
      (!["Mobility", "Conditioning"].includes(row.kind) &&
        row.equipment !== "Bodyweight"),
    tracking: timed ? "seconds" : "reps",
    suggestedReps: timed
      ? [20, 60]
      : row.kind === "Isolation"
        ? [10, 15]
        : [6, 12],
    rest: row.kind === "Mobility" ? 30 : row.kind === "Isolation" ? 75 : 120,
    eligible:
      row.kind === "Compound" &&
      !timed &&
      [
        "Barbell",
        "Dumbbell",
        "Smith Machine",
        "Plate-loaded Machine",
        "Selectorized Machine",
        "Trap Bar",
      ].includes(row.equipment) &&
      ![
        "Core Flexion",
        "Core Rotation",
        "Core Stabilization",
        "Carry",
      ].includes(pattern),
    startingPosition: row.cue,
    startingPositionAr: row.cueAr,
    instructions: row.cue + " " + guide[0],
    instructionsAr: row.cueAr + " " + guide[1],
    execution: guide[0],
    executionAr: guide[1],
    mistakes: guide[2],
    mistakesAr: guide[3],
    safety,
    safetyAr:
      "استخدم حملاً متحكماً به ومعدات ثابتة. توقف عند ألم حاد أو دوار أو أعراض غير معتادة. هذه إرشادات تمرين وليست تشخيصاً لإصابة.",
    breathing:
      row.kind === "Mobility" || timed
        ? "Breathe continuously; do not hold your breath."
        : "Breathe between repetitions; exhale during the effort when practical and maintain trunk control.",
    breathingAr:
      "تنفس بين التكرارات وازفر أثناء الجهد عند الإمكان مع ثبات الجذع؛ لا تحبس النفس أثناء التثبيت.",
    source: "catalog",
    alternatives: [],
  };
}
export function buildCatalog(legacy: Exercise[]): Exercise[] {
  const all = catalogRows.map((r) =>
    make(
      r,
      legacy.find((e) => e.name === r.name),
    ),
  );
  // Keep every stable legacy ID even if a future editorial row is removed.
  for (const e of legacy)
    if (!all.some((x) => x.id === e.id)) all.push({ ...e, source: "catalog" });
  for (const e of all)
    e.alternatives = all
      .filter(
        (x) =>
          x.id !== e.id &&
          x.muscle === e.muscle &&
          x.pattern === e.pattern &&
          x.kind === e.kind,
      )
      .slice(0, 5)
      .map((x) => x.name);
  return all;
}
export interface ExerciseFilters {
  query?: string;
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  pattern?: string;
  kind?: string;
  favoriteIds?: string[];
  favoritesOnly?: boolean;
  recentIds?: string[];
  recentOnly?: boolean;
}
export const normalizeSearch = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u0300-\u036f]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export function searchExercises(
  exercises: Exercise[],
  f: ExerciseFilters = {},
) {
  const words = normalizeSearch(f.query || "")
    .split(" ")
    .filter(Boolean);
  return exercises.filter(
    (e) =>
      (!f.muscle ||
        f.muscle === "All" ||
        e.muscle === f.muscle ||
        e.regions?.includes(f.muscle)) &&
      (!f.equipment || f.equipment === "All" || equipment(e) === f.equipment) &&
      (!f.difficulty ||
        f.difficulty === "All" ||
        e.difficulty === f.difficulty) &&
      (!f.pattern || f.pattern === "All" || e.pattern === f.pattern) &&
      (!f.kind || f.kind === "All" || e.kind === f.kind) &&
      (!f.favoritesOnly || f.favoriteIds?.includes(e.id)) &&
      (!f.recentOnly || f.recentIds?.includes(e.id)) &&
      words.every((w) =>
        normalizeSearch(
          [
            e.name,
            e.nameAr,
            ...(e.synonyms || []),
            e.muscle,
            ...(e.regions || []),
          ].join(" "),
        ).includes(w),
      ),
  );
}
export function substitutions(
  original: Exercise,
  exercises: Exercise[],
  options: {
    equipment?: EquipmentType[];
    excluded?: string[];
    preferred?: string[];
    difficulty?: string;
  } = {},
) {
  return exercises
    .filter(
      (e) =>
        e.id !== original.id &&
        e.muscle === original.muscle &&
        e.pattern === original.pattern &&
        e.kind === original.kind &&
        (!e.exerciseFunction ||
          !original.exerciseFunction ||
          e.exerciseFunction === original.exerciseFunction) &&
        !options.excluded?.includes(e.id) &&
        (!options.equipment || canUse(e, options.equipment)),
    )
    .map((e) => ({
      exercise: e,
      score:
        100 +
        (e.regions?.some((r) => original.regions?.includes(r)) ? 15 : 0) +
        (equipment(e) === equipment(original) ? 8 : 0) +
        (e.difficulty === original.difficulty ? 4 : 0) +
        (options.preferred?.includes(e.id) ? 10 : 0) -
        (e.difficulty === "Advanced" ? 12 : 0),
      reason: "Same primary muscle, movement pattern and exercise function.",
    }))
    .sort(
      (a, b) => b.score - a.score || a.exercise.id.localeCompare(b.exercise.id),
    );
}
export function canUse(e: Exercise, available: EquipmentType[]) {
  return (e.requiredEquipment || [equipment(e)]).every((eq) =>
    available.includes(eq),
  );
}
