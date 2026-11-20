import { describe, it, expect } from "vitest";
import {
  DEFAULTS, num, clamp, monthlyUsage, systemSizeKw, roofAreaSqFt,
  monthlyGeneration, billOffset, systemCost, simplePaybackYears, emi, estimate, inr,
} from "../solar";

// TC-CALC-* from docs/TEST_CASES.md
describe("solar math", () => {
  it("TC-CALC-01: usage = bill / tariff (2400 @ ₹8 → 300 kWh)", () => {
    expect(monthlyUsage(2400, 8)).toBe(300);
  });

  it("TC-CALC-02: size rounds up to 0.5 kW steps (300 kWh / 120 → 2.5 kW)", () => {
    expect(systemSizeKw(300, 120)).toBe(2.5);
    expect(systemSizeKw(250, 120)).toBe(2.5); // 2.083 → 2.5
    expect(systemSizeKw(310, 120)).toBe(3);   // 2.583 → 3.0
  });

  it("TC-CALC-03: minimum system size is 1 kW (rate-card floor)", () => {
    expect(systemSizeKw(0)).toBe(1);
    expect(systemSizeKw(10, 120)).toBe(1);
    expect(systemSizeKw(-50)).toBe(1);
  });

  it("TC-CALC-04: bill offset never exceeds the bill", () => {
    expect(billOffset(2400, 400, 8)).toBe(2400); // generation worth 3200 capped
    expect(billOffset(2400, 200, 8)).toBe(1600);
    expect(billOffset(0, 400, 8)).toBe(0);
  });

  it("TC-CALC-05: simple payback = cost / annual offset", () => {
    expect(simplePaybackYears(150000, 28800)).toBeCloseTo(5.2083, 3);
    expect(simplePaybackYears(150000, 0)).toBe(0);
  });

  it("TC-CALC-06: EMI reducing balance (₹2,50,000 @ 10% for 60 months ≈ ₹5,312)", () => {
    const { monthly, total } = emi(250000, 10, 60);
    expect(monthly).toBeGreaterThan(5300);
    expect(monthly).toBeLessThan(5325);
    expect(total).toBeGreaterThan(monthly * 60 - 60);
    expect(total).toBeLessThan(monthly * 60 + 60);
  });

  it("TC-CALC-07: zero-rate EMI is principal / months", () => {
    expect(emi(120000, 0, 60)).toEqual({ monthly: 2000, total: 120000 });
  });

  it("TC-CALC-08: full estimate bundle is internally consistent", () => {
    const e = estimate({ bill: 2400 });
    expect(e.usage).toBe(300);
    expect(e.kw).toBe(2.5);
    expect(e.generation).toBe(300);
    expect(e.offset).toBe(2400);
    expect(e.yearly).toBe(28800);
    expect(e.cost).toBe(175000);
    expect(e.roof).toBe(200);
    expect(e.payback).toBeCloseTo(6.076, 3);
  });

  it("TC-RATE: prices each DSP connection type from the rate card", () => {
    expect(estimate({ bill: 2400 }).cost).toBe(175000); // residential 2.5 kW × ₹70k
    expect(estimate({ bill: 2400, connectionType: "Commercial" }).cost).toBe(87500);
    expect(estimate({ bill: 2400, connectionType: "Industrial" }).cost).toBe(80000);
  });

  it("TC-RATE: adds ₹1,000 per metre above the 20 m allowance", () => {
    const e = estimate({ bill: 2400, heightM: 24 });
    expect(e.heightSurcharge).toBe(4000);
    expect(e.cost).toBe(179000);
  });

  it("clamps out-of-range assumptions to safe bounds", () => {
    const e = estimate({ bill: 2400, tariff: 0, yieldPerKw: 5, costPerKw: 1, areaPerKw: 1 });
    expect(e.tariff).toBe(1);
    expect(e.yieldPerKw).toBe(20);
    expect(e.costPerKw).toBe(10000);
    expect(e.areaPerKw).toBe(20);
  });

  it("handles junk input without NaN", () => {
    expect(num("abc", 7)).toBe(7);
    expect(clamp(150, 0, 100)).toBe(100);
    const e = estimate({ bill: "not-a-number" });
    expect(Number.isFinite(e.kw)).toBe(true);
    expect(Number.isFinite(e.payback)).toBe(true);
  });

  it("helper geometry and cost functions", () => {
    expect(roofAreaSqFt(3)).toBe(240);
    expect(monthlyGeneration(2.5)).toBe(300);
    expect(systemCost(2.5)).toBe(175000);
    expect(DEFAULTS.tariff).toBe(8);
  });

  it("formats INR in Indian grouping", () => {
    expect(inr(150000)).toBe("₹1,50,000");
    expect(inr(78000)).toBe("₹78,000");
  });
});