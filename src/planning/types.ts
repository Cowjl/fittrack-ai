import type { Difficulty, EquipmentType, Pattern } from "../catalog/types";
export const goals = [
  "Muscle Hypertrophy",
  "Maximal Strength",
  "Body Recomposition",
  "General Fitness",
  "Muscular Endurance",
  "Fat Loss Support",
  "Return to Training",
] as const;
export type Goal = (typeof goals)[number];
export type EquipmentMode =
  | "Full Commercial Gym"
  | "Machines Only"
  | "Dumbbells Only"
  | "Home Gym"
  | "Bodyweight Only"
  | "Custom Equipment Selection";
export interface PlanConfig {
  goal: Goal;
  experience: Difficulty;
  days: number;
  minutes: number;
  equipmentMode: EquipmentMode;
  equipment: EquipmentType[];
  priorities: Record<string, "Prioritize" | "Maintain" | "Reduce">;
  preferred: string[];
  disliked: string[];
  excluded: string[];
  limitations: Pattern[];
  weekdays: string[];
  repMin?: number;
  repMax?: number;
  setsAdjustment: number;
  preference: "Balanced" | "Machines" | "Free weights";
  seed: number;
}
export interface ProgramInfo {
  description: string;
  descriptionAr?: string;
  goal: Goal;
  difficulty: Difficulty;
  frequency: number;
  equipment: EquipmentType[];
  progression: string;
  progressionAr?: string;
  warnings: string[];
  rationale: string;
  config?: PlanConfig;
  templateKey?: string;
}
export const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const presets: Record<EquipmentMode, EquipmentType[]> = {
  "Full Commercial Gym": [
    "Barbell",
    "Dumbbell",
    "Cable",
    "Smith Machine",
    "Plate-loaded Machine",
    "Selectorized Machine",
    "Kettlebell",
    "Bodyweight",
    "Resistance Band",
    "Pull-up Bar",
    "EZ Bar",
    "Trap Bar",
    "Cardio Equipment",
    "Other",
  ],
  "Machines Only": [
    "Selectorized Machine",
    "Plate-loaded Machine",
    "Smith Machine",
    "Cardio Equipment",
    "Bodyweight",
  ],
  "Dumbbells Only": ["Dumbbell", "Bodyweight"],
  "Home Gym": [
    "Barbell",
    "Dumbbell",
    "Bodyweight",
    "Resistance Band",
    "Pull-up Bar",
    "Other",
  ],
  "Bodyweight Only": ["Bodyweight"],
  "Custom Equipment Selection": [],
};
export const defaultConfig = (): PlanConfig => ({
  goal: "Muscle Hypertrophy",
  experience: "Beginner",
  days: 3,
  minutes: 45,
  equipmentMode: "Full Commercial Gym",
  equipment: [...presets["Full Commercial Gym"]],
  priorities: {},
  preferred: [],
  disliked: [],
  excluded: [],
  limitations: [],
  weekdays: ["Monday", "Wednesday", "Friday"],
  setsAdjustment: 0,
  preference: "Balanced",
  seed: 0,
});
