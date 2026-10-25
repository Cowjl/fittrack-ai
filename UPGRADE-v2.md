# FitTrack AI 2.0 upgrade

Production URL remains **https://fittrack-ai-cw9.pages.dev/**. This is an in-place upgrade of the tested v1 React/Vite application, not a separate site. There are no new runtime services, paid dependencies, external AI calls, mandatory accounts or synchronization.

## Implemented

- A locally authored catalog of **356 distinct named exercises**, including the original 35 IDs (`e0`–`e34`) and 321 additional catalog IDs derived from stable slugs. Explicit rows live in `src/catalog/rows.ts`; movement-specific bilingual guidance lives in `src/catalog/guidance.ts`.
- Arabic and English names, aliases, target regions, primary/secondary muscles, equipment, extra equipment requirements, movement/function, difficulty, suggested ranges, setup, execution, breathing, mistakes, safety, alternatives, unilateral/bilateral metadata and loading support.
- Search by either language or aliases; muscle/region, equipment, difficulty, movement and compound/isolation/function filters; favorites; recent actual logged use; custom exercise editing; detail dialogs and ranked replacement search inside both program and active-session editing.
- My Programs, Ready-Made Plans, Build My Plan and Exercise Library tabs in the existing Program section.
- Optional eight-step onboarding/questionnaire with goals, experience, 1–7 days, weekdays, time, equipment, priorities, exercise preferences/exclusions, movement exclusions, rep preferences and volume adjustment.
- Preview, compare, regenerate with an explicit variation seed, customize, save, duplicate, activate, switch, restore previous program and start training.
- Existing logger, previous performance, autosave, rest timer, history, PRs, charts, backups, Arabic RTL, English and offline PWA remain integrated.
- Timed catalog exercises use seconds in the repetitions storage field, clearly labeled in the logger. Enter 0 added weight when unweighted. Timed sets do not produce loaded-volume strength records or Smart Coach load recommendations. This is not GPS cardio tracking.

## Muscle and equipment coverage

Chest (upper/mid/lower); lats and upper/mid/lower back; spinal erectors; front/side/rear deltoids; upper/middle/lower traps; biceps, brachialis and brachioradialis; triceps; forearms/grip; quadriceps; hamstrings; glutes; hip adductors and abductors; calves and tibialis anterior; rectus abdominis, obliques and core stabilization. Conditioning, bodyweight/calisthenics, carries, bands, mobility and warm-up movements are included.

Equipment: barbell, dumbbell, cable, Smith machine, plate-loaded machine, selectorized machine, kettlebell, bodyweight, resistance band, pull-up bar, EZ bar, trap bar, cardio equipment and other gym equipment. Where a movement needs a bench, fixed support, band plus pull-up bar, or another accessory, its additional requirement is checked as well. “Other” is a broad category: always read the specific setup before choosing an exercise.

The text is original; no third-party dataset, remote images or paid media are bundled. Structural tests check IDs, names, metadata, representative anatomy and restrictions. This is not an independently clinically validated exercise prescription system.

## All 18 ready-made programs

1. Full Body Beginner - 2 days
2. Full Body Beginner - 3 days
3. Full Body Intermediate - 3 days
4. Upper / Lower - 4 days
5. Upper / Lower - 5 days
6. Push / Pull / Legs - 3 days
7. Push / Pull / Legs - 6 days
8. Push / Pull / Legs A/B - 6 days
9. Upper / Lower / Push / Pull / Legs - 5 days
10. Strength Focus - 3 days
11. Strength Focus - 4 days
12. Hypertrophy Focus - 4 days
13. Hypertrophy Focus - 5 days
14. Hypertrophy Focus - 6 days
15. Bodyweight / Home Training - 3 days
16. Minimal Equipment - 3 days
17. General Fitness - 3 days
18. Return to Training After a Break

Every template has concrete exercise prescriptions, rest times, targets, calculated duration, level, goal, equipment, description and progression. Beginner plans start with low volume. The original PPL A/B template retains the exact original exercises, order, sets and ranges. The user's saved original becomes “My Original PPL A/B” only when it still has the uncustomized default name; custom names are retained. No template automatically replaces or activates over it.

## Generator rules

The generator is pure and deterministic for the same configuration and catalog. The explicit Regenerate action increments a variation seed. There is no AI model or API.

