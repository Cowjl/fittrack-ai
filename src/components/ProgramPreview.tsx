import type { Data, Program, Exercise } from "../core";
import { estimateWorkout, weeklyVolume } from "../planning/engine";
export function ProgramPreview({
  program,
  exercises,
  t,
}: {
  program: Program;
  exercises: Exercise[];
  t: (s: string) => string;
}) {
  const volume = weeklyVolume(program, exercises),
    info = program.info;
  return (
    <div className="program-preview">
      <p className="eyebrow">FITTRACK AI 2.0 · {t("Workout plans")}</p>
      <h1>
        {info?.config &&
        program.name === `${info.goal} · ${Math.min(info.config.days, 6)} days`
          ? `${t(info.goal)} · ${info.frequency} ${t("days per week")}`
          : t(program.name)}
      </h1>
      {info && (
        <>
          <p>{t(info.description)}</p>
          <div className="plan-badges">
            <span>{t(info.goal)}</span>
            <span>{t(info.difficulty)}</span>
            <span>
              {info.frequency} {t("days per week")}
            </span>
          </div>
          <p>{t(info.rationale)}</p>
          <p>
            <b>{t("Equipment requirements")}</b>:{" "}
            {info.equipment.map(t).join(" · ")}
          </p>
          <details>
            <summary>{t("Progression method")}</summary>
            <p>{t(info.progression)}</p>
          </details>
          {info.warnings.map((w) => (
            <p className="plan-warning" key={w}>
              {t(w)}
            </p>
          ))}
        </>
      )}
      <h3>{t("Weekly set volume")}</h3>
      <div className="plan-badges">
        {Object.entries(volume).map(([m, n]) => (
          <span key={m}>
            {t(m)} <b>{n}</b>
          </span>
        ))}
      </div>
      <p>
        {t(
          "Direct primary-muscle sets; compound lifts also train the listed secondary muscles.",
        )}
      </p>
      {program.workouts.map((w) => (
        <section className="card preview-day" key={w.id}>
          <div className="section-title">
            <h3>{t(w.name)}</h3>
            <span>
              {estimateWorkout(w, exercises)} {t("minutes")}
              {w.weekday ? " · " + t(w.weekday) : ""}
            </span>
          </div>
          <p>
            {w.recovery
              ? t("Active recovery — keep the effort easy.")
              : w.focus.split(" · ").map(t).join(" · ")}
          </p>
          {w.exercises.map((p, i) => {
            const e = exercises.find((e) => e.id === p.exerciseId);
            return (
              <div className="program-ex" key={i}>
                <span dir="ltr">{e?.name || p.exerciseId}</span>
                <b>
                  {p.sets} × {p.min}–{p.max}
                  {e?.tracking === "seconds" ? " " + t("seconds") : ""}
                  <small>
                    {p.rest}s {t("Rest")}
                  </small>
                </b>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
