import { describe, it, expect, vi, beforeEach } from "vitest";
import { api, ApiError, getErrorMessage, fieldErrors, postLead } from "../api";

// TC-API-* / TC-FORM error mapping from docs/TEST_CASES.md
const jsonRes = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => (body === null ? "" : JSON.stringify(body)),
});

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("api client", () => {
  it("TC-API-01: postLead sends JSON POST to /api/leads", async () => {
    fetch.mockResolvedValue(jsonRes(201, { id: 1 }));
    const payload = { fullName: "Asha", phone: "9876543210" };
    const result = await postLead(payload);
    expect(result).toEqual({ id: 1 });
    expect(fetch).toHaveBeenCalledWith("/api/leads", expect.objectContaining({
      method: "POST",
      body: JSON.stringify(payload),
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
    }));
  });

  it("TC-API-02: non-2xx throws ApiError with parsed body", async () => {
    fetch.mockResolvedValue(jsonRes(422, { code: "VALIDATION_ERROR", message: "Validation failed", errors: [{ field: "phone", message: "Phone is invalid." }] }));
    await expect(postLead({})).rejects.toMatchObject({ name: "ApiError", status: 422 });
  });

  it("TC-API-03: network failure becomes TypeError('Failed to fetch')", async () => {
    fetch.mockRejectedValue(new Error("socket hang up"));
    await expect(postLead({})).rejects.toThrow("Failed to fetch");
  });

  it("204 responses resolve to null", async () => {
    fetch.mockResolvedValue(jsonRes(204, null));
    await expect(api("/api/admin/leads/1/resolve", { method: "PUT" })).resolves.toBeNull();
  });

  it("auth header is attached when provided", async () => {
    fetch.mockResolvedValue(jsonRes(200, []));
    await api("/api/admin/leads", { auth: "Basic abc" });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Basic abc");
  });
});

describe("retry behaviour", () => {
  it("retries idempotent GET on 5xx and succeeds", async () => {
    fetch
      .mockResolvedValueOnce(jsonRes(503, {}))
      .mockResolvedValueOnce(jsonRes(200, []));
    await expect(api("/api/admin/leads")).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("stops after three attempts on persistent 5xx", async () => {
    fetch.mockResolvedValue(jsonRes(500, {}));
    await expect(api("/api/admin/leads")).rejects.toMatchObject({ name: "ApiError", status: 500 });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("retries GET after a network failure", async () => {
    fetch
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockResolvedValueOnce(jsonRes(200, { status: "ok" }));
    await expect(api("/api/health")).resolves.toEqual({ status: "ok" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("never retries POST so a lead is not created twice", async () => {
    fetch.mockResolvedValue(jsonRes(503, {}));
    await expect(postLead({})).rejects.toMatchObject({ name: "ApiError", status: 503 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not retry non-5xx errors", async () => {
    fetch.mockResolvedValue(jsonRes(429, {}));
    await expect(api("/api/admin/leads")).rejects.toMatchObject({ status: 429 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("error mapping", () => {
  it("TC-FORM-05: 422 joins field messages", () => {
    const err = new ApiError(422, { errors: [{ field: "phone", message: "Phone is invalid." }, { field: "city", message: "City is required." }] });
    expect(getErrorMessage(err)).toBe("Phone is invalid. City is required.");
    expect(fieldErrors(err)).toEqual({ phone: "Phone is invalid.", city: "City is required." });
  });

  it("TC-FORM-06: 429 asks the user to wait", () => {
    expect(getErrorMessage(new ApiError(429, {}))).toMatch(/wait a minute/i);
  });

  it("TC-FORM-07: network error clearly says the enquiry was NOT saved", () => {
    expect(getErrorMessage(new TypeError("Failed to fetch"))).toMatch(/NOT saved/);
  });

  it("maps common statuses to human messages and never leaks internals", () => {
    expect(getErrorMessage(new ApiError(400, {}))).toMatch(/review/i);
    expect(getErrorMessage(new ApiError(401, {}))).toMatch(/sign in/i);
    expect(getErrorMessage(new ApiError(404, {}))).toMatch(/doesn't exist/i);
    expect(getErrorMessage(new ApiError(500, { message: "NullPointerException at line 42" }))).toBe("Something went wrong on our side. Please try again.");
    expect(getErrorMessage(new Error("random"))).toMatch(/unexpected error/i);
    expect(fieldErrors(new ApiError(500, {}))).toEqual({});
  });
});