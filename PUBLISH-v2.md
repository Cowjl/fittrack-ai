# Publish FitTrack AI 2.0 to the existing site

Keep the existing production URL: **https://fittrack-ai-cw9.pages.dev/**.
Keep the existing Pages project and GitHub repository: **Cowjl/fittrack-ai**, production branch **main**.
Cloudflare Pages configuration remains:

- Build command: `npm run build`
- Output directory: `dist`
- No deploy command, Workers setup, paid plan, Functions or custom domain.

This document is a publishing procedure, not proof of a live v2 deployment. A local build/archive is not a successful GitHub push. Publishing is complete only after the production commit and live site are verified.

## Before updating your iPhone

Open the current app → Settings → Export backup. Keep the JSON in Files. Do not clear Safari website data or uninstall/erase the app's data. The v2 migration also creates a local pre-upgrade recovery checkpoint and preserves active sessions and completed history.

## If direct GitHub writes succeed

The release commit must be a normal, non-force update of `main`, retaining all prior commits. Confirm its remote SHA and file hashes, then let the **existing** Cloudflare Pages Git integration build the update. If needed, retry the latest production deployment in the existing Pages project. Verify the live site and the v2 planning features at the unchanged URL.

## iPhone fallback when cloud-environment writes are denied

No passwords, manually created tokens or new account connections are needed:

1. Download `fittrack-ai-v2-source.zip` from the handoff into Safari Downloads / Files. Keep it zipped.
2. Open https://github.com/Cowjl/fittrack-ai/upload/main in Safari. Upload the ZIP to the repository root and commit it to `main`.
3. Open https://github.com/Cowjl/fittrack-ai/new/main?filename=.github%2Fworkflows%2Fupgrade-fittrack-v2.yml . Paste the contents of the provided `upgrade-fittrack-v2.yml`, then commit the workflow to `main`.
4. Open https://github.com/Cowjl/fittrack-ai/actions/workflows/upgrade-fittrack-v2.yml . Select **Run workflow → main → Run workflow**. Use Safari → Request Desktop Website if the button is hidden.
5. The workflow verifies the source ZIP checksum and unchanged v1 baseline, extracts only the prepared project, installs the locked dependencies, runs TypeScript, unit tests and production build, then commits the source changes to `main`. It uses GitHub's automatic short-lived workflow credential. No secrets should be copied into chat.
6. Return to the conversation with “v2 workflow finished.” The agent can verify every uploaded source file against the tested release, then verify Cloudflare's resulting deployment at the existing URL. If automatic Pages deployment does not start, retry deployment in the **existing** Pages project; do not create a new site.

Use the **Upgrade FitTrack AI to v2** workflow for this update. The earlier **Save FitTrack AI source** workflow/archive represents v1 and must not be rerun to update v2. Do not restore an old frontend over the newer database schema without a deliberate tested migration strategy.

GitHub's standard hosted Actions runners are free for public repositories, as this repository currently is. Do not enable a paid larger runner or paid products. No paid Cloudflare products are required.

After deployment, close all old Safari/app tabs and reopen the same URL to activate the waiting PWA update. The app does not force a reload during an active workout. A pre-upgrade checkpoint can be exported in v2 Settings; normal backups continue to work.
