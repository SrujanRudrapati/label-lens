import { test, expect, type Page } from "@playwright/test";

// Screenshots for the design critique pass. Run with: npx playwright test e2e/screens.spec.ts
const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "1280", width: 1280, height: 800 },
] as const;

const DEMO_PROFILE = { allergies: ["peanut", "tree nuts"], medications: ["warfarin"], diet: ["vegan"], language: "en" };
const OUT = "docs/screenshots";

async function seedProfile(page: Page) {
  await page.addInitScript((profile) => {
    window.localStorage.setItem("label-lens:profile", JSON.stringify(profile));
  }, DEMO_PROFILE);
}

for (const vp of VIEWPORTS) {
  test(`screens at ${vp.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await seedProfile(page);

    let releaseAnalyze = () => {};
    const analyzeHeld = new Promise<void>((resolve) => (releaseAnalyze = resolve));
    await page.route("**/api/analyze", async (route) => {
      await analyzeHeld;
      await route.continue();
    });

    await page.goto("/");
    await expect(page.getByRole("button", { name: "Scan a label" })).toBeVisible();
    await expect(page.getByText("Checking for")).toBeVisible();
    await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
    await page.screenshot({ path: `${OUT}/home-${vp.name}.png`, fullPage: true });

    await page.getByRole("button", { name: "Snack bar" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Trailhead Crunch Honey Peanut Bar" })).toBeVisible();
    await expect(page.getByText("Checking against your profile")).toBeVisible();
    await page.screenshot({ path: `${OUT}/loading-${vp.name}.png`, fullPage: true });

    releaseAnalyze();
    const firstSticker = page.getByRole("button", { name: /^Danger: Contains peanuts/ });
    await expect(firstSticker).toBeVisible();
    await expect(page.getByText("Saved example")).toBeVisible();
    await page.screenshot({ path: `${OUT}/result-${vp.name}.png`, fullPage: true, animations: "disabled" });

    await firstSticker.click();
    await expect(page.getByText("CONTAINS: PEANUTS, SOY.", { exact: false })).toBeVisible();
    await expect(page.locator("#evidence")).toBeFocused();
    await page.screenshot({ path: `${OUT}/evidence-${vp.name}.png`, fullPage: true, animations: "disabled" });
  });
}
