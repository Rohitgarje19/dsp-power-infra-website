import { test, expect } from "@playwright/test";
import { fillLeadForm, fetchLeads, deleteLead, uniqueName } from "./helpers";

test("TC-E2E-06: API outage shows a clear error and the retry creates exactly one lead", async ({ page, request }) => {
  const name = uniqueName("E2E Resilience");

  await page.route("**/api/leads", (route) => route.abort("failed"));
  await page.goto("/contact");
  const form = page.locator("form.form-card");
  await fillLeadForm(form, { name, phone: "9876500033" });
  await form.getByRole("button", { name: /Request a consultation/ }).click();
  await expect(form.getByRole("alert")).toContainText("NOT saved");

  // "Service restored": the form keeps its data, so a retry goes straight through.
  await page.unroute("**/api/leads");
  await form.getByRole("button", { name: /Request a consultation/ }).click();
  await expect(page.getByRole("status")).toContainText("Thanks, we have your enquiry.");

  const leads = await fetchLeads(request);
  const matches = leads.filter((row) => row.fullName === name);
  expect(matches).toHaveLength(1);

  await deleteLead(request, matches[0].id);
});
