import type { Exercise } from "../core";
export function ExerciseDetails({
  id,
  exercises,
  t,
  expanded = false,
  arabic = false,
}: {
  id: string;
  exercises: Exercise[];
  t: (s: string) => string;
  expanded?: boolean;
  arabic?: boolean;
}) {
  const e = exercises.find((x) => x.id === id);
  if (!e) return null;
  const local = (english?: string, ar?: string) =>
    arabic && ar ? ar : t(english || "—");
  return (
    <details open={expanded}>
      <summary>
        {t("Instructions")} · {t("Alternatives")}
      </summary>
      {e.nameAr && (
        <p className="exercise-ar-name" lang="ar" dir="rtl">
          {e.nameAr}
        </p>
      )}
      <p>
        {t("Primary muscle")}: {t(e.muscle)} {e.regions?.map(t).join(" · ")}
      </p>
      <p>
        {t("Secondary")}: {e.secondary.map(t).join(" · ") || "—"}
      </p>
      <p>
        {t("Equipment")}: {t(e.equipmentType || e.equipment)} ·{" "}
        {t(e.kind || e.category)} · {t(e.difficulty || "Custom")}
      </p>
      <p>
        {t("Movement pattern")}: {t(e.pattern || "Custom")} ·{" "}
        {t(e.unilateral ? "Unilateral" : "Bilateral")}
      </p>
      <p>
        {t("Rest")}: {e.rest}s · {t("Suggested range")}:{" "}
        {e.suggestedReps?.join("–") || "—"}{" "}
        {t(e.tracking === "seconds" ? "seconds" : "Reps")}
      </p>
      <p>
        {t("Additional loading")}:{" "}
        {t(e.additionalLoading ? "Supported" : "Not specified")}
      </p>
      {e.startingPosition && (
        <>
          <strong>{t("Starting position")}</strong>
          <p>{local(e.startingPosition, e.startingPositionAr)}</p>
        </>
      )}
      <strong>{t("Execution")}</strong>
      <p>{local(e.instructions, e.instructionsAr)}</p>
      {e.breathing && (
        <>
          <strong>{t("Breathing")}</strong>
          <p>{local(e.breathing, e.breathingAr)}</p>
        </>
      )}
      <strong>{t("Mistakes")}</strong>
      <p>{local(e.mistakes, e.mistakesAr)}</p>
      {e.safety && (
        <>
          <strong>{t("Safety considerations")}</strong>
          <p>{local(e.safety, e.safetyAr)}</p>
        </>
      )}
      <strong>{t("Alternatives")}</strong>
      <p>{e.alternatives.join(" · ") || "—"}</p>
    </details>
  );
}
