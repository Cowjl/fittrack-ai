import * as C from "../core";
export function ExerciseDetails({
  id,
  exercises,
  t,
}: {
  id: string;
  exercises: C.Exercise[];
  t: (s: string) => string;
}) {
  const e = exercises.find((e) => e.id === id);
  return e ? (
    <details>
      <summary>
        {t("Instructions")} · {t("Alternatives")}
      </summary>
      <p>
        {t("Primary muscle")}: {t(e.muscle)}{" "}
        {e.secondary.length
          ? ` · ${t("Secondary")}: ${e.secondary.map(t).join(", ")}`
          : ""}
      </p>
      <p>
        {t(e.equipment)} · {t(e.category)} · {e.rest}s
      </p>
      <p>{t(e.instructions)}</p>
      <strong>{t("Mistakes")}</strong>
      <p>{t(e.mistakes)}</p>
      <strong>{t("Alternatives")}</strong>
      <p>{e.alternatives.join(" · ") || "—"}</p>
    </details>
  ) : null;
}
