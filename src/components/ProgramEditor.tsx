import { ExercisePicker } from "./ExercisePicker";
import { useState } from "react";
import type { Dispatch, SetStateAction, ReactNode } from "react";
import { Trash2 } from "lucide-react";
import * as C from "../core";
const clone = <T,>(x: T): T => structuredClone(x);
interface Props {
  editProgram: C.Program;
  setEditProgram: Dispatch<SetStateAction<C.Program | null>>;
  d: C.Data;
  t: (s: string) => string;
  button: (label: string, fn: () => void, cls?: string) => ReactNode;
  input: (
    label: string,
    value: string | number,
    change: (s: string) => void,
    type?: string,
  ) => ReactNode;
  update: (fn: (d: C.Data) => void) => void;
  setError: (s: string) => void;
}
export function ProgramEditor({
  editProgram,
  setEditProgram,
  d,
  t,
  button,
  input,
  update,
  setError,
}: Props) {
  const settings = d.settings;
  const [localError, setLocalError] = useState("");
  return (
    <div className="overlay">
      <section className="modal wide card">
        <div className="sticky-modal">
          <h2>
            {t("Edit")} {t("Program")}
          </h2>
          <div className="row">
            {button("Close", () => setEditProgram(null))}
            {button(
              "Save",
              () => {
                try {
                  const copy = clone(d);
                  const idx = copy.programs.findIndex(
                    (p) => p.id === editProgram.id,
                  );
                  editProgram.workouts = editProgram.workouts.map((w) => ({
                    ...w,
                    focus: [
                      ...new Set(
                        w.exercises
                          .map(
                            (p) =>
                              copy.exercises.find((e) => e.id === p.exerciseId)
                                ?.muscle,
                          )
                          .filter(Boolean),
                      ),
                    ].join(" · "),
                  }));
                  if (idx < 0) copy.programs.push(editProgram);
                  else copy.programs[idx] = editProgram;
                  C.parseBackup(C.backup(copy));
                  update((d) => {
                    d.programs = copy.programs;
                  });
                  setEditProgram(null);
                } catch (e) {
                  setLocalError(t((e as Error).message));
                }
              },
              "primary",
            )}
          </div>
        </div>
        {localError && (
          <div role="alert" className="alert">
            {localError}
          </div>
        )}
        {input("Name", editProgram.name, (v) =>
          setEditProgram({ ...editProgram, name: v }),
        )}
        {editProgram.workouts.map((w, wi) => (
          <section className="editor-workout" key={w.id}>
            <div className="row">
              {input("Workout name", w.name, (v) => {
                const c = clone(editProgram);
                c.workouts[wi].name = v;
                setEditProgram(c);
              })}
              <button
                className="icon danger"
                title={t("Delete")}
                onClick={() => {
                  if (confirm(t("Confirm deletion?"))) {
                    const c = clone(editProgram);
                    c.workouts.splice(wi, 1);
                    setEditProgram(c);
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
              {wi > 0 && (
                <button
                  onClick={() => {
                    const c = clone(editProgram);
                    [c.workouts[wi - 1], c.workouts[wi]] = [
                      c.workouts[wi],
                      c.workouts[wi - 1],
                    ];
                    setEditProgram(c);
                  }}
                >
                  ↑
                </button>
              )}
            </div>
            {w.exercises.map((e, ei) => (
              <div className="editor-exercise" key={ei}>
                <select
                  aria-label={t("Replace")}
                  value={e.exerciseId}
                  onChange={(ev) => {
                    const c = clone(editProgram);
                    c.workouts[wi].exercises[ei].exerciseId = ev.target.value;
                    setEditProgram(c);
                  }}
                >
                  {d.exercises.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
                <ExercisePicker
                  data={d}
                  currentId={e.exerciseId}
                  t={t}
                  onSelect={(exercise) => {
                    const c = clone(editProgram);
                    c.workouts[wi].exercises[ei].exerciseId = exercise.id;
                    setEditProgram(c);
                  }}
                />
                <div className="row wrap">
                  {(["sets", "min", "max", "rest", "increment"] as const).map(
                    (key, ki) =>
                      input(
                        [
                          "Target sets",
                          "Minimum",
                          "Maximum",
                          "Rest",
                          "Increment (kg)",
                        ][ki],
                        e[key],
                        (v) => {
                          const c = clone(editProgram);
                          c.workouts[wi].exercises[ei][key] = +v;
                          setEditProgram(c);
                        },
                        "number",
                      ),
                  )}
                  {ei > 0 && (
                    <button
                      title={t("Move up")}
                      onClick={() => {
                        const c = clone(editProgram);
                        [
                          c.workouts[wi].exercises[ei - 1],
                          c.workouts[wi].exercises[ei],
                        ] = [
                          c.workouts[wi].exercises[ei],
                          c.workouts[wi].exercises[ei - 1],
                        ];
                        setEditProgram(c);
                      }}
                    >
                      ↑
                    </button>
                  )}
                  <button
                    className="icon danger"
                    aria-label={t("Delete")}
                    onClick={() => {
                      const c = clone(editProgram);
                      c.workouts[wi].exercises.splice(ei, 1);
                      setEditProgram(c);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {button("Add exercise", () => {
              const c = clone(editProgram);
              c.workouts[wi].exercises.push({
                exerciseId: d.exercises[0].id,
                sets: 3,
                min: 8,
                max: 12,
                rest: 90,
                increment: settings.increment,
              });
              setEditProgram(c);
            })}
          </section>
        ))}
        {button("Add workout", () =>
          setEditProgram({
            ...editProgram,
            workouts: [
              ...editProgram.workouts,
              {
                id: C.uid(),
                name: "New workout",
                focus: "Custom",
                exercises: [
                  {
                    exerciseId: d.exercises[0].id,
                    sets: 3,
                    min: 8,
                    max: 12,
                    rest: 90,
                    increment: settings.increment,
                  },
                ],
              },
            ],
          }),
        )}
      </section>
    </div>
  );
}
