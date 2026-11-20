import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isValidPincode,
  checkPincode,
  cityForPincode,
  resolveCity,
  PIN_CITY_HINTS,
  SERVICEABLE_PREFIXES,
} from "../serviceability";

afterEach(() => {
  vi.unstubAllGlobals();
});

// TC-SVC-* from docs/TEST_CASES.md
describe("serviceability", () => {
  it("TC-SVC-01: all Maharashtra prefixes are serviceable", () => {
    for (const pin of ["411046", "412033", "411001", "400001", "413102", "440010", "445001"]) {
      const r = checkPincode(pin);
      expect(r.valid).toBe(true);
      expect(r.serviceable).toBe(true);
      expect(r.label).toBe("Maharashtra");
    }
    expect(SERVICEABLE_PREFIXES[0]).toBe("400");
    expect(SERVICEABLE_PREFIXES).toHaveLength(45);
    expect(SERVICEABLE_PREFIXES).not.toContain("403");
  });

  it("TC-SVC-02: Goa and other states are valid but flagged, not rejected", () => {
    for (const pin of ["403001", "452001"]) {
      const r = checkPincode(pin);
      expect(r.valid).toBe(true);
      expect(r.serviceable).toBe(false);
      expect(r.message).toMatch(/haven't confirmed/i);
    }
  });

  it("TC-SVC-03: invalid PIN formats", () => {
    for (const bad of ["12345", "1234567", "abcdef", "", "011046", null, undefined]) {
      expect(isValidPincode(bad)).toBe(false);
      expect(checkPincode(bad).valid).toBe(false);
    }
  });

  it("trims whitespace before validating", () => {
    expect(checkPincode(" 411046 ").serviceable).toBe(true);
  });

  it("suggests the city for confirmed serviceable PINs", () => {
    expect(cityForPincode("411046")).toBe("Pune");
    expect(cityForPincode("412033")).toBe("Pune");
    expect(cityForPincode(" 411001 ")).toBe("Pune");
  });

  it("does not guess a city outside the local hint list or for invalid PINs", () => {
    expect(cityForPincode("400001")).toBeNull();
    expect(cityForPincode("41104")).toBeNull();
    expect(cityForPincode("")).toBeNull();
  });

  it("keeps every city hint inside the confirmed serviceable prefixes", () => {
    for (const { prefix } of PIN_CITY_HINTS) {
      expect(SERVICEABLE_PREFIXES).toContain(prefix);
    }
  });
});

describe("resolveCity (any Indian PIN)", () => {
  it("uses the backend lookup for PINs without a local hint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ city: "Mumbai", state: "Maharashtra" }),
    }));
    await expect(resolveCity("400001")).resolves.toBe("Mumbai");
    expect(fetch).toHaveBeenCalledWith(
      "/api/serviceability/400001",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("falls back to the local hint when the lookup fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(resolveCity("411046")).resolves.toBe("Pune");
  });

  it("does not call the API for an invalid PIN", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(resolveCity("12345")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when the lookup has no city and there is no local hint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    await expect(resolveCity("400001")).resolves.toBeNull();
  });
});