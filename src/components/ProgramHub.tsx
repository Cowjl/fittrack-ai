import { useMemo, useState } from "react";
import { Check, Dumbbell, Plus, Sparkles, X } from "lucide-react";
import type { Data, Program, Exercise } from "../core";
import { defaultProgram, uid } from "../core";
import { templates } from "../planning/templates";
import {
  duplicateProgram,
  estimateWorkout,
  generatePlan,
  planIssues,
  savePlan,
  weeklyVolume,
} from "../planning/engine";
import { ExerciseBrowser } from "./ExerciseBrowser";
import { PlanBuilder } from "./PlanBuilder";
import { ProgramPreview } from "./ProgramPreview";
import { ProgramEditor } from "./ProgramEditor";
interface Props {
  data: Data;
  view: string;
  onView: (s: string) => void;
  t: (s: string) => string;
  update: (fn: (d: Data) => void) => void;
  onEditExercise: (e: Exercise) => void;
  onStartPlan: (p: Program) => void;
  notify: (s: string) => void;
  setError: (s: string) => void;
}
export function ProgramHub({
  data,
  view,
  onView,
  t,
  update,
  onEditExercise,
  onStartPlan,
  notify,
  setError,
}: Props) {
  const [preview, setPreview] = useState<Program | null>(null),
    [editor, setEditor] = useState<Program | null>(null),
    [compare, setCompare] = useState<string[]>([]),
    [filter, setFilter] = useState("All");
  const library = useMemo(() => templates(data.exercises), [data.exercises]);
  const v =
    view === "Library"
      ? "Exercise Library"
      : view === "Program" || !view
        ? "My Programs"
        : view;
  const btn = (label: string, fn: () => void, cls = "") => (
    <button className={cls} onClick={fn}>
      {t(label)}
    </button>
  );
  const input = (
    label: string,
    value: string | number,
    fn: (s: string) => void,
    type = "text",
  ) => (
    <label className="field">
      <span>{t(label)}</span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(e) => fn(e.target.value)}
      />
    </label>
  );
  const favorite = (id: string) =>
    update((d) => {
      const list = d.settings.favorites || [];
      d.settings.favorites = list.includes(id)
        ? list.filter((x) => x !== id)
        : [...list, id];
    });
  function persist(p: Program, activate: boolean) {
    const issues = planIssues(p, data.exercises);
    if (issues.length) {
      setError(issues.map(t).join(" "));
      return;
    }
    let copy = p;
    if (p.source === "template") {
      copy = duplicateProgram(p, uid());
      copy.name = p.name;
    }
    update((d) => savePlan(d, copy, activate));
    notify(t(activate ? "Plan activated" : "Plan saved"));
    setPreview(null);
    onView("My Programs");
  }
  const cards = (list: Program[], ready = false) =>
    list.map((p) => (
      <section className="card plan-card" key={p.id}>
        <div className="row">
          <div className="plan-symbol">
            <Dumbbell size={22} />
          </div>
          <div className="grow">
            <h3>
              {p.info?.config &&
              p.name ===
                `${p.info.goal} · ${Math.min(p.info.config.days, 6)} days`
                ? `${t(p.info.goal)} · ${p.info.frequency} ${t("days per week")}`
                : t(p.name)}
            </h3>
            <p>
              {p.info ? t(p.info.goal) : t("My Programs")} · {p.workouts.length}{" "}
              {t("workouts")}
            </p>
          </div>
          {p.id === data.settings.programId && (
            <span className="pill">
              <Check size={14} />
              {t("Active")}
            </span>
          )}
        </div>
        <div className="plan-badges">
          <span>{t(p.info?.difficulty || "Custom")}</span>
          <span>
            {Math.min(
              ...p.workouts.map((w) => estimateWorkout(w, data.exercises)),
            )}
            –
            {Math.max(
              ...p.workouts.map((w) => estimateWorkout(w, data.exercises)),
            )}{" "}
            {t("minutes")}
          </span>
        </div>
        <div className="row wrap">
          {btn("Preview", () => setPreview(structuredClone(p)))}
          {btn(
            ready ? "Save Plan" : "Activate Plan",
            () => persist(p, !ready),
            ready ? "" : "primary",
          )}
          {btn("Customize", () => {
            setPreview(structuredClone(p));
            setEditor(structuredClone(p));
          })}
          {btn("Duplicate", () => {
            const copy = duplicateProgram(p, uid());
            update((d) => savePlan(d, copy));
            notify(t("Plan saved"));
          })}
          {ready && (
            <label className="row compare-check">
              <input
                type="checkbox"
                checked={compare.includes(p.id)}
                disabled={compare.length >= 2 && !compare.includes(p.id)}
                onChange={(e) =>
                  setCompare(
                    e.target.checked
                      ? [...compare, p.id]
                      : compare.filter((x) => x !== p.id),
                  )
                }
              />
              <small>{t("Compare")}</small>
            </label>
          )}
        </div>
      </section>
    ));
  return (
    <>
      <div className="hub-heading">
        <div>
          <p className="eyebrow">{t("Workout plans")}</p>
          <h1>{t("Your training, your way.")}</h1>
        </div>
        <button className="primary" onClick={() => onView("Build My Plan")}>
          <Sparkles size={17} />
          {t("Build My Plan")}
        </button>
      </div>
      <div className="tabs hub-tabs">
        {[
          "My Programs",
          "Ready-Made Plans",
          "Build My Plan",
          "Exercise Library",
        ].map((x) => (
          <button
            className={v === x ? "active" : ""}
            key={x}
            onClick={() => onView(x)}
          >
            {t(x)}
          </button>
        ))}
      </div>
      {v === "Exercise Library" && (
        <ExerciseBrowser
          data={data}
          t={t}
          onEdit={onEditExercise}
          onFavorite={favorite}
        />
      )}
      {v === "My Programs" && (
        <>
          <div className="section-title">
            <p>
              {t(
                "Switch programs freely. History and active sessions keep their original details.",
              )}
            </p>
            <button
              onClick={() => {
                const copy = duplicateProgram(defaultProgram(), uid());
                copy.name = t("My program");
                setPreview(copy);
                setEditor(copy);
              }}
            >
              <Plus size={16} />
              {t("New program")}
            </button>
          </div>
          {data.settings.activationHistory?.length
            ? btn("Restore previous program", () => {
                const id = [...data.settings.activationHistory!]
                  .reverse()
                  .find(
                    (id) =>
                      id !== data.settings.programId &&
                      data.programs.some((p) => p.id === id),
                  );
                if (id)
                  persist(
                    data.programs.find((p) => p.id === id)!,
                    true,
                  );
              })
            : null}
          <div className="two-col">{cards(data.programs)}</div>
        </>
      )}
      {v === "Ready-Made Plans" && (
        <>
          <div className="row filters">
            <select
              aria-label={t("Difficulty")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["All", "Beginner", "Intermediate", "Advanced"].map((x) => (
                <option key={x} value={x}>
                  {t(x)}
                </option>
              ))}
            </select>
            <p>
              {library.length} {t("ready-made programs")}
            </p>
          </div>
          {compare.length === 2 && (
            <section className="card comparison">
              <h3>{t("Compare programs")}</h3>
              <table>
                <thead>
                  <tr>
                    <th>{t("Program")}</th>
                    {compare.map((id) => (
                      <th key={id}>
                        {t(library.find((p) => p.id === id)!.name)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["days per week", "Weekly sets", "Equipment"].map(
                    (label, i) => (
                      <tr key={label}>
                        <th>{t(label)}</th>
                        {compare.map((id) => {
                          const p = library.find((p) => p.id === id)!;
                          return (
                            <td key={id}>
                              {i === 0
                                ? p.workouts.length
                                : i === 1
                                  ? Object.values(
                                      weeklyVolume(p, data.exercises),
                                    ).reduce((a, b) => a + b, 0)
                                  : p.info!.equipment.map(t).join(" · ")}
                            </td>
                          );
                        })}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </section>
          )}
          <div className="two-col">
            {cards(
              library.filter(
                (p) => filter === "All" || p.info?.difficulty === filter,
              ),
              true,
            )}
          </div>
        </>
      )}
      {v === "Build My Plan" && (
        <PlanBuilder
          data={data}
          t={t}
          onPreview={(p) => setPreview(p)}
          onSkip={() => {
            update((d) => {
              d.settings.onboardingDismissed = true;
            });
            onView("My Programs");
          }}
        />
      )}
      {preview && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t("Review program")}
        >
          <section className="modal wide card">
            <div className="sticky-modal">
              <h2>{t("Review program")}</h2>
              <button
                className="icon"
                aria-label={t("Close")}
                onClick={() => setPreview(null)}
              >
                <X />
              </button>
            </div>
            <ProgramPreview
              program={preview}
              exercises={data.exercises}
              t={t}
            />
            {planIssues(preview, data.exercises).map((issue) => (
              <p className="plan-warning" key={issue}>
                {t(issue)}
              </p>
            ))}
            <div className="preview-actions">
              <button onClick={() => setEditor(structuredClone(preview))}>
                {t("Customize")}
              </button>
              {preview.info?.config && (
                <button
                  onClick={() => {
                    const c = structuredClone(preview.info!.config!);
                    c.seed++;
                    setPreview(generatePlan(c, data.exercises).program);
                  }}
                >
                  {t("Regenerate")}
                </button>
              )}
              <button
                disabled={!!planIssues(preview, data.exercises).length}
                onClick={() => persist(preview, false)}
              >
                {t("Save Plan")}
              </button>
              <button
                className="primary"
                disabled={!!planIssues(preview, data.exercises).length}
                onClick={() => persist(preview, true)}
              >
                {t("Activate Plan")}
              </button>
              <button
                disabled={!!planIssues(preview, data.exercises).length}
                onClick={() => {
                  let p = preview;
                  if (p.source === "template") {
                    p = duplicateProgram(p, uid());
                    p.name = preview.name;
                  }
                  onStartPlan(p);
                  setPreview(null);
                }}
              >
                {t("Start training")}
              </button>
            </div>
          </section>
        </div>
      )}
      {editor && (
        <ProgramEditor
          editProgram={editor}
          setEditProgram={setEditor}
          d={data}
          t={t}
          button={btn}
          input={input}
          setError={setError}
          update={(fn) => {
            const draft = structuredClone(data);
            fn(draft);
            const edited = draft.programs.find((p) => p.id === editor.id)!;
            setPreview(edited);
          }}
        />
      )}
    </>
  );
}
