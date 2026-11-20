import { test, expect } from "@playwright/test";
import { fillLeadForm, fetchLeads, deleteLead, setRange, uniqueName } from "./helpers";

test("TC-E2E-02: hero estimate flows through the calculator into a calculator-sourced lead", async ({ page, request }) => {
  const name = uniqueName("E2E Calc");

  await page.goto("/");
  await page.getByLabel("Your PIN code").fill("411046");
  await setRange(page.getByLabel("Average monthly electricity bill"), 4000);
  await page.getByRole("button", { name: /^Calculate$/ }).click();

  await expect(page).toHaveURL(/\/solar-calculator\?/);
  await expect(page.getByLabel(/^PIN code/)).toHaveValue("411046");
  await page.getByLabel(/^City/).fill("Pune");

  await page.getByText("Adjust the estimate assumptions").click();
  await page.getByLabel(/Average tariff/).fill("9");

  const previewSize = (await page.locator(".savings-preview .preview-stat strong").first().innerText())
    .replace(/\s+/g, " ")
    .trim();

  await page.getByRole("button", { name: /Calculate my estimate/i }).click();

  await expect(page).toHaveURL(/\/solar-calculator\/results\?/);
  const resultSize = (await page.locator(".result-stats article strong").first().innerText())
    .replace(/\s+/g, " ")
    .trim();
  expect(resultSize).toBe(previewSize);

  await page.getByRole("link", { name: /Discuss this estimate/i }).click();
  await expect(page).toHaveURL(/\/contact\?/);
  await expect(page.getByText(/estimate is attached to this enquiry/i)).toBeVisible();

  const form = page.locator("form.form-card");
  await expect(form.getByLabel("PIN code")).toHaveValue("411046");
  await expect(form.getByLabel("City")).toHaveValue("Pune");
  await expect(form.getByLabel("Monthly bill")).toHaveValue("6000");

  await fillLeadForm(form, { name, city: "Pune" });
  await form.getByRole("button", { name: /Request a consultation/ }).click();
  await expect(page.getByRole("status")).toContainText("Thanks, we have your enquiry.");

  const leads = await fetchLeads(request);
  const lead = leads.find((row) => row.fullName === name);
  expect(lead, "calculator lead should be persisted").toBeTruthy();
  expect(lead.source).toBe("calculator");
  expect(lead.sourcePage).toBe("/contact");
  expect(lead.pincode).toBe("411046");

  await deleteLead(request, lead.id);
});
