import { test, expect } from "@playwright/test";

// Mock mode (no API key): a sample label becomes stickers, and a sticker opens the label's own words.
test("happy path: sample label to sticker to evidence", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("label-lens:setup-done", "1");
    window.localStorage.setItem(
      "label-lens:profile",
      JSON.stringify({ allergies: ["peanut"], medications: [], diet: [], language: "en" }),
    );
  });
  await page.goto("/");

  // Desktop viewport: the landing page offers the snack sample as "or try a sample".
  await page.getByRole("button", { name: "or try a sample" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Trailhead Crunch Honey Peanut Bar" })).toBeVisible();

  const sticker = page.getByRole("button", { name: /^Contains peanuts\. Danger/ });
  await expect(sticker).toBeVisible();
  await sticker.click();

  await expect(page.locator("#evidence")).toContainText("CONTAINS: PEANUTS, SOY.");
  await expect(page.getByText("Not safe for you", { exact: true })).toBeVisible();
});
