import { ExerciseEditor } from "./components/ExerciseEditor";
import { ProgramEditor } from "./components/ProgramEditor";
import { ExerciseDetails } from "./components/ExerciseDetails";
import { WorkoutExercises } from "./components/WorkoutExercises";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Home,
  LayoutGrid,
  Play,
  Plus,
  Settings as Gear,
  Shield,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  WifiOff,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { registerSW } from "virtual:pwa-register";
import * as C from "./core";
import { load, save, StorageConflictError } from "./db";
import { ar } from "./i18n";
import "./style.css";
let offlineReady = false;
registerSW({
  onOfflineReady() {
    offlineReady = true;
    window.dispatchEvent(new Event("offline-ready"));
  },
});
const clone = <T,>(x: T): T => structuredClone(x);
function App() {
  const [data, setData] = useState<C.Data | null>(null),
    [tab, setTab] = useState("Home"),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [ready, setReady] = useState(offlineReady),
    [sub, setSub] = useState(""),
    [summary, setSummary] = useState<C.Session | null>(null),
    [editProgram, setEditProgram] = useState<C.Program | null>(null),
    [editExercise, setEditExercise] = useState<C.Exercise | null>(null),
    [editSession, setEditSession] = useState<C.Session | null>(null),
    [search, setSearch] = useState(""),
    [muscle, setMuscle] = useState("All"),
    [period, setPeriod] = useState(30),
    [chartEx, setChartEx] = useState("e0"),
    [now, setNow] = useState(Date.now()),
    [timerCustom, setTimerCustom] = useState(90),
    [compare, setCompare] = useState("");
  const current = useRef<C.Data | null>(null),
    queue = useRef(Promise.resolve()),
    file = useRef<HTMLInputElement>(null),
    notified = useRef(0),
    storageConflict = useRef(false),
    pendingSaves = useRef(0);
  useEffect(() => {
    load()
      .then((d) => {
        current.current = d;
        setData(d);
      })
      .catch(() =>
        setError("IndexedDB unavailable. Enable browser storage and reload."),
      );
    const t = setInterval(() => setNow(Date.now()), 1000);
    const fn = () => setReady(true);
    navigator.serviceWorker?.ready.then(() => setReady(true)).catch(() => {});
    window.addEventListener("offline-ready", fn);
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingSaves.current > 0 || storageConflict.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      clearInterval(t);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("offline-ready", fn);
    };
  }, []);
  const t = (s: string) => (data?.settings.lang === "ar" ? ar[s] || s : s);
  useEffect(() => {
    document.documentElement.dir = data?.settings.lang === "en" ? "ltr" : "rtl";
    document.documentElement.lang = data?.settings.lang || "ar";
  }, [data?.settings.lang]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  function update(fn: (d: C.Data) => void) {
    if (!current.current || storageConflict.current) return;
    const d = clone(current.current);
    fn(d);
    current.current = d;
    setData(d);
    setStatus("Saving…");
    pendingSaves.current++;
    const completion = queue.current
      .then(() => save(d))
      .then(() => {
        pendingSaves.current--;
        if (!pendingSaves.current) setStatus("Saved");
        return true;
      })
      .catch((error) => {
        pendingSaves.current--;
        setStatus("Unsaved changes");
        if (error instanceof StorageConflictError) {
          storageConflict.current = true;
          setError(t(error.message));
          return false;
        }
        setError(
          t("Storage unavailable. Export your data and free browser storage."),
        );
        return false;
      });
    queue.current = completion.then(() => {});
    return completion;
  }

  const timerEnd = data?.settings.timerEnd;
  useEffect(() => {
    if (timerEnd && now >= timerEnd && notified.current !== timerEnd) {
      notified.current = timerEnd;
      setToast(t("Rest timer"));
      if (data?.settings.sound) {
        try {
          const ac = new AudioContext();
          const o = ac.createOscillator(),
            g = ac.createGain();
          o.connect(g);
          g.connect(ac.destination);
          g.gain.value = 0.1;
          o.start();
          o.stop(ac.currentTime + 0.35);
          o.onended = () => void ac.close();
        } catch {}
      }
    }
  }, [now, timerEnd]);
  if (!data)
    return (
      <div className="loading">
        <Dumbbell size={40} />
        <h1>
          FITTRACK <em>AI</em>
        </h1>
        <p>{error || "Loading your training space…"}</p>
      </div>
    );
  const d = data,
    settings = d.settings,
    p = d.programs.find((p) => p.id === settings.programId) || d.programs[0],
    next = C.nextWorkout(p, d.sessions),
    active = d.active,
    history = [...d.sessions].sort((a, b) => b.start - a.start),
    weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekly = history.filter((s) => s.end! >= +weekStart),
    prs = C.records(history),
    factor = settings.unit === "lb" ? 2.2046226218 : 1,
    weight = (v: number) => Math.round(v * factor * 100) / 100,
    unit = settings.unit,
    date = (n: number) =>
      new Date(n).toLocaleDateString(settings.lang, {
        month: "short",
        day: "numeric",
      }),
    n = (v: number) =>
      v.toLocaleString(settings.lang, { maximumFractionDigits: 2 });
  const button = (label: string, fn: () => void, cls = "") => (
    <button className={cls} onClick={fn}>
      {t(label)}
    </button>
  );
  function start(w: C.Workout) {
    if (active) {
      setToast(t("Active session exists"));
      setTab("Workout");
      return;
    }
    update((d) => {
      d.active = C.startSession(w, p, d.exercises);
    });
    setTab("Workout");
    setSub("");
  }
  function changeActive(fn: (s: C.Session) => void) {
    update((d) => {
      if (d.active) fn(d.active);
    });
  }
  function timer(seconds: number) {
    update((d) => {
      d.settings.timerEnd = Date.now() + seconds * 1000;
      d.settings.timerRemaining = undefined;
    });
  }
  async function finish() {
    try {
      const completed = C.finishSession(active!);
      const saved = await update((d) => {
        if (!d.sessions.some((s) => s.id === completed.id))
          d.sessions.push(completed);
        d.active = null;
        d.settings.timerEnd = undefined;
        d.settings.timerRemaining = undefined;
      });
      if (!saved) return;
      setSummary(completed);
      setToast(t("Session saved"));
    } catch (e) {
      setError(t((e as Error).message));
    }
  }
  async function share(text: string) {
    try {
      if (navigator.share)
        await navigator.share({ title: "FitTrack AI", text });
      else {
        await navigator.clipboard.writeText(text);
        setToast(t("Copied"));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(t((e as Error).message));
    }
  }
  function exportData() {
    const blob = new Blob([C.backup(current.current!)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fittrack-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    update((d) => {
      d.settings.lastBackup = Date.now();
    });
  }
  function input(
    label: string,
    value: string | number,
    onChange: (v: string) => void,
    type = "text",
  ) {
    return (
      <label className="field">
        <span>{t(label)}</span>
        <input
          type={type}
          min={type === "number" ? 0 : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }
  const empty = (
    <div className="empty">
      <Activity size={36} />
      <h3>{t("No workouts yet")}</h3>
      <p>{t("Complete your first session to see your progress.")}</p>
    </div>
  );
  const workoutCard = (w: C.Workout, i: number) => (
    <div className="card workout-choice" key={w.id}>
      <div className="number">{String(i + 1).padStart(2, "0")}</div>
      <div>
        <h3 dir="ltr">{w.name}</h3>
        <p>{t(w.focus)}</p>
        <small>
          {w.exercises.length} {t("exercises")} ·{" "}
          {w.exercises.reduce((n, e) => n + e.sets, 0)} {t("sets")}
        </small>
      </div>
      <button
        className="icon"
        aria-label={t("Start workout")}
        onClick={() => start(w)}
      >
        <Play size={19} />
      </button>
    </div>
  );
  const exerciseInfo = (id: string) => (
    <ExerciseDetails id={id} exercises={d.exercises} t={t} />
  );
  function logsUI(s: C.Session, isActive: boolean) {
    const mutate = (fn: (s: C.Session) => void) =>
      isActive
        ? changeActive(fn)
        : setEditSession((prev) => {
            const copy = clone(prev!);
            fn(copy);
            return copy;
          });
    return (
      <WorkoutExercises
        {...{
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
        }}
      />
    );
  }
  return (
    <div className="app">
      <aside>
        <a className="brand" href="#" onClick={() => setTab("Home")}>
          <div className="brand-icon">
            <Dumbbell />
          </div>
          <span>
            FITTRACK <em>AI</em>
          </span>
        </a>
        <p className="sidebar-label">YOUR TRAINING SPACE</p>
        <nav>
          {["Home", "Workout", "Program", "Progress", "Settings"].map(
            (x, i) => {
              const Icon = [Home, Dumbbell, LayoutGrid, TrendingUp, Gear][i];
              return (
                <button
                  key={x}
                  className={tab === x ? "selected" : ""}
                  onClick={() => {
                    setTab(x);
                    setSub("");
                  }}
                >
                  <Icon size={21} />
                  <span>{t(x)}</span>
                  {tab === x && <span className="nav-dot" />}
                </button>
              );
            },
          )}
        </nav>
        <div className="sidebar-bottom">
          <Shield size={20} />
          <p>{t("Data saved on this device")}</p>
          <small>FITTRACK AI · 1.0</small>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <span className="eyebrow">FITTRACK / {t(tab).toUpperCase()}</span>
            <h2>{t(tab)}</h2>
          </div>
          <div className="header-status">
            <span className="live-dot" />
            {t(status || "Saved")}
            <button className="avatar" onClick={() => setTab("Settings")}>
              FT
            </button>
          </div>
        </header>
        {error && (
          <div role="alert" className="alert">
            <span>{error}</span>
            {status === "Unsaved changes" && (
              <div className="row wrap">
                {button("Export backup", exportData)}
                {!storageConflict.current &&
                  button("Retry save", () => {
                    void update(() => {});
                  })}
                {button("Reload", () => location.reload())}
              </div>
            )}
            <button className="icon" onClick={() => setError("")}>
              <X />
            </button>
          </div>
        )}
        {tab === "Home" && (
          <>
            <div className="greeting">
              <div>
                <p>
                  {new Date().toLocaleDateString(settings.lang, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h1>
                  {t("Train with intention.")}
                  <br />
                  <span>{t("Build your strongest self.")}</span>
                </h1>
              </div>
              <div className="streak">
                <Flame />
                <b>{weekly.length}</b>
                <small>{t("This week")}</small>
              </div>
            </div>
            <div className="home-grid">
              <section className="hero">
                <div className="hero-top">
                  <span className="pill">
                    <span className="live-dot" />
                    {t("Recommended workout")}
                  </span>
                  <span>
                    0{p.workouts.indexOf(next) + 1} / 0{p.workouts.length}
                  </span>
                </div>
                <div className="hero-body">
                  <div>
                    <p className="eyebrow">
                      {p.name} · {t("Your next chapter")}
                    </p>
                    <h2 dir="ltr">
                      {next.name}
                      <ArrowUpRight size={46} />
                    </h2>
                    <p>{t(next.focus)}</p>
                    <div className="hero-meta">
                      <span>
                        <Dumbbell size={17} />
                        {next.exercises.length} {t("exercises")}
                      </span>
                      <span>
                        <LayoutGrid size={17} />
                        {next.exercises.reduce((n, e) => n + e.sets, 0)}{" "}
                        {t("Working sets")}
                      </span>
                    </div>
                  </div>
                  <div className="hero-art" aria-hidden="true">
                    <Dumbbell strokeWidth={1} size={150} />
                  </div>
                </div>
                <button
                  className="primary start"
                  onClick={() =>
                    active ? (setTab("Workout"), setSub("")) : start(next)
                  }
                >
                  <Play size={19} fill="currentColor" />
                  {t(active ? "Resume" : "Start workout")}
                  <ChevronRight size={19} />
                </button>
              </section>
              <section className="card next-card">
                <div className="section-title">
                  <Timer size={20} />
                  <span>{t("Next in sequence")}</span>
                </div>
                <h2 dir="ltr">
                  {
                    p.workouts[
                      (p.workouts.indexOf(next) + 1) % p.workouts.length
                    ].name
                  }
                </h2>
                <p>
                  {
                    p.workouts[
                      (p.workouts.indexOf(next) + 1) % p.workouts.length
                    ].focus
                  }
                </p>
                <div className="divider" />
                <small>{t("Last workout")}</small>
                <h3>{history[0]?.name || "—"}</h3>
                <p>
                  {history[0] ? date(history[0].end!) : t("No workouts yet")}
                </p>
              </section>
            </div>
            <div className="stats">
              <div className="card stat">
                <span>
                  <Activity />
                  {t("This week")}
                </span>
                <b>
                  {n(weekly.length)} <small>{t("workouts")}</small>
                </b>
                <div className="week-dots">
                  {Array.from({ length: 7 }, (_, i) => (
                    <i
                      className={
                        weekly.some(
                          (s) => new Date(s.end!).getDay() === (i + 1) % 7,
                        )
                          ? "hit"
                          : ""
                      }
                      key={i}
                    >
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </i>
                  ))}
                </div>
              </div>
              <div className="card stat">
                <span>
                  <TrendingUp />
                  {t("Training volume")}
                </span>
                <b>
                  {n(weight(weekly.reduce((a, s) => a + C.volume(s), 0)))}{" "}
                  <small>{unit}</small>
                </b>
                <small>{t("This week")}</small>
              </div>
              <div className="card stat">
                <span>
                  <Trophy />
                  {t("Personal records")}
                </span>
                <b>
                  {Object.keys(prs).length} <small>{t("exercises")}</small>
                </b>
                <small>{t("All time")}</small>
              </div>
            </div>
            <div className="two-col">
              <section className="card">
                <div className="section-title">
                  <h3>{t("Recent activity")}</h3>
                  {button(
                    "History",
                    () => {
                      setTab("Workout");
                      setSub("History");
                    },
                    "text-button",
                  )}
                </div>
                {history.length
                  ? history.slice(0, 4).map((s) => (
                      <button
                        className="activity"
                        key={s.id}
                        onClick={() => setEditSession(clone(s))}
                      >
                        <div className="activity-icon">
                          <Dumbbell size={19} />
                        </div>
                        <div className="grow">
                          <strong>{s.name}</strong>
                          <p>
                            {date(s.end!)} · {n(C.duration(s))} {t("minutes")}
                          </p>
                        </div>
                        <span>
                          {n(weight(C.volume(s)))} {unit}
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))
                  : empty}
              </section>
              <section className="card">
                <div className="section-title">
                  <h3>{t("Personal records")}</h3>
                  <Trophy size={20} className="lime" />
                </div>
                {Object.entries(prs).length ? (
                  Object.entries(prs)
                    .slice(0, 4)
                    .map(([id, r]) => (
                      <div className="record" key={id}>
                        <span>{r.name}</span>
                        <b>
                          {weight(r.weight)} <small>{unit}</small>
                        </b>
                      </div>
                    ))
                ) : (
                  <div className="empty">
                    <Trophy size={36} />
                    <h3>{t("Keep training. Keep growing.")}</h3>
                    <p>
                      {t("Complete your first session to see your progress.")}
                    </p>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
        {tab === "Workout" && (
          <>
            <div className="tabs">
              {["Workout", "History"].map((x) =>
                button(
                  x,
                  () => setSub(x),
                  sub === x || (!sub && x === "Workout") ? "active" : "",
                ),
              )}
            </div>
            {sub === "History" ? (
              <>
                {history.length
                  ? history.map((s) => (
                      <section className="card history-card" key={s.id}>
                        <div className="row">
                          <div className="grow">
                            <h3>{s.name}</h3>
                            <p>
                              {new Date(s.start).toLocaleString(settings.lang)}{" "}
                              · {n(C.duration(s))} {t("minutes")}
                            </p>
                          </div>
                          <b>
                            {n(weight(C.volume(s)))} {unit}
                          </b>
                        </div>
                        <p>{s.exercises.map((e) => e.name).join(" · ")}</p>
                        <div className="row wrap">
                          {button("Edit", () => setEditSession(clone(s)))}
                          {button(
                            "Share summary",
                            () =>
                              void share(
                                `${s.name} · ${date(s.end!)}\n${s.exercises
                                  .map(
                                    (e) =>
                                      `${e.name}: ${C.working(e)
                                        .map(
                                          (l) =>
                                            `${weight(l.weight!)} ${unit} × ${l.reps}`,
                                        )
                                        .join(", ")}`,
                                  )
                                  .join(
                                    "\n",
                                  )}\n${Math.round(C.duration(s))} min · FitTrack AI`,
                              ),
                          )}
                          {button(
                            "Delete",
                            () => {
                              if (confirm(t("Confirm deletion?")))
                                update((d) => {
                                  d.sessions = d.sessions.filter(
                                    (x) => x.id !== s.id,
                                  );
                                });
                            },
                            "danger",
                          )}
                          <select
                            value={compare}
                            onChange={(ev) => setCompare(ev.target.value)}
                            aria-label={t("Compare")}
                          >
                            <option value="">{t("Compare")}</option>
                            {history
                              .filter(
                                (x) =>
                                  x.id !== s.id && x.workoutId === s.workoutId,
                              )
                              .map((x) => (
                                <option key={x.id} value={x.id}>
                                  {x.name} · {date(x.start)}
                                </option>
                              ))}
                          </select>
                          {compare && history.find((x) => x.id === compare) && (
                            <span>
                              {t("Training volume")}:{" "}
                              {n(
                                weight(
                                  C.volume(s) -
                                    C.volume(
                                      history.find((x) => x.id === compare)!,
                                    ),
                                ),
                              )}{" "}
                              {unit} Δ
                            </span>
                          )}
                        </div>
                      </section>
                    ))
                  : empty}
              </>
            ) : active ? (
              <>
                <div className="card session-header">
                  <div>
                    <span className="eyebrow">{t("Active workout")}</span>
                    <h1>{active.name}</h1>
                    <p>
                      {n(C.duration(active))} {t("minutes")} ·{" "}
                      {active.exercises.reduce(
                        (n, e) => n + C.working(e).length,
                        0,
                      )}{" "}
                      {t("Completed sets")}
                    </p>
                  </div>
                  <div className="row wrap">
                    {button(active.pausedAt ? "Resume" : "Pause", () =>
                      changeActive((s) => {
                        if (s.pausedAt) {
                          s.pausedMs += Date.now() - s.pausedAt;
                          s.pausedAt = undefined;
                        } else s.pausedAt = Date.now();
                      }),
                    )}
                    {button("Finish", finish, "primary")}
                    {button(
                      "Cancel",
                      () => {
                        if (confirm(t("Cancel this workout?")))
                          update((d) => {
                            d.active = null;
                            d.settings.timerEnd = undefined;
                          });
                      },
                      "danger",
                    )}
                  </div>
                </div>
                <section className="card timer">
                  <Timer size={24} />
                  <div>
                    <small>{t("Rest timer")}</small>
                    <strong dir="ltr">
                      {Math.floor(
                        Math.max(
                          0,
                          timerEnd
                            ? Math.ceil((timerEnd - now) / 1000)
                            : settings.timerRemaining || 0,
                        ) / 60,
                      )}
                      :
                      {String(
                        Math.max(
                          0,
                          timerEnd
                            ? Math.ceil((timerEnd - now) / 1000)
                            : settings.timerRemaining || 0,
                        ) % 60,
                      ).padStart(2, "0")}
                    </strong>
                  </div>
                  <div className="row wrap">
                    {[60, 90, 120, 180].map((x) => (
                      <button key={x} onClick={() => timer(x)}>
                        {x}s
                      </button>
                    ))}
                    <input
                      aria-label={t("Rest")}
                      type="number"
                      min="1"
                      max="3600"
                      value={timerCustom}
                      onChange={(e) => setTimerCustom(+e.target.value)}
                    />
                    {button("Start", () => {
                      if (timerCustom > 0 && timerCustom <= 3600)
                        timer(timerCustom);
                    })}
                    {button(timerEnd ? "Pause" : "Resume", () =>
                      update((d) => {
                        if (d.settings.timerEnd) {
                          d.settings.timerRemaining = Math.max(
                            0,
                            Math.ceil(
                              (d.settings.timerEnd - Date.now()) / 1000,
                            ),
                          );
                          d.settings.timerEnd = undefined;
                        } else {
                          d.settings.timerEnd =
                            Date.now() +
                            (d.settings.timerRemaining || settings.rest) * 1000;
                          d.settings.timerRemaining = undefined;
                        }
                      }),
                    )}
                    <button
                      onClick={() =>
                        update((d) => {
                          if (d.settings.timerEnd)
                            d.settings.timerEnd =
                              Math.max(Date.now(), d.settings.timerEnd) + 30000;
                          else
                            d.settings.timerRemaining =
                              (d.settings.timerRemaining || 0) + 30;
                        })
                      }
                    >
                      +30s
                    </button>
                    {button("Reset", () =>
                      update((d) => {
                        d.settings.timerEnd = undefined;
                        d.settings.timerRemaining = 0;
                      }),
                    )}
                  </div>
                </section>
                {logsUI(active, true)}
              </>
            ) : (
              <>
                <h1>{t("Select a workout to begin")}</h1>
                <div className="two-col">{p.workouts.map(workoutCard)}</div>
              </>
            )}
          </>
        )}
        {tab === "Program" && (
          <>
            <div className="section-title">
              <div className="tabs">
                {["Program", "Library"].map((x) =>
                  button(
                    x,
                    () => setSub(x),
                    sub === x || (!sub && x === "Program") ? "active" : "",
                  ),
                )}
              </div>
              {sub !== "Library" &&
                button(
                  "New program",
                  () => {
                    const p = clone(C.defaultProgram());
                    p.id = C.uid();
                    p.name = "My program";
                    p.workouts = p.workouts.map((w) => ({ ...w, id: C.uid() }));
                    setEditProgram(p);
                  },
                  "primary",
                )}
            </div>
            {sub === "Library" ? (
              <>
                <div className="row filters">
                  <input
                    placeholder={t("Search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    value={muscle}
                    onChange={(e) => setMuscle(e.target.value)}
                  >
                    <option value="All">{t("All")}</option>
                    {C.muscles.map((m) => (
                      <option key={m} value={m}>
                        {t(m)}
                      </option>
                    ))}
                  </select>
                  {button("New exercise", () =>
                    setEditExercise({
                      id: C.uid(),
                      name: "",
                      muscle: muscle === "All" ? "Chest" : (muscle as C.Muscle),
                      secondary: [],
                      equipment: "",
                      instructions: "",
                      mistakes: "",
                      alternatives: [],
                      category: "Custom",
                      rest: 90,
                      eligible: false,
                    }),
                  )}
                </div>
                <div className="two-col">
                  {d.exercises
                    .filter(
                      (e) =>
                        e.name.toLowerCase().includes(search.toLowerCase()) &&
                        (muscle === "All" || muscle === e.muscle),
                    )
                    .map((e) => (
                      <section className="card" key={e.id}>
                        <h3 dir="ltr">{e.name}</h3>
                        <p>
                          {t(e.muscle)} · {t(e.equipment)}
                        </p>
                        {exerciseInfo(e.id)}
                        {button("Edit", () => setEditExercise(clone(e)))}
                      </section>
                    ))}
                </div>
              </>
            ) : (
              <>
                {d.programs.map((program) => (
                  <section className="card" key={program.id}>
                    <div className="section-title">
                      <div>
                        <h2>{program.name}</h2>
                        <p>
                          {program.workouts.length} {t("workouts")}
                        </p>
                      </div>
                      <div className="row">
                        {program.id === settings.programId ? (
                          <span className="pill">✓</span>
                        ) : (
                          button("Start", () =>
                            update((d) => {
                              d.settings.programId = program.id;
                            }),
                          )
                        )}
                        {button("Edit", () => setEditProgram(clone(program)))}
                      </div>
                    </div>
                    <div className="program-list">
                      {program.workouts.map((w) => (
                        <details key={w.id}>
                          <summary>
                            <strong dir="ltr">{w.name}</strong>
                            <span>
                              {w.exercises.reduce((n, e) => n + e.sets, 0)}{" "}
                              {t("sets")}
                            </span>
                          </summary>
                          <p>{t(w.focus)}</p>
                          {w.exercises.map((e, i) => (
                            <div className="program-ex" key={i}>
                              <span dir="ltr">
                                {
                                  d.exercises.find((x) => x.id === e.exerciseId)
                                    ?.name
                                }
                              </span>
                              <b>
                                {e.sets} × {e.min}–{e.max}
                              </b>
                            </div>
                          ))}
                        </details>
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}
          </>
        )}
        {tab === "Progress" &&
          (() => {
            const filtered = history.filter(
                (s) => period === 0 || s.end! >= now - period * 86400000,
              ),
              points = [...filtered].reverse().flatMap((s) => {
                const e = s.exercises.find((e) => e.exerciseId === chartEx),
                  logs = e ? C.working(e) : [];
                return logs.length
                  ? [
                      {
                        date: date(s.start),
                        weight: weight(Math.max(...logs.map((l) => l.weight!))),
                        reps: Math.max(...logs.map((l) => l.reps!)),
                        estimate:
                          Math.max(
                            ...logs.map((l) => C.e1rm(l, e!.eligible) || 0),
                          ) * factor,
                      },
                    ]
                  : [];
              });
            return (
              <>
                <div className="row filters">
                  <div className="tabs">
                    {[7, 30, 90, 0].map((x) =>
                      button(
                        x === 0 ? "All time" : `${x} days`,
                        () => setPeriod(x),
                        period === x ? "active" : "",
                      ),
                    )}
                  </div>
                </div>
                <div className="stats">
                  <div className="card stat">
                    <span>{t("workouts")}</span>
                    <b>{filtered.length}</b>
                  </div>
                  <div className="card stat">
                    <span>{t("Training volume")}</span>
                    <b>
                      {n(weight(filtered.reduce((n, s) => n + C.volume(s), 0)))}{" "}
                      <small>{unit}</small>
                    </b>
                  </div>
                  <div className="card stat">
                    <span>{t("Duration")}</span>
                    <b>
                      {n(filtered.reduce((n, s) => n + C.duration(s), 0))}{" "}
                      <small>{t("minutes")}</small>
                    </b>
                  </div>
                </div>
                <section className="card">
                  <div className="section-title">
                    <h3>{t("Strength progression")}</h3>
                    <select
                      value={chartEx}
                      onChange={(e) => setChartEx(e.target.value)}
                    >
                      {d.exercises.map((e) => (
                        <option value={e.id} key={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {points.length ? (
                    <div className="charts">
                      <div>
                        <small>
                          {t("Weight")} ({unit}) · {t("Estimated 1RM")} ({unit},
                          1–10 reps)
                        </small>
                        <ResponsiveContainer width="100%" height={240}>
                          <LineChart data={points}>
                            <CartesianGrid
                              stroke="#354048"
                              strokeDasharray="3 3"
                            />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                background: "#242c32",
                                border: 0,
                              }}
                            />
                            <Line
                              dataKey="weight"
                              name={t("Weight")}
                              stroke="#d4fc79"
                              strokeWidth={3}
                            />
                            {d.exercises.find((e) => e.id === chartEx)
                              ?.eligible && (
                              <Line
                                dataKey="estimate"
                                name={t("Estimated 1RM")}
                                stroke="#8dafff"
                                strokeDasharray="5 5"
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <small>{t("Reps")}</small>
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart data={points}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip contentStyle={{ background: "#242c32" }} />
                            <Bar
                              dataKey="reps"
                              fill="#d4fc79"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="empty">{t("No data in this period")}</div>
                  )}
                </section>
                <section className="card">
                  <h3>{t("Muscle tracker")}</h3>
                  <p>
                    {t(
                      "Primary sets only. Secondary muscles listed separately; this is not a recovery measurement.",
                    )}
                  </p>
                  <div className="muscle-grid">
                    {C.muscles.map((m) => {
                      const sessions = history.filter((s) =>
                          s.exercises.some(
                            (e) => e.muscle === m && C.working(e).length,
                          ),
                        ),
                        count = weekly.reduce(
                          (n, s) =>
                            n +
                            s.exercises
                              .filter((e) => e.muscle === m)
                              .reduce((n, e) => n + C.working(e).length, 0),
                          0,
                        ),
                        secondary = weekly.reduce(
                          (n, s) =>
                            n +
                            s.exercises
                              .filter((e) => e.secondary.includes(m))
                              .reduce((n, e) => n + C.working(e).length, 0),
                          0,
                        ),
                        trend = Array.from({ length: 4 }, (_, i) => ({
                          week: String(i + 1),
                          sets: history
                            .filter(
                              (s) =>
                                s.end! >= +weekStart - (3 - i) * 7 * 86400000 &&
                                s.end! < +weekStart + (i - 2) * 7 * 86400000,
                            )
                            .reduce(
                              (n, s) =>
                                n +
                                s.exercises
                                  .filter((e) => e.muscle === m)
                                  .reduce((n, e) => n + C.working(e).length, 0),
                              0,
                            ),
                        }));
                      return (
                        <details className="muscle" key={m}>
                          <summary>
                            <span>{t(m)}</span>
                            <b>
                              {count} <small>{t("sets")}</small>
                            </b>
                          </summary>
                          <div className="volume-bar">
                            <i
                              style={{
                                width: Math.min(100, (count / 20) * 100) + "%",
                              }}
                            />
                          </div>
                          <p>
                            {t("Last trained")}:{" "}
                            {sessions[0] ? date(sessions[0].end!) : "—"}
                          </p>
                          <p>
                            {t("Frequency")}:{" "}
                            {
                              weekly.filter((s) =>
                                s.exercises.some(
                                  (e) => e.muscle === m && C.working(e).length,
                                ),
                              ).length
                            }{" "}
                            / {t("This week")}
                          </p>
                          <p>
                            {t("Secondary")}: {secondary} {t("sets")}
                          </p>
                          <ResponsiveContainer width="100%" height={80}>
                            <BarChart data={trend}>
                              <Tooltip
                                contentStyle={{ background: "#242c32" }}
                              />
                              <Bar dataKey="sets" fill="#d4fc79" />
                            </BarChart>
                          </ResponsiveContainer>
                        </details>
                      );
                    })}
                  </div>
                </section>
                <div className="two-col">
                  <section className="card">
                    <h3>{t("Personal records")}</h3>
                    {Object.values(prs).length
                      ? Object.values(prs).map((r) => (
                          <div className="record" key={r.name}>
                            <span>
                              {r.name}
                              <small>
                                {t("Estimated 1RM")}:{" "}
                                {r.estimate
                                  ? n(weight(r.estimate)) + " " + unit
                                  : "—"}
                                <br />
                                {Object.entries(r.reps)
                                  .map(
                                    ([w, reps]) =>
                                      `${weight(+w)} ${unit} × ${reps}`,
                                  )
                                  .join(" · ")}
                              </small>
                            </span>
                            <b>
                              {weight(r.weight)} {unit}
                            </b>
                          </div>
                        ))
                      : empty}
                    <p>
                      {t("Training volume")}:{" "}
                      {history.length
                        ? n(weight(Math.max(...history.map(C.volume)))) +
                          " " +
                          unit
                        : "—"}
                    </p>
                  </section>
                  <section className="card">
                    <h3>{t("Training calendar")}</h3>
                    <div className="calendar">
                      {Array.from({ length: 35 }, (_, i) => {
                        const dt = new Date(now - (34 - i) * 86400000);
                        const hits = history.filter(
                          (s) =>
                            new Date(s.end!).toDateString() ===
                            dt.toDateString(),
                        );
                        return (
                          <div
                            key={i}
                            className={hits.length ? "trained" : ""}
                            title={
                              dt.toLocaleDateString() +
                              ": " +
                              hits.map((s) => s.name).join(", ")
                            }
                          >
                            {dt.getDate()}
                          </div>
                        );
                      })}
                    </div>
                    <h3>{t("Monthly frequency")}</h3>
                    {Array.from({ length: 6 }, (_, i) => {
                      const dt = new Date();
                      dt.setMonth(dt.getMonth() - (5 - i));
                      return (
                        <div className="record" key={i}>
                          <span>
                            {dt.toLocaleDateString(settings.lang, {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <b>
                            {
                              history.filter(
                                (s) =>
                                  new Date(s.end!).getMonth() ===
                                    dt.getMonth() &&
                                  new Date(s.end!).getFullYear() ===
                                    dt.getFullYear(),
                              ).length
                            }
                          </b>
                        </div>
                      );
                    })}
                    <p>
                      {t("Weeks trained")}:{" "}
                      {
                        new Set(
                          history.map((s) =>
                            Math.floor((s.end! - 345600000) / (7 * 86400000)),
                          ),
                        ).size
                      }
                    </p>
                  </section>
                </div>
              </>
            );
          })()}
        {tab === "Settings" && (
          <div className="settings-grid">
            <section className="card">
              <h3>{t("Settings")}</h3>
              <label className="setting">
                <span>{t("Language")}</span>
                <select
                  value={settings.lang}
                  onChange={(e) =>
                    update((d) => {
                      d.settings.lang = e.target.value as "ar" | "en";
                    })
                  }
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="setting">
                <span>{t("Units")}</span>
                <select
                  value={unit}
                  onChange={(e) =>
                    update((d) => {
                      d.settings.unit = e.target.value as "kg" | "lb";
                    })
                  }
                >
                  <option>kg</option>
                  <option>lb</option>
                </select>
              </label>
              {(["autoRest", "sound", "coach"] as const).map((key, i) => (
                <label className="setting" key={key}>
                  <span>
                    {t(
                      ["Automatic rest timer", "Timer sound", "Smart Coach"][i],
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) =>
                      update((d) => {
                        d.settings[key] = e.target.checked;
                      })
                    }
                  />
                </label>
              ))}
              {input(
                "Rest",
                settings.rest,
                (v) => {
                  if (+v >= 1 && +v <= 3600)
                    update((d) => {
                      d.settings.rest = +v;
                    });
                },
                "number",
              )}
              {input(
                "Default increment",
                weight(settings.increment),
                (v) => {
                  if (+v > 0 && +v <= 100)
                    update((d) => {
                      d.settings.increment = +v / factor;
                    });
                },
                "number",
              )}
              <p>kg ↔ lb: 1 kg = 2.20462 lb</p>
            </section>
            <section className="card">
              <h3>{t("Back up regularly")}</h3>
              <p>
                {settings.lastBackup
                  ? date(settings.lastBackup)
                  : t("No backup yet")}
              </p>
              <div className="row wrap">
                {button("Export backup", exportData, "primary")}
                {button("Import backup", () => file.current?.click())}
              </div>
              <input
                ref={file}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={async (ev) => {
                  const f = ev.target.files?.[0];
                  if (!f) return;
                  try {
                    if (f.size > 20 * 1024 * 1024)
                      throw Error("Backup exceeds 20 MB");
                    const restored = C.parseBackup(await f.text());
                    if (
                      confirm(t("Replace all local data with this backup?"))
                    ) {
                      update((d) => Object.assign(d, restored));
                      setToast(
                        restored.settings.lang === "ar"
                          ? ar["Backup imported"]
                          : "Backup imported",
                      );
                    }
                  } catch (e) {
                    setError(t((e as Error).message));
                  }
                  ev.target.value = "";
                }}
              />
              <div className="divider" />
              <h3>{t("Privacy")}</h3>
              <p>
                {t(
                  "Your data stays in this browser. It never uploads or syncs between devices. Friends have independent data. Clearing browser storage removes your data; export backups regularly.",
                )}
              </p>
              {button("Share app", () => void share(window.location.origin))}
            </section>
            <section className="card">
              <h3>{t("Install FitTrack")}</h3>
              <p>
                {t(
                  "On iPhone: Safari → Share → Add to Home Screen. On Android: browser menu → Install app. Open online once and wait for offline readiness before training offline.",
                )}
              </p>
              <p className="lime">
                <WifiOff size={16} />{" "}
                {t(ready ? "Offline ready" : "Waiting for offline cache")}
              </p>
              <p>
                {t(
                  "Sound works while the app is active. Background alerts are not guaranteed.",
                )}
              </p>
              <p>{t("Version")} 1.0.0 · Local rule-based coach · No API</p>
            </section>
            <section className="card">
              <h3>{t("Program")}</h3>
              {button("Restore default program", () => {
                if (
                  confirm(
                    t("Restore original PPL? Your history will be preserved."),
                  )
                )
                  update((d) => {
                    d.programs = d.programs.filter((p) => p.id !== "default");
                    d.programs.unshift(C.defaultProgram());
                    for (const e of C.library)
                      if (!d.exercises.some((x) => x.id === e.id))
                        d.exercises.push(clone(e));
                    d.settings.programId = "default";
                  });
              })}
              <div className="divider" />
              {button(
                "Delete all data",
                () => {
                  if (
                    confirm(t("Confirm deletion?")) &&
                    confirm(t("Delete all data"))
                  )
                    update((d) => Object.assign(d, C.initialData()));
                },
                "danger",
              )}
            </section>
          </div>
        )}
        <footer>
          <span className="live-dot" />
          {t("Data saved on this device")}
          <span>FITTRACK AI</span>
        </footer>
      </main>
      {toast && (
        <div role="status" className="toast">
          <Check size={18} />
          {toast}
        </div>
      )}
      {summary && (
        <div className="overlay">
          <section className="modal card">
            <button
              className="modal-close icon"
              onClick={() => setSummary(null)}
            >
              <X />
            </button>
            <div className="celebrate">
              <Trophy size={48} />
            </div>
            <p className="eyebrow">{t("Session saved")}</p>
            <h1>{summary.name}</h1>
            <p>
              {n(C.duration(summary))} {t("minutes")} ·{" "}
              {summary.exercises.reduce((n, e) => n + C.working(e).length, 0)}{" "}
              {t("sets")} · {n(weight(C.volume(summary)))} {unit}
            </p>
            {summary.exercises.some((e) =>
              C.working(e).some(
                (l) =>
                  l.weight! >
                  (C.records(history.filter((h) => h.id !== summary.id))[
                    e.exerciseId
                  ]?.weight ?? -1),
              ),
            ) && <h3 className="lime">🏆 {t("Personal records")}</h3>}
            {button(
              "Share summary",
              () =>
                void share(
                  `${summary.name} · ${Math.round(C.duration(summary))} min · ${weight(C.volume(summary))} ${unit} · FitTrack AI`,
                ),
              "primary",
            )}
            {button("Close", () => setSummary(null))}
          </section>
        </div>
      )}
      {editSession && (
        <div className="overlay">
          <section className="modal wide">
            <div className="sticky-modal">
              <h2>
                {editSession.name} · {t("History")}
              </h2>
              <div className="row">
                {button("Close", () => setEditSession(null))}
                {button(
                  "Save",
                  () => {
                    if (
                      editSession.exercises.some((e) =>
                        e.logs.some((l) => l.done && !C.validSet(l)),
                      )
                    ) {
                      setError(
                        t(
                          "Sets must have a valid weight, reps and optional RIR (0–10).",
                        ),
                      );
                      return;
                    }
                    update((d) => {
                      d.sessions = d.sessions.map((s) =>
                        s.id === editSession.id ? clone(editSession) : s,
                      );
                    });
                    setEditSession(null);
                  },
                  "primary",
                )}
              </div>
            </div>
            {logsUI(editSession, false)}
          </section>
        </div>
      )}
      {editExercise && (
        <ExerciseEditor
          exercise={editExercise}
          t={t}
          onClose={() => setEditExercise(null)}
          onSave={(exercise) => {
            update((d) => {
              const i = d.exercises.findIndex((e) => e.id === exercise.id);
              if (i < 0) d.exercises.push(exercise);
              else d.exercises[i] = exercise;
            });
            setEditExercise(null);
          }}
        />
      )}
      {editProgram && (
        <ProgramEditor
          {...{
            editProgram,
            setEditProgram,
            d,
            t,
            button,
            input,
            update,
            setError,
          }}
        />
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
