import { test, expect } from "@playwright/test";
import { fillLeadForm, logIn, setRange } from "./helpers";

test.describe("mobile viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("TC-E2E-05: drawer, calculator, sticky CTA, form and admin table work at 390px", async ({ page }) => {
    const assertNoHorizontalOverflow = async () => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    };

    await page.goto("/");
    await assertNoHorizontalOverflow();

    // Navigation drawer + Solutions accordion
    await page.getByRole("button", { name: "Toggle menu" }).click();
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    const solutions = nav.getByRole("button", { name: /Solutions/ });
    await solutions.click();
    await expect(solutions).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: "Toggle menu" }).click();

    // Sticky mobile quote bar after scrolling
    await page.evaluate(() => window.scrollTo(0, 900));
    const stickyBar = page.locator(".mobile-cta.show");
    await expect(stickyBar).toBeVisible();
    await expect(stickyBar.getByRole("button", { name: "Get free quote" })).toBeVisible();

    // Calculator controls are reachable and usable
    await page.goto("/solar-calculator");
    const slider = page.getByLabel("Average monthly electricity bill");
    await setRange(slider, 3500);
    await expect(slider).toHaveValue("3500");
    await expect(page.getByRole("button", { name: /Calculate my estimate/i })).toBeVisible();
    await assertNoHorizontalOverflow();

    // Lead form submits on mobile (mocked so the API rate limit is untouched)
    await page.route("**/api/leads", (route) =>
      route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: 999 }) }),
    );
    await page.goto("/contact");
    const form = page.locator("form.form-card");
    await fillLeadForm(form, { name: "Mobile E2E", phone: "9876500022" });
    await form.getByRole("button", { name: /Request a consultation/ }).click();
    await expect(page.getByRole("status")).toContainText("Thanks, we have your enquiry.");

    // Admin desk is usable at 390px without page overflow
    await logIn(page);
    await expect(page.locator("table.admin-table")).toBeVisible();
    await assertNoHorizontalOverflow();
  });
});
