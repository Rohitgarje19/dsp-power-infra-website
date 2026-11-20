import { describe, it, expect } from "vitest";
import {
  RATE_CARD, CONNECTION_TYPES, normalizeConnectionType, rateFor,
  billableKw, heightSurcharge, needsProposal, quoteFor,
} from "../rates";

// Rates synced from "DATA RATE PER KW" (see rates.js header for sheet caveats).
describe("DSP rate card", () => {
  it("reproduces the sheet's per-kW formulas", () => {
    expect(quoteFor({ kw: 3, connectionType: "Residential" })).toMatchObject({ ratePerKw: 70000, baseCost: 210000, total: 210000 });
    expect(quoteFor({ kw: 10, connectionType: "Commercial" })).toMatchObject({ ratePerKw: 35000, baseCost: 350000, total: 350000 });
    expect(quoteFor({ kw: 200, connectionType: "Industrial" })).toMatchObject({ ratePerKw: 32000, baseCost: 6400000, total: 6400000 });
  });

  it("prices fractional kW at the same per-kW rate", () => {
    expect(quoteFor({ kw: 2.5 }).baseCost).toBe(175000);
    expect(quoteFor({ kw: 2.5, connectionType: "Commercial" }).baseCost).toBe(87500);
  });

  it("floors capacity at 1 kW inside the ladder", () => {
    expect(billableKw(0.5)).toBe(1);
    expect(billableKw(0)).toBe(1);
    expect(billableKw(-5)).toBe(1);
    expect(billableKw(250)).toBe(200);
  });

  it("routes systems above 200 kW to a site-specific proposal", () => {
    expect(needsProposal(200)).toBe(false);
    expect(needsProposal(200.5)).toBe(true);
    expect(quoteFor({ kw: 200 }).needsProposal).toBe(false);
    expect(quoteFor({ kw: 250 })).toMatchObject({
      supported: true,
      needsProposal: true,
      billableKw: 250,
      baseCost: 0,
      total: 0,
    });
  });

  it("adds a flat ₹1,000/m surcharge only above 20 m", () => {
    expect(heightSurcharge(18)).toBe(0);
    expect(heightSurcharge(20)).toBe(0);
    expect(heightSurcharge(24)).toBe(4000);
    expect(quoteFor({ kw: 2, heightM: 22.5 }).total).toBe(142500);
  });

  it("marks only residential as subsidy eligible", () => {
    expect(quoteFor({ kw: 3, connectionType: "Residential" }).subsidyEligible).toBe(true);
    expect(quoteFor({ kw: 3, connectionType: "Commercial" }).subsidyEligible).toBe(false);
    expect(quoteFor({ kw: 3, connectionType: "Industrial" }).subsidyEligible).toBe(false);
  });

  it("normalizes labels and leaves unknown types unsupported", () => {
    expect(normalizeConnectionType("home")).toBe("Residential");
    expect(normalizeConnectionType("COMMERCIAL")).toBe("Commercial");
    expect(rateFor("Housing Society")).toBeNull();
    expect(quoteFor({ kw: 3, connectionType: "Housing Society" }).supported).toBe(false);
    expect(quoteFor({ kw: 3, connectionType: "Housing Society", ratePerKw: 50000 }).total).toBe(150000);
  });

  it("keeps the residential ladder linear (ignores the sheet's 21/41/61… cells)", () => {
    expect(quoteFor({ kw: 1 }).total).toBe(70000);
    expect(quoteFor({ kw: 21 }).total).toBe(1470000);
    expect(quoteFor({ kw: 41 }).total).toBe(2870000);
    expect(quoteFor({ kw: 200 }).total).toBe(14000000);
  });

  it("exposes the three sheet connection types and confirmed terms", () => {
    expect(CONNECTION_TYPES).toEqual(["Residential", "Commercial", "Industrial"]);
    expect(RATE_CARD.minKw).toBe(1);
    expect(RATE_CARD.maxKw).toBe(200);
    expect(RATE_CARD.heightIncludedM).toBe(20);
    expect(RATE_CARD.heightMeasuredFrom).toBe("ground level");
    expect(RATE_CARD.gstIncluded).toBe(true);
    expect(RATE_CARD.turnkey).toBe(true);
    expect(RATE_CARD.connections.Residential.panel).toBe("DCR");
    expect(RATE_CARD.connections.Commercial.panel).toBe("Non-DCR");
    expect(RATE_CARD.connections.Industrial.panel).toBe("Non-DCR");
  });
});
