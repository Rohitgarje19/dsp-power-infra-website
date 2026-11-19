import { describe, it, expect } from "vitest";
import { isValidPincode, checkPincode, SERVICEABLE_PREFIXES } from "../serviceability";

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
});