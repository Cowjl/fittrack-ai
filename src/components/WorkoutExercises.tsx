import { Check, Flame, X } from "lucide-react";
import type { ReactNode } from "react";
import * as C from "../core";
import { ExerciseDetails } from "./ExerciseDetails";
interface Props {
  s: C.Session;
  isActive: boolean;
  mutate: (fn: (s: C.Session) => void) => void;
  history: C.Session[];
  d: C.Data;
  weight: (n: number) => number;
  factor: number;
  unit: string;
  t: (s: string) => string;
  setError: (s: string) => void;
  timer: (n: number) => void;
  button: (label: string, fn: () => void, cls?: string) => ReactNode;
}
export function WorkoutExercises({
  s,
  isActive,
  mutate,
  history,
  d,
  weight,
  factor,
  unit,
  t,
  setError,
  timer,
  button,
}: Props) {
  const settings = d.settings;
  return s.exercises.map((e, i) => {
    const previous = history
      .filter((h) => h.id !== s.id && h.start < s.start)
      .flatMap((h) =>
        h.exercises.filter((x) => x.exerciseId === e.exerciseId),
      )[0];
    const advice = C.coach(e, history);
    return (
      <section className="card exercise-card" key={i}>
        <div className="row">
          <span className="number">{String(i + 1).padStart(2, "0")}</span>
          <div className="grow">
            <h3 dir="ltr">{e.name}</h3>
            <p>
              {t(e.muscle)} · {e.sets} × {e.min}–{e.max}
            </p>
          </div>
          {i > 0 && (
            <button
              className="icon"
              title={t("Move up")}
              onClick={() =>
                mutate((s) => {
                  [s.exercises[i - 1], s.exercises[i]] = [
                    s.exercises[i],
                    s.exercises[i - 1],
                  ];
                })
              }
            >
              ↑
            </button>
          )}
        </div>
        {previous && (
          <p className="previous">
            {t("Previous")}:{" "}
            {C.working(previous)
              .map((x) => `${weight(x.weight!)} ${unit} × ${x.reps}`)
              .join(" / ") || "—"}
          </p>
        )}
        {settings.coach && isActive && (
          <div className="coach">
            <Flame size={16} />
            <span>
              {t(advice.key)}{" "}
              {advice.weight !== undefined && (
                <b>
                  {weight(advice.weight)} {unit}
                </b>
              )}
            </span>
          </div>
        )}
        <div className="set-head">
          <span>#</span>
          <span>
            {t("Weight")} ({unit})
          </span>
          <span>{t("Reps")}</span>
          <span>RIR</span>
          <span>✓</span>
          <span />
        </div>
        {e.logs.map((l, j) => (
          <div className={"set-row " + (l.done ? "completed" : "")} key={l.id}>
            <span>{l.warmup ? "W" : j + 1}</span>
            {(["weight", "reps", "rir"] as const).map((key) => (
              <input
                key={key}
                aria-label={`${e.name} ${j + 1} ${key}`}
                type="number"
                inputMode={key === "weight" ? "decimal" : "numeric"}
                min="0"
                max={key === "rir" ? 10 : undefined}
                step={key === "weight" ? "any" : 1}
                disabled={l.done || !!s.pausedAt}
                placeholder={key === "rir" ? "–" : ""}
                value={
                  l[key] === null
                    ? ""
                    : key === "weight"
                      ? weight(l[key]!)
                      : l[key]!
                }
                onChange={(ev) => {
                  const value =
                    ev.target.value === ""
                      ? null
                      : Number(ev.target.value) /
                        (key === "weight" ? factor : 1);
                  if (
                    value !== null &&
                    (!Number.isFinite(value) ||
                      value < 0 ||
                      (key === "reps" &&
                        (!Number.isInteger(value) ||
                          value < 1 ||
                          value > 1000)) ||
                      (key === "rir" && value > 10) ||
                      (key === "weight" && value > 2000))
                  )
                    return;
                  mutate((s) => {
                    s.exercises[i].logs[j][key] = value;
                  });
                }}
              />
            ))}
            <button
              disabled={!!s.pausedAt}
              className={"check " + (l.done ? "checked" : "")}
              aria-label={t(l.done ? "Undo" : "Done")}
              onClick={() => {
                if (!l.done && !C.validSet(l)) {
                  setError(
                    t(
                      "Sets must have a valid weight, reps and optional RIR (0–10).",
                    ),
                  );
                  return;
                }
                mutate((s) => {
                  s.exercises[i].logs[j].done = !l.done;
                });
                if (!l.done && isActive && settings.autoRest)
                  timer(e.rest || settings.rest);
              }}
            >
              <Check size={17} />
            </button>
            <button
              className="icon danger"
              aria-label={t("Delete")}
              onClick={() => {
                if (!l.done || confirm(t("Confirm deletion?")))
                  mutate((s) => {
                    s.exercises[i].logs.splice(j, 1);
                  });
              }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
        <div className="row wrap">
          {button(
            "Add set",
            () =>
              mutate((s) => {
                s.exercises[i].logs.push(C.newSet());
              }),
            "small",
          )}
          {button(
            "Warmup",
            () =>
              mutate((s) => {
                s.exercises[i].logs.push(C.newSet(true));
              }),
            "small",
          )}
          {isActive && (
            <select
              aria-label={t("Replace")}
              value=""
              onChange={(ev) => {
                if (
                  e.logs.some((l) => l.done) &&
                  !confirm(t("Confirm deletion?"))
                )
                  return;
                const ex = d.exercises.find((x) => x.id === ev.target.value)!;
                mutate((s) => {
                  s.exercises[i] = {
                    ...e,
                    exerciseId: ex.id,
                    name: ex.name,
                    muscle: ex.muscle,
                    secondary: ex.secondary,
                    eligible: ex.eligible,
                    logs: Array.from({ length: e.sets }, () => C.newSet()),
                  };
                });
              }}
            >
              <option value="">{t("Replace")}</option>
              {d.exercises.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <label className="field">
          <span>{t("Notes")}</span>
          <textarea
            value={e.notes}
            onChange={(ev) =>
              mutate((s) => {
                s.exercises[i].notes = ev.target.value;
              })
            }
          />
        </label>
        <label className="field">
          <span>{t("Technique / difficulty")}</span>
          <select
            value={e.feedback}
            onChange={(ev) =>
              mutate((s) => {
                s.exercises[i].feedback = ev.target.value;
              })
            }
          >
            <option value="">{t("No concerns reported")}</option>
            <option value="difficult">
              {t("Poor technique / too difficult")}
            </option>
            <option value="reduce">{t("Need to reduce load")}</option>
          </select>
        </label>
        {<ExerciseDetails id={e.exerciseId} exercises={d.exercises} t={t} />}
        {d.exercises.find((x) => x.id === e.exerciseId)?.equipment ===
          "Bodyweight" && (
          <small>{t("Bodyweight: enter 0 for added weight.")}</small>
        )}
      </section>
    );
  });
}
