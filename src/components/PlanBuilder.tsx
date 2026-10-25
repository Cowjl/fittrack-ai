import { useState } from "react";
import { muscles, type Data, type Program } from "../core";
import {
  defaultConfig,
  goals,
  presets,
  weekdays,
  type PlanConfig,
  type EquipmentMode,
} from "../planning/types";
import { generatePlan } from "../planning/engine";
import { equipmentTypes, patterns } from "../catalog";
import { ExerciseBrowser } from "./ExerciseBrowser";
const steps = [
  "Welcome",
  "Select goal",
  "Select experience",
  "Select training days",
  "Select session duration",
  "Select equipment",
  "Select muscle priorities",
  "Personal preferences",
];
export function PlanBuilder({
  data,
  t,
  onPreview,
  onSkip,
}: {
  data: Data;
  t: (s: string) => string;
  onPreview: (p: Program) => void;
  onSkip: () => void;
}) {
  const [c, set] = useState<PlanConfig>(() =>
      structuredClone(data.planProfile || defaultConfig()),
    ),
    [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [picker, setPicker] = useState<
      "preferred" | "disliked" | "excluded" | null
    >(null);
  const change = <K extends keyof PlanConfig>(k: K, v: PlanConfig[K]) =>
    set({ ...c, [k]: v });
  const choices = (
    key: "goal" | "experience" | "equipmentMode" | "preference",
    options: readonly string[],
  ) => (
    <div className="choice-grid">
      {options.map((x) => (
        <button
          key={x}
          className={c[key] === x ? "choice selected-choice" : "choice"}
          aria-pressed={c[key] === x}
          onClick={() => {
            if (key === "equipmentMode")
              set({
                ...c,
                equipmentMode: x as EquipmentMode,
                equipment: [...presets[x as EquipmentMode]],
              });
            else set({ ...c, [key]: x });
          }}
        >
          {t(x)}
        </button>
      ))}
    </div>
  );
  const field = (label: string, node: React.ReactNode) => (
    <label className="field" key={label}>
      <span>{t(label)}</span>
      {node}
    </label>
  );
  return (
    <section className="card plan-builder">
      <div className="section-title">
        <div>
          <span className="eyebrow">
            {t("Build My Plan")} · {step + 1} / {steps.length}
          </span>
          <h2>{t(steps[step])}</h2>
        </div>
        <button onClick={onSkip}>{t("Skip for now")}</button>
      </div>
      <div className="wizard-progress">
        <i style={{ width: ((step + 1) / steps.length) * 100 + "%" }} />
      </div>
      {error && (
        <div role="alert" className="alert">
          {t(error)}
        </div>
      )}
      {step === 0 && (
        <div className="builder-welcome">
          <h1>{t("A plan that fits your life.")}</h1>
          <p>
            {t(
              "Choose your schedule, equipment and goals. Everything is calculated privately on this device, even offline.",
            )}
          </p>
          <p>
            {t(
              "Your current program and history stay unchanged until you choose to activate a plan.",
            )}
          </p>
          <p>
            {t(
              "Export a backup in Settings before making major changes to your programs.",
            )}
          </p>
        </div>
      )}
      {step === 1 && choices("goal", goals)}
      {step === 2 &&
        choices("experience", ["Beginner", "Intermediate", "Advanced"])}
      {step === 3 && (
        <>
          {field(
            "Available days per week",
            <select
              value={c.days}
              onChange={(e) => {
                const days = +e.target.value;
                const selection: Record<number, string[]> = {
                  1: ["Monday"],
                  2: ["Monday", "Thursday"],
                  3: ["Monday", "Wednesday", "Friday"],
                  4: ["Monday", "Tuesday", "Thursday", "Friday"],
                  5: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
                  6: weekdays.slice(0, 6),
                  7: weekdays,
                };
                set({ ...c, days, weekdays: selection[days] });
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>,
          )}
          <h3>{t("Preferred weekdays")}</h3>
          <div className="weekday-picker">
            {weekdays.map((day) => (
              <button
                className={c.weekdays.includes(day) ? "primary" : ""}
                key={day}
                aria-pressed={c.weekdays.includes(day)}
                onClick={() =>
                  change(
                    "weekdays",
                    weekdays.filter((d) =>
                      d === day
                        ? !c.weekdays.includes(day)
                        : c.weekdays.includes(d),
                    ),
                  )
                }
              >
                {t(day)}
              </button>
            ))}
          </div>
          <p>
            {c.weekdays.length} / {c.days} · {t("Rest days remain flexible.")}
          </p>
          {c.days === 7 && (
            <p className="coach">
              {t(
                "Seven available days includes six lifting sessions and one easy recovery day, not seven hard sessions.",
              )}
            </p>
          )}
        </>
      )}
      {step === 4 && (
        <>
          <div className="choice-grid">
            {[30, 45, 60, 75, 90].map((n) => (
              <button
                className={c.minutes === n ? "primary" : ""}
                key={n}
                onClick={() => change("minutes", n)}
              >
                {n} {t("minutes")}
              </button>
            ))}
          </div>
          {field(
            "Custom minutes",
            <input
              type="number"
              min="15"
              max="180"
              value={c.minutes}
              onChange={(e) => change("minutes", +e.target.value)}
            />,
          )}
          <p>
            {t(
              "Duration estimates include a five-minute warm-up, working sets, rests and setup. Actual gym times vary.",
            )}
          </p>
        </>
      )}
      {step === 5 && (
        <>
          {choices("equipmentMode", Object.keys(presets))}
          <p>
            {t(
              "Only the equipment selected below may be used. Adjust presets to match what you actually have.",
            )}
          </p>
          <div className="equipment-checks">
            {equipmentTypes.map((eq) => (
              <label className="row" key={eq}>
                <input
                  type="checkbox"
                  checked={c.equipment.includes(eq)}
                  onChange={(e) =>
                    change(
                      "equipment",
                      e.target.checked
                        ? [...c.equipment, eq]
                        : c.equipment.filter((x) => x !== eq),
                    )
                  }
                />
                <span>{t(eq)}</span>
              </label>
            ))}
          </div>
        </>
      )}
      {step === 6 && (
        <>
          <p>
            {t(
              "Priorities trade optional work within your time budget. Essential movement coverage is retained.",
            )}
          </p>
          <div className="priority-grid">
            {[
              ...muscles.filter((m) => !["Mobility", "Full body"].includes(m)),
              "Upper chest",
            ].map((m) =>
              field(
                m,
                <select
                  value={c.priorities[m] || "Maintain"}
                  onChange={(e) =>
                    change("priorities", {
                      ...c.priorities,
                      [m]: e.target.value as
                        "Prioritize" | "Maintain" | "Reduce",
                    })
                  }
                >
                  <option value="Maintain">{t("Maintain")}</option>
                  <option value="Prioritize">{t("Prioritize")}</option>
                  <option value="Reduce">{t("Reduce direct emphasis")}</option>
                </select>,
              ),
            )}
          </div>
          {field(
            "Set adjustment",
            <select
              value={c.setsAdjustment}
              onChange={(e) => change("setsAdjustment", +e.target.value)}
            >
              <option value="-1">{t("Lower volume")}</option>
              <option value="0">{t("Recommended starting volume")}</option>
              <option value="1">{t("Higher volume")}</option>
            </select>,
          )}
        </>
      )}
      {step === 7 && (
        <>
          {choices("preference", ["Balanced", "Machines", "Free weights"])}
          <div className="row wrap">
            {(["preferred", "disliked", "excluded"] as const).map((key) => (
              <button key={key} onClick={() => setPicker(key)}>
                {t(
                  key === "preferred"
                    ? "Preferred exercises"
                    : key === "disliked"
                      ? "Disliked exercises"
                      : "Excluded exercises",
                )}{" "}
                ({c[key].length})
              </button>
            ))}
          </div>
          {(["preferred", "disliked", "excluded"] as const).map((key) => (
            <div key={key} className="selected-exercises">
              {c[key].map((id) => (
                <button
                  key={id}
                  onClick={() =>
                    change(
                      key,
                      c[key].filter((x) => x !== id),
                    )
                  }
                >
                  {data.exercises.find((e) => e.id === id)?.name} ×
                </button>
              ))}
            </div>
          ))}
          <details>
            <summary>{t("Optional movement limitations")}</summary>
            <p>
              {t(
                "Select movements to exclude. Do not enter medical information; this tool does not diagnose injuries.",
              )}
            </p>
            <div className="equipment-checks">
              {patterns.map((p) => (
                <label className="row" key={p}>
                  <input
                    type="checkbox"
                    checked={c.limitations.includes(p)}
                    onChange={(e) =>
                      change(
                        "limitations",
                        e.target.checked
                          ? [...c.limitations, p]
                          : c.limitations.filter((x) => x !== p),
                      )
                    }
                  />
                  <small>{t(p)}</small>
                </label>
              ))}
            </div>
          </details>
          <div className="row">
            {field(
              "Preferred minimum reps",
              <input
                type="number"
                min="1"
                max="30"
                value={c.repMin ?? ""}
                placeholder={t("Automatic")}
                onChange={(e) =>
                  change("repMin", e.target.value ? +e.target.value : undefined)
                }
              />,
            )}
            {field(
              "Preferred maximum reps",
              <input
                type="number"
                min="1"
                max="30"
                value={c.repMax ?? ""}
                placeholder={t("Automatic")}
                onChange={(e) =>
                  change("repMax", e.target.value ? +e.target.value : undefined)
                }
              />,
            )}
          </div>
        </>
      )}
      <div className="wizard-actions">
        {step > 0 && (
          <button
            onClick={() => {
              setError("");
              setStep(step - 1);
            }}
          >
            {t("Previous step")}
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            className="primary"
            onClick={() => {
              setError("");
              setStep(step + 1);
            }}
          >
            {t("Continue")}
          </button>
        ) : (
          <button
            className="primary"
            onClick={() => {
              try {
                onPreview(generatePlan(c, data.exercises).program);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            {t("Generate Plan")}
          </button>
        )}
      </div>
      {picker && (
        <div className="overlay" role="dialog" aria-modal="true">
          <section className="modal wide card">
            <div className="sticky-modal">
              <h2>{t("Choose exercises")}</h2>
              <button onClick={() => setPicker(null)}>{t("Close")}</button>
            </div>
            <ExerciseBrowser
              data={data}
              t={t}
              compact
              onSelect={(e) => {
                change(picker, [...new Set([...c[picker], e.id])]);
                setPicker(null);
              }}
            />
          </section>
        </div>
      )}
    </section>
  );
}
