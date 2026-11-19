import { describe, it, expect } from "vitest";
import { SUBSIDY, subsidyFor, isSubsidyEligible, afterSubsidy } from "../subsidy";

// TC-SUB-* from docs/TEST_CASES.md
describe("PM Surya Ghar subsidy", () => {
  it("TC-SUB-01: 1 kW → ₹30,000", () => {
    expect(subsidyFor(1)).toBe(30000);
  });

  it("TC-SUB-02: 2 kW → ₹60,000", () => {
    expect(subsidyFor(2)).toBe(60000);
  });

  it("TC-SUB-03: 2.5 kW → ₹69,000 (half of the third-kW slab)", () => {
    expect(subsidyFor(2.5)).toBe(69000);
  });

  it("TC-SUB-04: 3 kW and above are capped at ₹78,000", () => {
    expect(subsidyFor(3)).toBe(78000);
    expect(subsidyFor(5)).toBe(78000);
    expect(subsidyFor(10)).toBe(78000);
    expect(SUBSIDY.cap).toBe(78000);
  });

  it("TC-SUB-05: non-residential types get ₹0", () => {
    expect(subsidyFor(3, "Commercial")).toBe(0);
    expect(subsidyFor(3, "Industrial")).toBe(0);
    expect(subsidyFor(3, "Housing Society")).toBe(0);
    expect(isSubsidyEligible("Commercial")).toBe(false);
    expect(isSubsidyEligible("Residential")).toBe(true);
    expect(isSubsidyEligible("residential")).toBe(true);
  });

  it("TC-SUB-06: zero/negative capacity → ₹0", () => {
    expect(subsidyFor(0)).toBe(0);
    expect(subsidyFor(-2)).toBe(0);
    expect(subsidyFor("junk")).toBe(0);
  });

  it("TC-SUB-07: net cost and payback after subsidy", () => {
    const r = afterSubsidy(180000, 3, 28800);
    expect(r.subsidy).toBe(78000);
    expect(r.net).toBe(102000);
    expect(r.payback).toBeCloseTo(3.5417, 3);
  });

  it("TC-SUB-08: net cost never goes below zero; zero offset → payback 0", () => {
    expect(afterSubsidy(50000, 2, 28800).net).toBe(0);
    expect(afterSubsidy(180000, 3, 0).payback).toBe(0);
  });
});