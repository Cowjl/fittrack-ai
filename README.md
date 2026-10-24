# FitTrack AI

A static, local-first workout PWA built with React, TypeScript, Vite, Tailwind, Dexie/IndexedDB, Recharts, Lucide and vite-plugin-pwa. Arabic is the default language; English and RTL/LTR switching are available in Settings. No accounts, API keys, backend, analytics, AI service, or cloud database are used.

## Run locally

Use Node.js 22.12+ (Node 24 was used for verification).

```sh
npm install
npm run dev
```

Open the URL printed by Vite. For reproducible installation from the committed lockfile, use `npm ci`. A dependency install requires network access; application use does not require any external service. If installation appears stuck, use `npm install --fetch-retries=0 --fetch-timeout=15000` to get a bounded error instead of repeated network retries.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Service-worker offline behavior is enabled in the **production build**, not the development server. Open the preview online once, wait for Settings → Offline ready, then try an offline reload.

Browser integration tests use the production build:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

Linux CI hosts may need `npx playwright install --with-deps chromium`. The test server uses localhost port 4173, so sandboxed environments must allow local network listeners and browser launches. Tests use an iPhone-sized Chromium viewport; this does not replace testing on actual iPhone Safari.

## Deploy free to Cloudflare Pages

Choose **Cloudflare Pages**, not a Worker or a paid server product. No Functions, API bindings, paid services, or custom domain are required.

### Git-connected build

1. Put this project in a GitHub or GitLab repository.
2. In Cloudflare, open Workers & Pages → Create application → Pages → Connect to Git.
3. Select the repository and use these settings:
   - Framework: Vite (or None).
   - Build command: `npm run build`.
   - Build output directory: `dist`.
   - Root directory: this project's root.
   - Node environment variable: `NODE_VERSION=22` (22.12 or newer).
4. Deploy. Cloudflare supplies an HTTPS `https://your-project.pages.dev` URL. Share this URL with friends.

### Direct upload

Run `npm run build`, then create a **Pages Direct Upload** project and upload the contents of `dist` using the dashboard. This method does not require connecting a repository. Do not use `vite preview` as a production server.

`public/_redirects` supplies the static SPA fallback. `public/_headers` supplies security headers and immutable caching for hashed assets. The service worker precaches the app and all local icons. There are no server-side functions.

Within Cloudflare Pages' free-plan limits this app has no ongoing operating costs. Keep the project on the free plan and do not add paid products. Hosting limits and terms remain controlled by Cloudflare. A public site has **not** been published by this workspace; deployment requires your Cloudflare account.

## Install on iPhone and Android

- **iPhone:** open the deployed HTTPS URL in Safari → Share → Add to Home Screen → Add.
- **Android:** open it in Chrome → menu → Install app / Add to Home screen.
- Load online first and wait for **Settings → Offline ready**. Once cached, sessions, exercise instructions, analytics, programs and backups work offline.
- Rest timers use timestamps and correct themselves when the app becomes active again. Sound is optional while the app is open; iOS/browser restrictions can suppress it. Background notifications are not promised.
- Updates are precached without forcing a reload during a workout. Close all app tabs and reopen to activate an available update.

## Everyday workflow

1. Home recommends the next workout in Push A → Pull A → Legs A → Push B → Pull B → Legs B. Rest days do not advance the sequence.
2. Start a workout, or manually choose another under Workout. An existing active session is resumed instead of duplicated.
3. Enter a weight, repetitions, optional RIR, then tap the checkmark. Previous weights are **references only**; they are never recorded automatically.
4. Add working/warm-up sets, remove sets, reorder/replace exercises, write notes, and record difficulty as needed. Bodyweight exercises use **added load**: enter zero when unweighted.
5. Pause/resume or finish. Finish requires at least one completed working set. The saved summary shows actual completed sets and loaded volume. Uncompleted sets remain in the snapshot and do not contribute to analytics.
6. Workout → History lets you review, correct, compare, delete (with confirmation) and share sessions.
7. Program → Edit changes future workouts. Historical and active sessions retain their own exercise snapshots. Program → Library includes search, muscle filters, and editable custom exercises/equipment variations.
8. Progress shows logged strength, repetitions, estimated 1RM, records, volume, calendar, duration and muscle training volume. Empty charts stay empty until real data exists.

