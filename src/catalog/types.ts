export const equipmentTypes = [
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
] as const;
export type EquipmentType = (typeof equipmentTypes)[number];
export const patterns = [
  "Horizontal Push",
  "Vertical Push",
  "Horizontal Pull",
  "Vertical Pull",
  "Squat",
  "Hip Hinge",
  "Lunge",
  "Knee Extension",
  "Knee Flexion",
  "Hip Adduction",
  "Hip Abduction",
  "Elbow Flexion",
  "Elbow Extension",
  "Shoulder Isolation",
  "Calf Raise",
  "Core Flexion",
  "Core Rotation",
  "Core Stabilization",
  "Carry",
  "Conditioning",
  "Mobility",
  "Wrist Flexion",
  "Wrist Extension",
  "Forearm Rotation",
  "Grip",
  "Ankle Dorsiflexion",
] as const;
export type Pattern = (typeof patterns)[number];
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Kind = "Compound" | "Isolation" | "Conditioning" | "Mobility";
export type CatalogRow = {
  name: string;
  ar: string;
  equipment: EquipmentType;
  muscle: string;
  pattern: Pattern;
  kind: Kind;
  regions: string[];
  cue: string;
  cueAr: string;
  difficulty?: Difficulty;
  synonyms?: string[];
  secondary?: string[];
  unilateral?: boolean;
  loading?: boolean;
  timed?: boolean;
};
export const equipmentCodes: Record<string, EquipmentType> = {
  BB: "Barbell",
  DB: "Dumbbell",
  CB: "Cable",
  SM: "Smith Machine",
  PL: "Plate-loaded Machine",
  MA: "Selectorized Machine",
  KB: "Kettlebell",
  BW: "Bodyweight",
  RB: "Resistance Band",
  PU: "Pull-up Bar",
  EZ: "EZ Bar",
  TB: "Trap Bar",
  CE: "Cardio Equipment",
  OT: "Other",
};
