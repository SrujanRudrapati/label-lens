// Landing screenshots for the design critique pass, plus focus checks on the phone demo and the nav.
import { expect, test, type Page } from "@playwright/test";

const OUT = process.env.SHOT_DIR ?? "test-results/landing";

/** Scroll the whole page once so every lazy phone screen loads, then wait for them. */
async function loadLazyImages(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].filter((img) => img.checkVisibility()).every((img) => img.complete && img.naturalWidth > 0));
}

for (const vp of [{ w: 1440, h: 900 }, { w: 1280, h: 800 }, { w: 390, h: 844 }]) {
  test(`landing ${vp.w}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.addInitScript(() => window.localStorage.setItem("label-lens:setup-done", "1"));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    if (vp.w >= 1024) {
      const frame = page.frameLocator('iframe[title^="Label Lens"]');
      await frame.getByRole("button", { name: /^Contains peanuts/ }).waitFor();
      await page.waitForTimeout(2000);
    }
    await loadLazyImages(page);
    await expect(page.getByRole("heading", { name: "Questions, answered." })).toBeVisible();
    await page.screenshot({ path: `${OUT}/home-${vp.w}.png` });
    await page.screenshot({ path: `${OUT}/home-${vp.w}-full.png`, fullPage: true });
  });
}

test("the phone demo does not steal focus from the page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.frameLocator('iframe[title^="Label Lens"]').getByRole("button", { name: /^Contains peanuts/ }).waitFor();
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("BODY");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.screenshot({ path: `${OUT}/focus-1440.png` });
});

test("Open the app scrolls to and focuses the hero scan button", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("link", { name: "FAQ" }).first().click();
  await page.getByRole("button", { name: "Open the app" }).first().click();
  const scan = page.getByRole("button", { name: "Scan a label" }).first();
  await expect(scan).toBeFocused();
  await expect(scan).toBeInViewport();
});
