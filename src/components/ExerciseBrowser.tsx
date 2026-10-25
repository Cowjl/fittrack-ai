import { useMemo, useState } from "react";
import { Search, Star, Clock, Plus, X } from "lucide-react";
import type { Data, Exercise } from "../core";
import { muscles } from "../core";
import {
  equipmentTypes,
  patterns,
  searchExercises,
  substitutions,
  type ExerciseFilters,
} from "../catalog";
import { ExerciseDetails } from "./ExerciseDetails";
interface Props {
  data: Data;
  t: (s: string) => string;
  onEdit?: (e: Exercise) => void;
  onFavorite?: (id: string) => void;
  onSelect?: (e: Exercise) => void;
  original?: Exercise;
  equipment?: import("../catalog").EquipmentType[];
  excluded?: string[];
  compact?: boolean;
}
export function ExerciseBrowser({
  data,
  t,
  onEdit,
  onFavorite,
  onSelect,
  original,
  equipment,
  excluded,
  compact,
}: Props) {
  const [filters, setFilters] = useState<ExerciseFilters>({}),
    [limit, setLimit] = useState(30),
    [detail, setDetail] = useState<Exercise | null>(null),
    [manual, setManual] = useState(!original);
  const recent = [
    ...new Set(
      [
        ...(data.active ? [data.active] : []),
        ...[...data.sessions].sort((a, b) => b.start - a.start),
      ].flatMap((s) =>
        s.exercises
          .filter((e) => e.logs.some((l) => l.done))
          .map((e) => e.exerciseId),
      ),
    ),
  ];
  const ranked = useMemo(
    () =>
      original
        ? substitutions(original, data.exercises, {
            equipment,
            excluded,
            preferred: data.planProfile?.preferred,
          }).map((x) => x.exercise)
        : [],
    [original, data.exercises, equipment, excluded, data.planProfile],
  );
  const results = searchExercises(
    original && !manual ? ranked : data.exercises,
    { ...filters, favoriteIds: data.settings.favorites, recentIds: recent },
  );
  const set = (key: keyof ExerciseFilters, value: string | boolean) => {
    setFilters({ ...filters, [key]: value });
    setLimit(30);
  };
  const select = (
    label: string,
    key: keyof ExerciseFilters,
    values: readonly string[],
  ) => (
    <label className="field">
      <span>{t(label)}</span>
      <select
        value={String(filters[key] || "All")}
        onChange={(e) => set(key, e.target.value)}
      >
        <option value="All">{t("All")}</option>
        {values.map((v) => (
          <option value={v} key={v}>
            {t(v)}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className={"exercise-browser " + (compact ? "compact" : "")}>
      <div className="search-box">
        <Search size={18} />
        <input
          aria-label={t("Search exercises")}
          placeholder={t("Search Arabic, English or synonyms")}
          value={filters.query || ""}
          onChange={(e) => set("query", e.target.value)}
        />
      </div>
      {original && (
        <>
          <p className="coach">
            {t(
              "Suggested replacements match primary muscle, movement and function. Check setup and load before switching.",
            )}
          </p>
          <div className="row wrap">
            <button
              className={!manual ? "primary" : ""}
              onClick={() => setManual(false)}
            >
              {t("Similar exercises")}
            </button>
            <button onClick={() => setManual(true)}>
              {t("Browse all exercises")}
            </button>
          </div>
          {manual && (
            <p>
              {t(
                "Manual choices may have a different training function. Review sets and targets.",
              )}
            </p>
          )}
        </>
      )}
      <details open={!compact} className="filter-panel">
        <summary>
          {t("Filters")} · {results.length} {t("exercises")}
        </summary>
        <div className="filter-grid">
          {select("Primary muscle", "muscle", [
            ...muscles,
            "Upper chest",
            "Mid chest",
            "Lower chest",
            "Lats",
            "Upper back",
            "Mid back",
            "Lower traps",
            "Middle traps",
            "Brachialis",
            "Brachioradialis",
            "Deep core",
          ])}
          {select("Equipment", "equipment", equipmentTypes)}
          {select("Difficulty", "difficulty", [
            "Beginner",
            "Intermediate",
            "Advanced",
          ])}
          {select("Movement pattern", "pattern", patterns)}
          {select("Exercise function", "kind", [
            "Compound",
            "Isolation",
            "Conditioning",
            "Mobility",
          ])}
        </div>
        <div className="row wrap">
          <button
            className={filters.favoritesOnly ? "primary" : ""}
            onClick={() => set("favoritesOnly", !filters.favoritesOnly)}
          >
            <Star size={15} />
            {t("Favorites")}
          </button>
          <button
            className={filters.recentOnly ? "primary" : ""}
            onClick={() => set("recentOnly", !filters.recentOnly)}
          >
            <Clock size={15} />
            {t("Recently used")}
          </button>
          <button
            onClick={() => {
              setFilters({});
              setLimit(30);
            }}
          >
            {t("Reset filters")}
          </button>
        </div>
      </details>
      <div className="section-title">
        <small>
          {results.length} / {data.exercises.length} {t("exercises")}
        </small>
        {onEdit && !onSelect && (
          <button
            onClick={() =>
              onEdit({
                id: crypto.randomUUID(),
                name: "",
                nameAr: "",
                muscle: "Chest",
                secondary: [],
                equipment: "Dumbbell",
                equipmentType: "Dumbbell",
                pattern: "Horizontal Push",
                kind: "Compound",
                category: "Custom",
                source: "custom",
                difficulty: "Beginner",
                instructions: "",
                mistakes: "",
                alternatives: [],
                rest: 90,
                eligible: false,
                tracking: "reps",
              })
            }
          >
            <Plus size={16} />
            {t("New exercise")}
          </button>
        )}
      </div>
      <div className={compact ? "pick-list" : "two-col"}>
        {results.slice(0, limit).map((e) => (
          <section className="card exercise-result" key={e.id}>
            <div className="row">
              <div className="grow">
                <h3 dir="ltr">{e.name}</h3>
                {e.nameAr && (
                  <p lang="ar" dir="rtl">
                    {e.nameAr}
                  </p>
                )}
              </div>
              {onFavorite && (
                <button
                  className="icon"
                  aria-label={t("Favorite") + " " + e.name}
                  aria-pressed={!!data.settings.favorites?.includes(e.id)}
                  onClick={() => onFavorite(e.id)}
                >
                  <Star
                    size={20}
                    className={
                      data.settings.favorites?.includes(e.id) ? "lime" : ""
                    }
                    fill={
                      data.settings.favorites?.includes(e.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              )}
            </div>
            <p>
              {t(e.muscle)} · {t(e.equipmentType || e.equipment)}
            </p>
            <small>
              {t(e.pattern || "Custom")} · {t(e.difficulty || "Custom")}
            </small>
            <div className="row wrap">
              {onSelect && (
                <button className="primary" onClick={() => onSelect(e)}>
                  {t("Choose exercise")}
                </button>
              )}
              <button onClick={() => setDetail(e)}>
                {t("Exercise details")}
              </button>
              {onEdit && !onSelect && (
                <button onClick={() => onEdit(structuredClone(e))}>
                  {t("Edit")}
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
      {!results.length && (
        <div className="empty">
          <Search size={30} />
          <h3>{t("No matching exercises")}</h3>
          <p>{t("Try another name or reset the filters.")}</p>
        </div>
      )}
      {results.length > limit && (
        <button className="load-more" onClick={() => setLimit(limit + 30)}>
          {t("Show more")}
        </button>
      )}
      {detail && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label={detail.name}
        >
          <section className="modal wide card">
            <div className="sticky-modal">
              <h2 dir="ltr">{detail.name}</h2>
              <button
                className="icon"
                aria-label={t("Close")}
                onClick={() => setDetail(null)}
              >
                <X />
              </button>
            </div>
            <ExerciseDetails
              id={detail.id}
              exercises={data.exercises}
              t={t}
              expanded
              arabic={data.settings.lang === "ar"}
            />
          </section>
        </div>
      )}
    </div>
  );
}
