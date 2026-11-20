// Pure solar-planning math. Every function is side-effect free and unit-tested.
// All monetary values in INR, energy in kWh, capacity in kW.

import { RATE_CARD, quoteFor, rateFor } from "../data/rates";

export const DEFAULTS = Object.freeze({
  tariff: 8,          // ₹ per kWh
  yieldPerKw: 120,    // kWh generated per kW per month
  costPerKw: RATE_CARD.connections.Residential.perKw, // DSP turnkey ₹ per kW
  areaPerKw: 80,      // sq ft of unshaded roof per kW
});

export function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Estimated monthly consumption from a bill and tariff. */
export function monthlyUsage(bill, tariff = DEFAULTS.tariff) {
  const t = Math.max(1, num(tariff, DEFAULTS.tariff));
  return Math.max(0, num(bill)) / t;
}

/** System size rounded UP to the nearest 0.5 kW, never below the 1 kW rate-card floor. */
export function systemSizeKw(usage, yieldPerKw = DEFAULTS.yieldPerKw) {
  const y = Math.max(1, num(yieldPerKw, DEFAULTS.yieldPerKw));
  const raw = Math.max(0, num(usage)) / y;
  return Math.max(RATE_CARD.minKw, Math.ceil(raw * 2) / 2);
}

export function roofAreaSqFt(kw, areaPerKw = DEFAULTS.areaPerKw) {
  return Math.max(0, num(kw)) * Math.max(0, num(areaPerKw, DEFAULTS.areaPerKw));
}

export function monthlyGeneration(kw, yieldPerKw = DEFAULTS.yieldPerKw) {
  return Math.max(0, num(kw)) * Math.max(0, num(yieldPerKw, DEFAULTS.yieldPerKw));
}

/** Bill offset can never exceed the bill itself. */
export function billOffset(bill, generation, tariff = DEFAULTS.tariff) {
  const b = Math.max(0, num(bill));
  return Math.min(b, Math.max(0, num(generation)) * Math.max(0, num(tariff)));
}

export function systemCost(kw, costPerKw = DEFAULTS.costPerKw) {
  return Math.max(0, num(kw)) * Math.max(0, num(costPerKw, DEFAULTS.costPerKw));
}

/** Simple payback in years; 0 when there is no annual offset. */
export function simplePaybackYears(cost, annualOffset) {
  const a = Math.max(0, num(annualOffset));
  return a > 0 ? Math.max(0, num(cost)) / a : 0;
}

/** Standard reducing-balance EMI. Returns { monthly, total } rounded to rupees. */
export function emi(principal, annualRatePct, months) {
  const a = Math.max(0, num(principal));
  const n = Math.max(1, Math.round(num(months, 1)));
  const r = Math.max(0, num(annualRatePct)) / 1200;
  const monthly = r > 0 ? (a * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : a / n;
  return { monthly: Math.round(monthly), total: Math.round(monthly * n) };
}

/** Full estimate bundle used by the calculator and results pages. */
export function estimate({ bill, tariff, yieldPerKw, costPerKw, areaPerKw, connectionType = "Residential", heightM = 0 }) {
  const t = clamp(num(tariff, DEFAULTS.tariff), 1, 100);
  const y = clamp(num(yieldPerKw, DEFAULTS.yieldPerKw), 20, 250);
  const sheet = rateFor(connectionType);
  const c = clamp(num(costPerKw, sheet ? sheet.perKw : DEFAULTS.costPerKw), 10000, 200000);
  const area = clamp(num(areaPerKw, DEFAULTS.areaPerKw), 20, 200);
  const b = Math.max(0, num(bill));
  const usage = monthlyUsage(b, t);
  const kw = systemSizeKw(usage, y);
  const generation = monthlyGeneration(kw, y);
  const offset = billOffset(b, generation, t);
  const quote = quoteFor({ kw, connectionType, heightM, ratePerKw: c });
  const proposal = Boolean(quote.needsProposal);
  const cost = proposal ? 0 : quote.total;
  const yearly = offset * 12;
  return {
    bill: b, tariff: t, yieldPerKw: y, costPerKw: c, areaPerKw: area,
    connectionType: quote.connectionType,
    rateSupported: Boolean(sheet),
    needsProposal: proposal,
    heightM: Math.max(0, num(heightM)),
    billableKw: quote.billableKw,
    baseCost: quote.baseCost,
    heightSurcharge: quote.heightSurcharge,
    usage, kw, generation, offset, yearly, cost,
    roof: roofAreaSqFt(kw, area),
    payback: proposal ? 0 : simplePaybackYears(cost, yearly),
  };
}

export const inr = (n) => "₹" + Math.round(num(n)).toLocaleString("en-IN");