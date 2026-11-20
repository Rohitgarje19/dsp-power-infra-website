import { expect } from "@playwright/test";

// Override when the local backend uses non-default admin credentials.
const ADMIN_USER = process.env.E2E_ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "local-dev-admin";

export function basicAuth() {
  return "Basic " + Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString("base64");
}

export function uniqueName(prefix) {
  return `${prefix} ${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export async function fetchLeads(request) {
  const response = await request.get("/api/admin/leads?status=all&size=200", {
    headers: { Authorization: basicAuth() },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return body.items;
}

export async function deleteLead(request, id) {
  const response = await request.delete(`/api/admin/leads/${id}`, { headers: { Authorization: basicAuth() } });
  expect(response.status()).toBe(204);
}

/** Range inputs are not fillable; bypass React's value tracker and fire an input event. */
export async function setRange(locator, value) {
  await locator.evaluate((element, next) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(element, String(next));
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

export async function fillLeadForm(scope, { name, phone = "9876543210", email, city = "Pune", pincode = "411046", message }) {
  await scope.getByLabel("Full name").fill(name);
  await scope.getByLabel("Phone").fill(phone);
  if (email) await scope.getByLabel("Email").fill(email);
  await scope.getByLabel("City").fill(city);
  await scope.getByLabel("PIN code").fill(pincode);
  if (message) await scope.getByLabel("Project details").fill(message);
  await scope.getByRole("checkbox").check();
}

export async function logIn(page) {
  await page.goto("/admin");
  await page.getByLabel("Username").fill(ADMIN_USER);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page.getByRole("heading", { name: "Enquiry dashboard" })).toBeVisible();
}
