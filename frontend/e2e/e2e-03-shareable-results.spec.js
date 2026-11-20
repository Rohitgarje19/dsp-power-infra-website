import { test, expect } from "@playwright/test";

const RESULTS_URL =
  "/solar-calculator/results?pincode=411046&billValue=4000&city=Pune&tariff=9&yield=120&costPerKw=60000&areaPerKw=80";

async function resultStats(page) {
  await page.goto(RESULTS_URL);
  const stats = await page.locator(".result-stats article strong").allInnerTexts();
  const subsidy = await page.locator(".subsidy-amount").innerText();
  return { stats, subsidy };
}

test("TC-E2E-03: a shared results URL renders identical numbers in a new context", async ({ page, browser }) => {
  const first = await resultStats(page);
  expect(first.stats.length).toBe(3);

  const freshContext = await browser.newContext();
  const freshPage = await freshContext.newPage();
  const second = await resultStats(freshPage);

  expect(second.stats).toEqual(first.stats);
  expect(second.subsidy).toBe(first.subsidy);
  await freshContext.close();
});
