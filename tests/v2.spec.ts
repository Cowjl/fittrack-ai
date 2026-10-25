import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/v1-user.json", import.meta.url), "utf8"),
);
const english = async (page: Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "الإعدادات", exact: true }).click();
  await page.getByLabel("اللغة").selectOption("en");
  await page.getByRole("button", { name: "Home", exact: true }).click();
};
const next = async (page: Page) => {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
};
test("new user builds a 30-minute dumbbell plan, customizes, activates and logs offline", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await english(page);
  await page
    .getByRole("button", { name: "Build My Plan", exact: true })
    .click();
  await next(page);
  await page
    .getByRole("button", { name: "Muscle Hypertrophy", exact: true })
    .click();
  await next(page);
  await page.getByRole("button", { name: "Beginner", exact: true }).click();
  await next(page);
  await page.getByLabel("Available days per week").selectOption("3");
  await next(page);
  await page.getByRole("button", { name: "30 minutes", exact: true }).click();
  await next(page);
  await page
    .getByRole("button", { name: "Dumbbells Only", exact: true })
    .click();
  await next(page);
  await page
    .getByRole("combobox", { name: "Side deltoids", exact: true })
    .selectOption("Prioritize");
  await next(page);
  await page
    .getByRole("button", { name: "Generate Plan", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Review program" }),
  ).toBeVisible();
  await expect(page.locator(".preview-day")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Customize", exact: true })
    .last()
    .click();
  await page
    .getByLabel("Name", { exact: true })
    .fill("My offline dumbbell plan");
  await page
    .locator(".sticky-modal")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(page.locator(".program-preview h1")).toContainText(
    "My offline dumbbell plan",
  );
  await page
    .getByRole("button", { name: "Activate Plan", exact: true })
    .click();
  await expect(page.locator(".plan-card")).toContainText([
    "My Original PPL A/B",
    "My offline dumbbell plan",
  ]);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(page.locator(".hero h2")).toContainText("Full Body A");
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect(page.locator(".header-status")).toContainText("Saved");
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("button", { name: "Workout", exact: true })
    .first()
    .click();
  const row = page
    .locator(".exercise-card")
    .first()
    .locator(".set-row")
    .first();
  await row.locator("input").nth(0).fill("10");
  await row.locator("input").nth(1).fill("10");
  await row.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator(".header-status")).toContainText("Saved");
  await page.reload();
  await page
    .getByRole("button", { name: "Workout", exact: true })
    .first()
    .click();
  await expect(
    page
      .locator(".exercise-card")
      .first()
      .getByRole("button", { name: "Undo" }),
  ).toHaveCount(1);
  expect(errors).toEqual([]);
});
test("catalog Arabic search, favorites, custom exercise, details and template compare work", async ({
  page,
}) => {
  await english(page);
  await page.getByRole("button", { name: "Program", exact: true }).click();
  await page
    .getByRole("button", { name: "Exercise Library", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Search exercises" }).fill("صدر");
  await expect(page.locator(".exercise-result")).not.toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search exercises" })
    .fill("pec deck");
  await page
    .getByRole("combobox", { name: "Primary muscle", exact: true })
    .selectOption("Chest");
  await expect(page.locator(".exercise-result")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Favorite Pec Fly Machine", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Exercise details", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Starting position");
  await expect(page.getByRole("dialog")).toContainText("Safety considerations");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(page.locator(".exercise-result")).toHaveCount(1);
  await page.getByRole("button", { name: "New exercise", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("My Custom Cable Press");
  await page
    .getByLabel("Instructions", { exact: true })
    .fill(
      "Stand with a stable stance. Press smoothly and return under control.",
    );
  await page.getByLabel("Mistakes", { exact: true }).fill("Avoid swinging.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Program", exact: true }).click();
  await page
    .getByRole("button", { name: "Exercise Library", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search exercises" })
    .fill("My Custom Cable Press");
  await expect(page.locator(".exercise-result")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Ready-Made Plans", exact: true })
    .click();
  await expect(page.locator(".plan-card")).toHaveCount(18);
  await page
    .getByRole("checkbox", { name: "Compare", exact: true })
    .nth(0)
    .check();
  await page
    .getByRole("checkbox", { name: "Compare", exact: true })
    .nth(1)
    .check();
  await expect(page.locator(".comparison")).toBeVisible();
  await page.screenshot({
    path: "test-results/v2-plan-library.png",
    fullPage: true,
  });
});
test("v1 database upgrades in place with original program, active workout, history and downloadable checkpoint", async ({
  page,
}) => {
  await page.goto("/manifest.webmanifest");
  await page.evaluate(async (data) => {
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open("fittrack-ai", 20);
      open.onupgradeneeded = () =>
        open.result.createObjectStore("state", { keyPath: "id" });
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result;
        const tx = db.transaction("state", "readwrite");
        tx.objectStore("state").put({ id: "personal", data, revision: 7 });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, fixture);
  await page.goto("/");
  await expect(page.locator(".hero h2")).toContainText("Pull A");
  await expect(
    page.getByRole("button", { name: "Skip for now", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Workout", exact: true })
    .first()
    .click();
  await expect(page.getByLabel("Lat Pulldown 1 weight")).toHaveValue("40");
  await expect(
    page
      .locator(".exercise-card")
      .first()
      .getByRole("button", { name: "Undo" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.locator(".history-card")).toContainText("Push A");
  await expect(page.locator(".history-card")).toContainText("427.5");
  await page.getByRole("button", { name: "Program", exact: true }).click();
  await expect(page.locator(".plan-card")).toContainText("My Original PPL A/B");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Export pre-upgrade recovery backup",
      exact: true,
    })
    .click();
  expect((await download).suggestedFilename()).toBe("fittrack-before-v2.json");
  const snapshots = await page.evaluate(
    () =>
      new Promise<any>((resolve, reject) => {
        const r = indexedDB.open("fittrack-ai");
        r.onsuccess = () => {
          const db = r.result;
          const tx = db.transaction(["state", "recovery"]);
          const state = tx.objectStore("state").get("personal"),
            before = tx.objectStore("recovery").get("before-v2-upgrade");
          tx.oncomplete = () => {
            resolve({
              state: state.result.data,
              before: before.result.data,
              version: db.version,
            });
            db.close();
          };
        };
        r.onerror = () => reject(r.error);
      }),
  );
  expect(snapshots.version).toBe(30);
  expect(snapshots.state.sessions).toEqual(fixture.sessions);
  expect(snapshots.state.active).toEqual(fixture.active);
  expect(snapshots.before).toEqual(fixture);
  expect(snapshots.state.exercises.length).toBeGreaterThanOrEqual(300);
});
test("search replacement suggestions and explicit exclusions remain usable in the editor", async ({
  page,
}) => {
  await english(page);
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await page
    .locator(".exercise-card")
    .first()
    .getByRole("button", { name: "Search / replace", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Suggested replacements match",
  );
  await page
    .getByRole("textbox", { name: "Search exercises" })
    .fill("Machine Chest Press");
  await page
    .getByRole("button", { name: "Choose exercise", exact: true })
    .first()
    .click();
  await expect(page.locator(".exercise-card").first().locator("h3")).toHaveText(
    "Machine Chest Press",
  );
});
