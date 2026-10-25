import type { Exercise, Program, PlanExercise } from "../core";
import { defaultProgram } from "../core";
import { equipment, slug } from "../catalog";
import type { Goal } from "./types";
import type { Difficulty } from "../catalog/types";
type Prescription = string | [string, number, number, number];
const fbA: Prescription[] = [
  "Goblet Squat",
  "Dumbbell Bench Press",
  "Seated Cable Row",
  "Dumbbell Romanian Deadlift",
  "Dead Bug",
];
const fbB: Prescription[] = [
  "Leg Press",
  "Lat Pulldown",
  "Dumbbell Floor Press",
  "Seated Leg Curl",
  "Bodyweight Standing Calf Raise",
];
const fbC: Prescription[] = [
  "Dumbbell Reverse Lunge",
  "Machine Chest Press",
  "Chest Supported Dumbbell Row",
  "Romanian Deadlift",
  "Side Plank",
];
const upperA: Prescription[] = [
  "Bench Press",
  "Lat Pulldown",
  "Dumbbell Shoulder Press",
  "Seated Cable Row",
  "Triceps Pushdown",
  "Biceps Curl",
];
const upperB: Prescription[] = [
  "Incline Dumbbell Press",
  "Chest Supported Dumbbell Row",
  "Lateral Raises",
  "Neutral Grip Lat Pulldown",
  "Rope Pushdown",
  "Hammer Curl",
];
const lowerA: Prescription[] = [
  "Squat",
  "Romanian Deadlift",
  "Leg Extension",
  "Seated Calf Raises",
  "Cable Crunch",
];
const lowerB: Prescription[] = [
  "Hack Squat",
  "Seated Leg Curl",
  "Dumbbell Reverse Lunge",
  "Standing Calf Raises",
  "Hanging Knee Raises",
];
const push: Prescription[] = [
  "Bench Press",
  "Incline Dumbbell Press",
  "Dumbbell Shoulder Press",
  "Lateral Raises",
  "Triceps Pushdown",
];
const pull: Prescription[] = [
  "Lat Pulldown",
  "Seated Cable Row",
  "Reverse Pec Deck",
  "Biceps Curl",
  "Dumbbell/Machine Shrugs",
];
const legs: Prescription[] = [
  "Squat",
  "Romanian Deadlift",
  "Leg Press",
  "Seated Leg Curl",
  "Standing Calf Raises",
  "Floor Crunch",
];
const bodyA: Prescription[] = [
  "Bodyweight Squat",
  "Push-up",
  "Prone W Raise",
  "Hamstring Walkout",
  "Dead Bug",
];
const bodyB: Prescription[] = [
  "Reverse Lunge",
  "Knee Push-up",
  "Reverse Snow Angel",
  "Glute Bridge",
  "Side Plank",
];
const bodyC: Prescription[] = [
  "Bodyweight Split Squat",
  "Push-up",
  "Prone W Raise",
  "Hamstring Walkout",
  "Bodyweight Standing Calf Raise",
];
export const programNames = [
  "Full Body Beginner - 2 days",
  "Full Body Beginner - 3 days",
  "Full Body Intermediate - 3 days",
  "Upper / Lower - 4 days",
  "Upper / Lower - 5 days",
  "Push / Pull / Legs - 3 days",
  "Push / Pull / Legs - 6 days",
  "Push / Pull / Legs A/B - 6 days",
  "Upper / Lower / Push / Pull / Legs - 5 days",
  "Strength Focus - 3 days",
  "Strength Focus - 4 days",
  "Hypertrophy Focus - 4 days",
  "Hypertrophy Focus - 5 days",
  "Hypertrophy Focus - 6 days",
  "Bodyweight / Home Training - 3 days",
  "Minimal Equipment - 3 days",
  "General Fitness - 3 days",
  "Return to Training After a Break",
] as const;
export function templates(exercises: Exercise[]): Program[] {
  function ex(name: string) {
    const e = exercises.find((e) => e.name === name || e.catalogName === name);
    if (!e) throw Error("Missing template exercise: " + name);
    return e;
  }
  function make(
    name: string,
    days: [string, Prescription[]][],
    level: Difficulty = "Intermediate",
    goal: Goal = "Muscle Hypertrophy",
    sets = 3,
  ): Program {
    const id = "template-" + slug(name);
    const strength = goal === "Maximal Strength";
    const p: Program = {
      id,
      name,
      source: "template",
      workouts: days.map(([day, es], i) => ({
        id: `${id}-w${i}`,
        name: day,
        focus: [
          ...new Set(
            es.map((x) => ex(typeof x === "string" ? x : x[0]).muscle),
          ),
        ].join(" · "),
        exercises: es.map((x) => {
          const [ename, n, min, max] =
            typeof x === "string"
              ? [x, sets, strength ? 3 : 8, strength ? 6 : 12]
              : x;
          const e = ex(ename as string);
          return {
            exerciseId: e.id,
            sets: n as number,
            min:
              e.tracking === "seconds" && typeof x === "string"
                ? 20
                : (min as number),
            max:
              e.tracking === "seconds" && typeof x === "string"
                ? 40
                : (max as number),
            rest:
              strength && e.kind === "Compound"
                ? 180
                : e.kind === "Compound"
                  ? 120
                  : 75,
            increment: 2.5,
          } satisfies PlanExercise;
        }),
      })),
      info: {
        description:
          level === "Beginner"
            ? "A practical low-volume starting plan. Begin with comfortable loads, learn each movement and add work gradually."
            : "A balanced plan with repeated muscle exposures and room to adjust effort, sets and exercise choices.",
        goal,
        difficulty: level,
        frequency: days.length,
        equipment: [],
        progression:
          "Use double progression. Keep the load until all planned working sets reach the upper rep target with controlled effort; then consider the exercise-specific increment.",
        rationale:
          "Follow the workouts in sequence and take flexible rest days. Weekly labels describe a suggested frequency, not mandatory weekdays.",
        warnings: [],
      },
    };
    p.info!.equipment = [
      ...new Set(
        p.workouts.flatMap((w) =>
          w.exercises.flatMap((x) => {
            const e = exercises.find((e) => e.id === x.exerciseId)!;
            return e.requiredEquipment || [equipment(e)];
          }),
        ),
      ),
    ];
    return p;
  }
  const days = (...es: Prescription[][]): [string, Prescription[]][] =>
    es.map((e, i) => ["Session " + String.fromCharCode(65 + i), e]);
  const strengthA: Prescription[] = [
    ["Squat", 3, 3, 5],
    ["Bench Press", 3, 3, 5],
    ["Seated Cable Row", 2, 6, 10],
    ["Seated Leg Curl", 2, 8, 12],
  ];
  const strengthB: Prescription[] = [
    ["Conventional Deadlift", 2, 3, 5],
    ["Standing Barbell Overhead Press", 3, 3, 5],
    ["Lat Pulldown", 3, 6, 10],
    ["Dumbbell Reverse Lunge", 2, 8, 10],
  ];
  const original = make(programNames[7], [], "Intermediate");
  original.workouts = structuredClone(defaultProgram().workouts).map(
    (w, i) => ({ ...w, id: original.id + "-w" + i }),
  );
  original.info!.frequency = 6;
  original.info!.description =
    "The original six-session PPL A/B template, preserved exactly. Customize a copy without changing My Original PPL A/B.";
  original.info!.equipment = [
    ...new Set(
      original.workouts.flatMap((w) =>
        w.exercises.map((x) =>
          equipment(exercises.find((e) => e.id === x.exerciseId)!),
        ),
      ),
    ),
  ];
  const result = [
    make(programNames[0], days(fbA, fbB), "Beginner", "General Fitness", 2),
    make(
      programNames[1],
      days(fbA, fbB, fbC),
      "Beginner",
      "Muscle Hypertrophy",
      2,
    ),
    make(programNames[2], days(fbA, fbB, fbC)),
    make(programNames[3], [
      ["Upper A", upperA],
      ["Lower A", lowerA],
      ["Upper B", upperB],
      ["Lower B", lowerB],
    ]),
    make(programNames[4], [
      ["Upper A", upperA],
      ["Lower A", lowerA],
      ["Upper B", upperB],
      ["Lower B", lowerB],
      [
        "Upper C",
        [
          "Incline Bench Press",
          "Seated Cable Row",
          "Lateral Raises",
          "Biceps Curl",
          "Triceps Pushdown",
        ],
      ],
    ]),
    make(programNames[5], [
      ["Push", push],
      ["Pull", pull],
      ["Legs", legs],
    ]),
    make(
      programNames[6],
      [
        ["Push A", push],
        ["Pull A", pull],
        ["Legs A", legs],
        ["Push B", push],
        ["Pull B", pull],
        ["Legs B", legs],
      ],
      "Intermediate",
      "Muscle Hypertrophy",
      2,
    ),
    original,
    make(
      programNames[8],
      [
        ["Upper", upperA],
        ["Lower", lowerA],
        ["Push", push],
        ["Pull", pull],
        ["Legs", lowerB],
      ],
      "Intermediate",
      "Muscle Hypertrophy",
      2,
    ),
    make(
      programNames[9],
      days(strengthA, strengthB, [
        ["Front Squat", 3, 3, 5],
        ["Incline Bench Press", 3, 4, 6],
        ["Chest Supported Dumbbell Row", 3, 6, 10],
        ["Dumbbell Romanian Deadlift", 2, 6, 10],
      ]),
      "Intermediate",
      "Maximal Strength",
    ),
    make(
      programNames[10],
      [
        [
          "Upper A",
          [
            ["Bench Press", 3, 3, 5],
            ["Lat Pulldown", 3, 6, 8],
            ["Standing Barbell Overhead Press", 2, 4, 6],
          ],
        ],
        [
          "Lower A",
          [
            ["Squat", 3, 3, 5],
            ["Seated Leg Curl", 3, 8, 10],
            ["Standing Calf Raises", 2, 10, 15],
          ],
        ],
        [
          "Upper B",
          [
            ["Standing Barbell Overhead Press", 3, 3, 5],
            ["Barbell Bent Over Row", 3, 5, 8],
            ["Incline Dumbbell Press", 2, 6, 10],
          ],
        ],
        [
          "Lower B",
          [
            ["Conventional Deadlift", 2, 3, 5],
            ["Front Squat", 3, 4, 6],
            ["Seated Leg Curl", 2, 8, 12],
          ],
        ],
      ],
      "Intermediate",
      "Maximal Strength",
    ),
    make(programNames[11], [
      ["Upper A", upperA],
      ["Lower A", lowerA],
      ["Upper B", upperB],
      ["Lower B", lowerB],
    ]),
    make(
      programNames[12],
      [
        ["Upper", upperA],
        ["Lower", lowerA],
        ["Push", push],
        ["Pull", pull],
        ["Legs", lowerB],
      ],
      "Intermediate",
      "Muscle Hypertrophy",
      2,
    ),
    make(
      programNames[13],
      [
        ["Push A", push],
        ["Pull A", pull],
        ["Legs A", lowerA],
        [
          "Push B",
          [
            "Incline Dumbbell Press",
            "Machine Chest Press",
            "Cable Lateral Raises",
            "Overhead Triceps Extension",
          ],
        ],
        [
          "Pull B",
          [
            "Neutral Grip Lat Pulldown",
            "Chest Supported Dumbbell Row",
            "Face Pull",
            "Incline Dumbbell Curl",
          ],
        ],
        ["Legs B", lowerB],
      ],
      "Intermediate",
      "Muscle Hypertrophy",
      2,
    ),
    make(
      programNames[14],
      days(bodyA, bodyB, bodyC),
      "Beginner",
      "General Fitness",
      2,
    ),
    make(
      programNames[15],
      days(
        [
          "Goblet Squat",
          "Dumbbell Floor Press",
          "Dumbbell Bent Over Row",
          "Dumbbell Romanian Deadlift",
          "Dead Bug",
        ],
        [
          "Dumbbell Reverse Lunge",
          "Standing Dumbbell Shoulder Press",
          "Dumbbell Bent Over Row",
          "Hamstring Walkout",
          "Bodyweight Standing Calf Raise",
        ],
        [
          "Dumbbell Squat",
          "Dumbbell Floor Press",
          "Dumbbell Bent Over Row",
          "Dumbbell Romanian Deadlift",
          "Side Plank",
        ],
      ),
      "Beginner",
      "Muscle Hypertrophy",
      2,
    ),
    make(
      programNames[16],
      days(fbA, fbB, [...fbC.slice(0, 4), "Stationary Bike"]),
      "Beginner",
      "General Fitness",
      2,
    ),
    make(programNames[17], days(fbA, fbB), "Beginner", "Return to Training", 1),
  ];
  result[14].info!.warnings = [
    "Without a bar, bands or weights, back loading and maximal-strength progression are limited.",
  ];
  result[17].info!.warnings = [
    "Start below previous loads and leave several repetitions in reserve. Add sets gradually as tolerance returns.",
  ];
  result[5].info!.warnings = [
    "This three-day split trains each region directly once per cycle; choose full body if twice-weekly practice is a priority.",
  ];
  return result;
}
