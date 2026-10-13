// Landing screenshots for the design critique pass, plus a focus check on the phone demo.
import { expect, test } from "@playwright/test";

const OUT = process.env.SHOT_DIR ?? "test-results/landing";
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