The program editor's load increments are explicitly in **kg**, the canonical storage unit. Logged weights and main analytics convert to the preferred kg/lb display unit. Every exercise has its own editable increment and rest duration; Settings' increment is used when adding exercises to programs.

## Smart Coach methodology

The coach runs locally using transparent rules, and never changes your logged weights:

- Only completed, valid **working sets** are used. Warm-ups are excluded.
- With no completed history for an exercise, it reports insufficient history.
- When at least the prescribed number of sets reaches the top of the rep range at the same load, it suggests the exercise's configured increment. If RIR was entered, it must be at least 1.
- Otherwise it recommends keeping the load and improving repetitions.
- Reported technique/difficulty concerns or RIR below 1 prevent load increases.
- After more than 21 days away from that exercise, it suggests a conservative starting load of about 90% of the last load.
- Suggestions are optional. The app cannot observe technique, readiness, pain, or physiological recovery.

Estimated 1RM uses the Epley formula `weight × (1 + reps / 30)` only for eligible loaded compound exercises with 1–10 repetitions and positive weight. It is an estimate, not a measured maximum. PRs include best loaded weight, eligible estimated 1RM, highest reps at each weight and greatest session loaded volume. Volume means **load × reps**, not body mass or exercise work in joules.

Muscle totals attribute every working set to exactly one primary muscle. Secondary involvement is displayed separately and never added again to total working sets. Expand muscle cards for this week's frequency, last training date and four-week volume trend. The muscle dashboard is a complete card-based tracker; it does not include an anatomical SVG or claim to measure recovery.

## Privacy, persistence and backups

All training data stays in IndexedDB in this browser/profile and origin. **There is no automatic sync between devices, between browsers, or between friends.** Installing the app does not create an account or copy another person's data. Changing the hosting domain creates a separate browser storage origin.

Settings → Export backup downloads the complete personal dataset as versioned JSON, including programs, exercise library, settings, history and active session. Export regularly, especially before clearing storage, changing phones, changing browsers or changing the hosted URL.

Settings → Import backup validates the full structure before requesting replacement confirmation. Invalid files never replace the stored data. Import replaces data; it does not merge or deduplicate separate backups. Backups contain your personal notes and workout data, so store them privately.

IndexedDB writes are serialized and transactional. Schema version 2 safely upgrades version 1 and adds revision checks: a stale tab cannot silently overwrite another tab's saved data. If a conflict appears, export any unsaved local work and reload. Storage failures display an unsaved warning and export/retry controls. The app requests confirmation for destructive actions. Browser storage can still be cleared or evicted by the device; no frontend-only app can guarantee it against OS/browser removal. A JSON backup is the recovery mechanism.

## Project structure

```text
src/
  main.tsx                     App shell, pages, state and persistence flow
  core.ts                      Typed models, exact PPL defaults, session logic,
                               coach, records and strict backup validation
  db.ts                        Dexie schema, v1→v2 migration, conflict checks
  i18n.ts                      Arabic UI dictionary (English source labels)
  style.css                    Responsive design, RTL-safe layout, safe areas
  components/
    WorkoutExercises.tsx       Reusable active/history set logger
    ExerciseDetails.tsx        Offline exercise instructions and alternatives
    ExerciseEditor.tsx         Custom exercises and equipment variations
    ProgramEditor.tsx          Program, workout and prescription editing
  core.test.ts                 Vitest domain and IndexedDB integration tests
  vite-env.d.ts
public/
  icon.svg, icon-192.png, icon-512.png
  _redirects                   Cloudflare SPA fallback
  _headers                     Static security/cache policy
index.html
vite.config.ts                 Build splitting, PWA manifest and precaching
vitest.config.ts
playwright.config.ts
tests/app.spec.ts               Production-browser workflows
package.json / package-lock.json
```

## Verification and boundaries

See `VERIFICATION.md` for the exact final commands and results. No cloud deployment, real-device iPhone test or physical gym session is implied by passing automated tests. There is no cloud sync, account system, leaderboard or external AI; these are intentionally excluded from version 1. Sharing sends app links or explicitly chosen summary text, never the local database.
