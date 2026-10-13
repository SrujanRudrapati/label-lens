import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("first-run setup, peanut and warfarin cases, Spanish, and Ask", async ({ page }) => {
  await page.goto("/");

  // First run: setup is offered and skippable; fill it in.
  await expect(page.getByRole("heading", { name: "What should we watch for?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip for now" })).toBeVisible();
  await page.getByLabel("Add to allergies").fill("peanut");
  await page.getByLabel("Add to allergies").press("Enter");
  await page.getByLabel("Add to medicines you take").fill("warfarin");
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("button", { name: /Checking for peanut, warfarin/ })).toBeVisible();

  // Peanut allergy: red sticker with the label's own words behind it.
  await page.getByRole("button", { name: "Snack bar" }).click();
  const peanut = page.getByRole("button", { name: /^Contains peanuts\. Danger/ });
  await expect(peanut).toBeVisible();
  await peanut.click();
  await expect(page.locator("#evidence")).toContainText("CONTAINS: PEANUTS, SOY.");
  await expect(page.locator("#evidence")).toContainText("Matches your allergy: peanut");

  // Warfarin + ibuprofen: caution interaction that sends the user to a pharmacist.
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "Pain relief" }).click();
  const interaction = page.getByRole("button", { name: /^Interacts with warfarin\. Caution/ });
  await expect(interaction).toBeVisible();
  await interaction.click();
  await expect(page.locator("#evidence")).toContainText(/pharmacist/i);

  // Ask streams an answer into the page.
  await page.getByLabel("Your question about this label").fill("Can I take this with food?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByText(/saved example answer/)).toBeVisible();

  // Spanish end to end.
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: /Checking for/ }).click();
  await page.getByText("Español").click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("button", { name: "Snack bar" }).click();
  await expect(page.getByRole("button", { name: /^Contiene cacahuates\. Danger/ })).toBeVisible();
});

test("a returning visitor skips setup", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await expect(page.getByRole("button", { name: "Scan a label" }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Scan a label" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "What should we watch for?" })).toHaveCount(0);
});

test("an unreadable saved profile is reported, not silently emptied", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("label-lens:profile", "{not json");
    window.localStorage.setItem("label-lens:setup-done", "1");
  });
  await page.goto("/");
  await expect(page.getByText(/saved profile couldn't be read/)).toBeVisible();
  await page.getByRole("button", { name: "Skip for now" }).click();
  // Skipping must not overwrite what was saved.
  expect(await page.evaluate(() => window.localStorage.getItem("label-lens:profile"))).toBe("{not json");
});
