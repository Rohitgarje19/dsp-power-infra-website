import { describe, it, expect } from "vitest";
import { isValidPincode, checkPincode, cityForPincode, PIN_CITY_HINTS, SERVICEABLE_PREFIXES } from "../serviceability";

// TC-SVC-* from docs/TEST_CASES.md
describe("serviceability", () => {
  it("TC-SVC-01: Pune prefixes are serviceable", () => {
    for (const pin of ["411046", "412033", "411001"]) {
      const r = checkPincode(pin);
      expect(r.valid).toBe(true);
      expect(r.serviceable).toBe(true);
      expect(r.label).toBe("Pune region");
    }
    expect(SERVICEABLE_PREFIXES).toEqual(["411", "412"]);
  });

  it("TC-SVC-02: unknown PINs are valid but flagged, not rejected", () => {
    const r = checkPincode("400001");
    expect(r.valid).toBe(true);
    expect(r.serviceable).toBe(false);
    expect(r.message).toMatch(/haven't confirmed/i);
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

  it("does not guess a city outside the confirmed region or for invalid PINs", () => {
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