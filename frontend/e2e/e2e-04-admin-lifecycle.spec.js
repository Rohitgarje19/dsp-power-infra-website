import { test, expect } from "@playwright/test";
import { basicAuth, fetchLeads, logIn, uniqueName } from "./helpers";

test("TC-E2E-04: admin desk runs the full lifecycle on a lead", async ({ page, request }) => {
  const name = uniqueName("E2E Admin");

  const created = await request.post("/api/leads", {
    data: {
      fullName: name,
      phone: "9876500011",
      customerType: "Residential",
      city: "Pune",
      pincode: "411046",
      source: "e2e",
    },
    headers: { Authorization: basicAuth() },
  });
  expect(created.status()).toBe(201);
  const lead = await created.json();

  page.on("dialog", (dialog) => dialog.accept());
  await logIn(page);

  await page.getByLabel("Search enquiries").fill(name);
  const row = page.locator("tr", { hasText: name });
  await expect(row).toBeVisible();

  // Internal note
  await row.getByRole("button", { name: "Details" }).click();
  const modal = page.getByRole("dialog", { name: "Enquiry details" });
  await expect(modal).toBeVisible();
  await modal.getByLabel("Internal notes").fill("Survey scheduled for Saturday.");
  await modal.getByRole("button", { name: /Save notes/ }).click();
  await expect(modal.getByRole("button", { name: "Saved" })).toBeVisible();
  await modal.getByRole("button", { name: "Close details" }).click();

  const tab = (label) => page.locator(".admin-tabs button", { hasText: label });

  // Resolve → Resolved tab
  await row.getByRole("button", { name: "Resolve" }).click();
  await expect(row).toHaveCount(0);
  await tab("Resolved").click();
  await expect(row).toBeVisible();
  await expect(row.locator(".admin-status")).toHaveText("Resolved");

  // Restore → Active tab
  await row.getByRole("button", { name: "Restore" }).click();
  await expect(row).toHaveCount(0);
  await tab("Active").click();
  await expect(row).toBeVisible();

  // Soft delete → Deleted tab
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(row).toHaveCount(0);
  await tab("Deleted").click();
  await expect(row).toBeVisible();

  // Restore from deleted → Active
  await row.getByRole("button", { name: "Restore" }).click();
  await expect(row).toHaveCount(0);
  await tab("Active").click();
  await expect(row).toBeVisible();

  // Delete again and purge permanently
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(row).toHaveCount(0);
  await tab("Deleted").click();
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Delete permanently" }).click();
  await expect(row).toHaveCount(0);

  const leads = await fetchLeads(request);
  expect(leads.find((entry) => entry.id === lead.id)).toBeUndefined();
});
