import { test, expect } from "@playwright/test";
import { fillLeadForm, fetchLeads, deleteLead, uniqueName } from "./helpers";

test("TC-E2E-01: visitor opens the hero quote modal and submits a lead", async ({ page, request }) => {
  const name = uniqueName("E2E Home");

  await page.goto("/");
  // The header carries the same CTA label; scope to the hero.
  await page.getByRole("main").getByRole("button", { name: /Get a Free Consultation/i }).click();

  const dialog = page.getByRole("dialog", { name: "Get a free solar quote" });
  await expect(dialog).toBeVisible();

  await fillLeadForm(dialog, { name });
  await dialog.getByRole("button", { name: /Request a consultation/i }).click();
  await expect(dialog.getByRole("status")).toContainText("Thanks, we have your enquiry.");

  const leads = await fetchLeads(request);
  const lead = leads.find((row) => row.fullName === name);
  expect(lead, "lead should be persisted").toBeTruthy();
  expect(lead.source).toBe("quick-quote");
  expect(lead.sourcePage).toBe("/");
  expect(lead.city).toBe("Pune");
  expect(lead.pincode).toBe("411046");

  await deleteLead(request, lead.id);
});
