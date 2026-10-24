import { test, expect } from "@playwright/test";
const english = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "الإعدادات", exact: true }).click();
  await page
    .locator("select")
    .filter({ has: page.locator('option[value="ar"]') })
    .selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
};
test("mobile workout survives refresh, completes, advances sequence and shows real progress", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await english(page);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  const card = page.locator(".exercise-card").first();
  await expect(card.locator("h3")).toHaveText("Bench Press");
  await card.getByLabel("Bench Press 1 weight").fill("50");
  await card.getByLabel("Bench Press 1 reps").fill("10");
  await card.getByRole("button", { name: "Done", exact: true }).first().click();
  await expect(card.getByRole("button", { name: "Undo" })).toHaveCount(1);
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
  await expect(page.getByLabel("Bench Press 1 weight")).toHaveValue("50");
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(page.locator(".modal")).toContainText("Session saved");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(page.locator(".hero h2")).toContainText("Pull A");
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.locator(".recharts-wrapper").first()).toBeVisible();
  await expect(page.locator(".stats")).toContainText("500");
  await page
    .getByRole("button", { name: "Workout", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.locator(".history-card")).toHaveCount(1);
  await expect(page.locator(".history-card")).toContainText("Push A");
  expect(errors).toEqual([]);
  await page.screenshot({
    path: "test-results/mobile-history.png",
    fullPage: true,
  });
});
test("Arabic default, backup, custom program and library work", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".hero h2")).toContainText("Push A");
  await page.screenshot({
    path: "test-results/arabic-home.png",
    fullPage: true,
  });
  await english(page);
  await page
    .getByRole("button", { name: "Program", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "New program", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("My strength plan");
  await page
    .locator(".modal")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(page.locator("main")).toContainText("My strength plan");
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page.getByPlaceholder("Search").fill("Hip Adduction");
  await expect(page.locator("main .two-col .card")).toHaveCount(1);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  expect((await download).suggestedFilename()).toMatch(/fittrack-.*json/);
});
test("cached production app opens and logs a workout offline", async ({
  page,
  context,
}) => {
  await english(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(page.locator(".exercise-card")).toHaveCount(6);
  await expect(page.locator(".header-status")).toContainText("Saved");
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("button", { name: "Workout", exact: true })
    .first()
    .click();
  await page.getByLabel("Bench Press 1 weight").fill("45");
  await page.getByLabel("Bench Press 1 reps").fill("8");
  await page
    .locator(".exercise-card")
    .first()
    .getByRole("button", { name: "Done", exact: true })
    .first()
    .click();
  await expect(page.locator(".header-status")).toContainText("Saved");
  await page.reload();
  await page
    .getByRole("button", { name: "Workout", exact: true })
    .first()
    .click();
  await expect(page.getByLabel("Bench Press 1 weight")).toHaveValue("45");
  await expect(
    page
      .locator(".exercise-card")
      .first()
      .getByRole("button", { name: "Undo" }),
  ).toHaveCount(1);
});

test("all planned working sets, timer controls and previous-session reference are usable", async ({
  page,
}) => {
  await english(page);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  const cards = page.locator(".exercise-card");
  for (let i = 0; i < (await cards.count()); i++) {
    const card = cards.nth(i);
    const rows = card.locator(".set-row");
    for (let j = 0; j < (await rows.count()); j++) {
      const row = rows.nth(j);
      await row.locator("input").nth(0).fill("20");
      await row.locator("input").nth(1).fill("10");
      await row.getByRole("button", { name: "Done", exact: true }).click();
    }
  }
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(14);
  const timer = page.locator(".timer");
  await timer.getByRole("button", { name: "60s", exact: true }).click();
  await expect(timer.locator("strong")).toContainText("1:00");
  await timer.getByRole("button", { name: "Pause", exact: true }).click();
  await timer.getByRole("button", { name: "+30s", exact: true }).click();
  await expect(timer.locator("strong")).toContainText("1:30");
  await timer.getByRole("button", { name: "Resume", exact: true }).click();
  await page
    .locator(".session-header")
    .getByRole("button", { name: "Pause", exact: true })
    .click();
  await expect(cards.first().locator("input").first()).toBeDisabled();
  await page
    .locator(".session-header")
    .getByRole("button", { name: "Resume", exact: true })
    .click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(page.locator(".modal")).toContainText("14 sets");
  await page
    .locator(".modal")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .first()
    .click();
  await expect(cards.first().locator(".previous")).toContainText("20 kg × 10");
  await expect(cards.first().locator("input").first()).toHaveValue("");
  await expect(cards.first().getByRole("button", { name: "Undo" })).toHaveCount(
    0,
  );
});

test("invalid backup is rejected and exported data restores in an independent browser", async ({
  page,
  browser,
}) => {
  const { readFile } = await import("node:fs/promises");
  await english(page);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  const downloaded = await download;
  const contents = await readFile((await downloaded.path())!);
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{broken"),
    });
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("alert").getByRole("button").click();
  const independent = await browser.newContext();
  const other = await independent.newPage();
  await other.goto("/");
  await expect(other.locator("html")).toHaveAttribute("lang", "ar");
  await other.getByRole("button", { name: "الإعدادات", exact: true }).click();
  other.on("dialog", (dialog) => dialog.accept());
  await other
    .locator("input[type=file]")
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: contents,
    });
  await expect(other.locator("html")).toHaveAttribute("lang", "en");
  await expect(other.getByRole("status")).toContainText("Backup imported");
  await independent.close();
});

test("two tabs cannot silently overwrite each other", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  await expect(other.locator(".hero")).toBeVisible();
  await page.getByRole("button", { name: "ابدأ التمرين", exact: true }).click();
  await expect(page.locator(".header-status")).toContainText("محفوظ");
  await other
    .getByRole("button", { name: "ابدأ التمرين", exact: true })
    .click();
  await expect(other.getByRole("alert")).toContainText("نافذة أخرى");
  await other.reload();
  await other
    .getByRole("button", { name: "التمرين", exact: true })
    .first()
    .click();
  await expect(other.locator(".exercise-card")).toHaveCount(6);
});