- 1 day: full body; explains the limitation of once-weekly practice.
- 2 days: full body A/B.
- 3 days: full body A/B/C.
- 4 days: upper/lower A/B.
- 5 days: upper/lower/push/pull/legs.
- 6 days: PPL A/B.
- 7 available days: six lifting sessions plus an easy recovery session, never seven mandatory hard lifting sessions.
- Essential chest, back, quadriceps and hamstring coverage is checked across the week; compounds also train secondary muscles. Twice-weekly direct exposures are preferred where feasible; constraints that prevent them are disclosed.
- Equipment and explicit exercise/movement exclusions are hard filters. Preferred exercises are favored; disliked choices are penalized. Advanced exercises are excluded unless experience is Advanced.
- Priority muscles receive earlier optional slots and/or an additional set within a cap. Reduced direct emphasis lowers optional work. No automatic additions are made to the original personal program. Glute exercises exist for users who want them and are not forced into the original PPL.
- Strength uses compound emphasis, lower repetitions and longer rests. Endurance uses higher repetitions. Return-to-training reduces starting volume. Other goals use conservative general resistance-training principles; fat-loss support includes an explicit explanation that lifting alone does not guarantee fat loss.
- Time includes a five-minute warm-up, set execution at an approximate three seconds per repetition (or explicit seconds), inter-set rest and one minute of setup per exercise. Sets or optional exercises are reduced to fit. This is a planning estimate; queues, equipment changes and individual tempo can make actual sessions longer.
- Impossible configurations show warnings and disable activation. Preview/persistence checks also reject equipment, exclusion, duration, empty-workout or duplicate-exercise problems introduced by customization.
- Preferred weekdays annotate workouts but do not force calendar scheduling. Rest remains flexible. Consecutive full-body weekdays produce a recovery caution.

## Data safety and backups

Application version 2.0.0 uses **Dexie schema version 3** in the same `fittrack-ai` database. Schema versions 1 and 2 remain supported upgrade paths.

Before enriching the existing personal row, the migration copies the **unaltered v1 data** into the new `recovery` table under `before-v2-upgrade` in the same atomic upgrade transaction. If the transaction fails, both changes roll back. Settings → Export pre-upgrade recovery backup downloads that checkpoint as a v1-format JSON backup. The standard Export backup button remains available at all times.

The upgrade does not delete a database or rewrite session IDs, timestamps, notes, sets, weights, active-session state or historical exercise snapshots. Existing catalog IDs stay stable. Only missing catalog IDs are appended, making repeated loads idempotent. User-edited catalog text and custom exercise IDs are preserved; untouched default guidance may be enriched. Completed sessions remain separate from templates/generated plans. Current active program IDs are retained and existing users are marked as having skipped onboarding.

New backup exports use envelope version 2. Import accepts both v1 and v2, validates metadata and plan profiles, enriches legacy catalogs, then asks for replacement confirmation. Replacing an older backup clears optional profile fields from the prior dataset. Import is replacement, not cloud sync or multi-backup merging. Destructive “Delete all data” still requires confirmation and also clears the recovery checkpoint.

**Before opening the upgraded site on a device with important history, export a v1 backup from the current Settings page.** Personal browser data cannot be exported remotely by this workspace; the migration checkpoint provides an additional local safeguard.

Do not clear Safari website data to update the app. Close all app/Safari instances and reopen the same URL to allow a waiting service worker to activate. The app never forces a reload during a workout. If an old v1 tab remains open during a database upgrade, close/reload it so it uses the matching app version.

## New modules

```
src/catalog/{types,rows,guidance,index}.ts
src/planning/{types,engine,templates,validation}.ts
src/components/ExerciseBrowser.tsx
src/components/ExercisePicker.tsx
src/components/PlanBuilder.tsx
src/components/ProgramPreview.tsx
src/components/ProgramHub.tsx
tests/v2.spec.ts
tests/fixtures/v1-user.json  # isolated synthetic migration fixture, never app seed data
```

Tests include the original regression suite, catalog/plan rules, equipment and exclusions, volume/time bounds, migration checkpoints, historical safety, profiles, backups and browser flows. See `VERIFICATION-v2.md` for final results and `PUBLISH-v2.md` for exact publishing status/steps.

## Known boundaries

- No actual injury diagnosis, recovery measurement, GPS cardio data or automatic synchronization.
- Practical time estimates are not a guarantee of elapsed gym time.
- Bodyweight-only training without a bar/band has limited progressive back loading; this is disclosed rather than assuming unselected equipment exists.
- Some unusual constraints cannot produce balanced plans; activation stays disabled until the user adjusts them.
- Exercise technique and templates are authored guidance, not a substitute for individual coaching. Experienced users should review loads, movement suitability and volume.
- Actual iPhone/Android hardware installation cannot be tested from this environment. Production browser tests use mobile Chromium emulation and actual service-worker caching.
- Catalog entries have stable explicit row names/IDs. Later editorial renames must preserve existing IDs rather than regenerate them.
