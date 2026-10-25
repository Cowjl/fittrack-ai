import { equipmentTypes, patterns } from "../catalog";
import { useState } from "react";
import { X } from "lucide-react";
import { muscles, type Exercise } from "../core";
interface Props {
  exercise: Exercise;
  t: (s: string) => string;
  onSave: (e: Exercise) => void;
  onClose: () => void;
}
export function ExerciseEditor({ exercise, t, onSave, onClose }: Props) {
  const [e, set] = useState(() => structuredClone(exercise)),
    [error, setError] = useState("");
  const field = (
    key: "name" | "equipment" | "instructions" | "mistakes" | "category",
    label: string,
    multi = false,
  ) => (
    <label className="field">
      <span>{t(label)}</span>
      {multi ? (
        <textarea
          required
          value={e[key]}
          onChange={(ev) => set({ ...e, [key]: ev.target.value })}
        />
      ) : (
        <input
          required
          value={e[key]}
          onChange={(ev) => set({ ...e, [key]: ev.target.value })}
        />
      )}
    </label>
  );
  return (
    <div className="overlay">
      <form
        className="modal wide card"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (
            !e.name.trim() ||
            !e.instructions.trim() ||
            !e.equipment.trim() ||
            !Number.isFinite(e.rest) ||
            e.rest < 1 ||
            e.rest > 3600
          ) {
            setError(
              t(
                "Check the exercise name, instructions, equipment and rest duration.",
              ),
            );
            return;
          }
          onSave({
            ...e,
            instructionsAr:
              e.instructions !== exercise.instructions &&
              e.instructionsAr === exercise.instructionsAr
                ? undefined
                : e.instructionsAr,
            name: e.name.trim(),
            source: e.source || "custom",
            pattern: e.pattern || "Horizontal Push",
            kind: e.kind || "Compound",
            difficulty: e.difficulty || "Beginner",
          });
        }}
      >
        <div className="sticky-modal">
          <h2>
            {t("Edit")} {t("Library")}
          </h2>
          <div className="row">
            <button type="button" onClick={onClose}>
              {t("Close")}
            </button>
            <button className="primary" type="submit">
              {t("Save")}
            </button>
          </div>
        </div>
        {error && (
          <div role="alert" className="alert">
            {error}
            <button type="button" className="icon" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        {field("name", "Name")}
        {field("equipment", "Equipment")}
        <label className="field">
          <span>{t("Primary muscle")}</span>
          <select
            value={e.muscle}
            onChange={(ev) =>
              set({ ...e, muscle: ev.target.value as Exercise["muscle"] })
            }
          >
            {muscles.map((m) => (
              <option key={m} value={m}>
                {t(m)}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>{t("Secondary")}</legend>
          <div className="row wrap">
            {muscles
              .filter((m) => m !== e.muscle)
              .map((m) => (
                <label className="row" key={m}>
                  <input
                    type="checkbox"
                    checked={e.secondary.includes(m)}
                    onChange={(ev) =>
                      set({
                        ...e,
                        secondary: ev.target.checked
                          ? [...e.secondary, m]
                          : e.secondary.filter((x) => x !== m),
                      })
                    }
                  />
                  <small>{t(m)}</small>
                </label>
              ))}
          </div>
        </fieldset>
        <label className="field">
          <span>{t("Arabic name")}</span>
          <input
            value={e.nameAr || ""}
            onChange={(ev) => set({ ...e, nameAr: ev.target.value })}
          />
        </label>
        <label className="field">
          <span>{t("Search aliases")}</span>
          <input
            value={(e.synonyms || []).join(", ")}
            onChange={(ev) =>
              set({
                ...e,
                synonyms: ev.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="field">
          <span>{t("Equipment type")}</span>
          <select
            value={e.equipmentType || "Other"}
            onChange={(ev) =>
              set({
                ...e,
                equipmentType: ev.target.value as Exercise["equipmentType"],
                equipment: ev.target.value,
                requiredEquipment: [
                  ev.target.value as NonNullable<Exercise["equipmentType"]>,
                ],
              })
            }
          >
            {equipmentTypes.map((eq) => (
              <option key={eq} value={eq}>
                {t(eq)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t("Movement pattern")}</span>
          <select
            value={e.pattern || "Horizontal Push"}
            onChange={(ev) =>
              set({ ...e, pattern: ev.target.value as Exercise["pattern"] })
            }
          >
            {patterns.map((x) => (
              <option key={x} value={x}>
                {t(x)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t("Exercise function")}</span>
          <select
            value={e.kind || "Compound"}
            onChange={(ev) =>
              set({ ...e, kind: ev.target.value as Exercise["kind"] })
            }
          >
            {["Compound", "Isolation", "Conditioning", "Mobility"].map((x) => (
              <option key={x} value={x}>
                {t(x)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t("Difficulty")}</span>
          <select
            value={e.difficulty || "Beginner"}
            onChange={(ev) =>
              set({
                ...e,
                difficulty: ev.target.value as Exercise["difficulty"],
              })
            }
          >
            {["Beginner", "Intermediate", "Advanced"].map((x) => (
              <option key={x} value={x}>
                {t(x)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t("Tracking")}</span>
          <select
            value={e.tracking || "reps"}
            onChange={(ev) =>
              set({ ...e, tracking: ev.target.value as "reps" | "seconds" })
            }
          >
            <option value="reps">{t("Reps")}</option>
            <option value="seconds">{t("seconds")}</option>
          </select>
        </label>
        {field("category", "Category")}
        {field("instructions", "Instructions", true)}
        {field("mistakes", "Mistakes", true)}
        <label className="field">
          <span>
            {t("Alternatives")} ({t("Separate with commas")})
          </span>
          <textarea
            value={e.alternatives.join(", ")}
            onChange={(ev) =>
              set({
                ...e,
                alternatives: ev.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="field">
          <span>{t("Rest")} (s)</span>
          <input
            type="number"
            min="1"
            max="3600"
            value={e.rest}
            onChange={(ev) => set({ ...e, rest: +ev.target.value })}
          />
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={e.eligible}
            onChange={(ev) => set({ ...e, eligible: ev.target.checked })}
          />
          <span>
            {t("Allow estimated 1RM (loaded compound exercises only)")}
          </span>
        </label>
        <p>
          {t(
            "Exercise library edits apply to future sessions; history keeps its original snapshot.",
          )}
        </p>
      </form>
    </div>
  );
}
