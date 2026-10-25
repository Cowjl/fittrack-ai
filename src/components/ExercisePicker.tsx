import { useState } from "react";
import type { Data, Exercise } from "../core";
import { ExerciseBrowser } from "./ExerciseBrowser";
export function ExercisePicker({
  data,
  currentId,
  onSelect,
  t,
}: {
  data: Data;
  currentId: string;
  onSelect: (e: Exercise) => void;
  t: (s: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const original = data.exercises.find((e) => e.id === currentId);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {t("Search / replace")}
      </button>
      {open && (
        <div className="overlay picker-overlay" role="dialog" aria-modal="true">
          <section className="modal wide card">
            <div className="sticky-modal">
              <h2>
                {t("Replace")} {original?.name}
              </h2>
              <button onClick={() => setOpen(false)}>{t("Close")}</button>
            </div>
            <ExerciseBrowser
              compact
              data={data}
              t={t}
              original={original}
              equipment={data.planProfile?.equipment}
              excluded={data.planProfile?.excluded}
              onSelect={(e) => {
                onSelect(e);
                setOpen(false);
              }}
            />
          </section>
        </div>
      )}
    </>
  );
}
