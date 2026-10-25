import { equipmentTypes, patterns } from "../catalog/types";
import { goals, presets, weekdays, type PlanConfig } from "./types";
export function checkConfig(value: unknown): value is PlanConfig {
  if (!value || typeof value !== "object") return false;
  const c = value as PlanConfig;
  const strings = (x: unknown): x is string[] =>
    Array.isArray(x) && x.every((v) => typeof v === "string");
  return (
    goals.includes(c.goal) &&
    ["Beginner", "Intermediate", "Advanced"].includes(c.experience) &&
    Number.isInteger(c.days) &&
    c.days >= 1 &&
    c.days <= 7 &&
    Number.isFinite(c.minutes) &&
    c.minutes >= 15 &&
    c.minutes <= 180 &&
    Object.keys(presets).includes(c.equipmentMode) &&
    strings(c.equipment) &&
    c.equipment.length > 0 &&
    c.equipment.every((e) => equipmentTypes.includes(e)) &&
    strings(c.preferred) &&
    strings(c.disliked) &&
    strings(c.excluded) &&
    strings(c.limitations) &&
    c.limitations.every((p) => patterns.includes(p)) &&
    strings(c.weekdays) &&
    new Set(c.weekdays).size === c.weekdays.length &&
    c.weekdays.every((d) => weekdays.includes(d)) &&
    !!c.priorities &&
    typeof c.priorities === "object" &&
    !Array.isArray(c.priorities) &&
    Object.values(c.priorities).every((v) =>
      ["Prioritize", "Maintain", "Reduce"].includes(v),
    ) &&
    Number.isInteger(c.seed) &&
    c.seed >= 0 &&
    Number.isInteger(c.setsAdjustment) &&
    Math.abs(c.setsAdjustment) <= 1 &&
    ["Balanced", "Machines", "Free weights"].includes(c.preference) &&
    (c.repMin === undefined ||
      (Number.isInteger(c.repMin) && c.repMin >= 1 && c.repMin <= 30)) &&
    (c.repMax === undefined ||
      (Number.isInteger(c.repMax) && c.repMax >= 1 && c.repMax <= 30)) &&
    (c.repMin === undefined || c.repMax === undefined || c.repMin <= c.repMax)
  );
}
