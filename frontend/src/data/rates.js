// DSP Power Infra turnkey rates, synced from "DATA RATE PER KW".
// The sheet is a 1–200 kW linear table: Residential = kW × ₹70,000,
// Commercial = kW × ₹35,000, Industrial = kW × ₹32,000. The sheet's own
// formulas (E×70000, J×35000, N×32000) are reproduced here, with a 1 kW
// minimum billable size. Rates cover installations up to 20 m; above that
// ₹1,000 per extra metre applies.
// Note: the source sheet has 10 corrupt residential cells (1 kW and every
// 20th tier from 21 kW). This card follows the formulas, not those cells.
// Subsidy is deliberately NOT taken from the sheet's flat ₹7,80,000 column;
// lib/subsidy.js keeps the PM Surya Ghar slabs.

export const RATE_CARD = Object.freeze({
  source: "DSP rate sheet",
  minKw: 1,
  maxKw: 200,
  heightIncludedM: 20,
  extraHeightPerM: 1000,
  connections: Object.freeze({
    Residential: Object.freeze({ label: "Residential", perKw: 70000, subsidyEligible: true }),
    Commercial: Object.freeze({ label: "Commercial", perKw: 35000, subsidyEligible: false }),
    Industrial: Object.freeze({ label: "Industrial", perKw: 32000, subsidyEligible: false }),
  }),
});

export const CONNECTION_TYPES = Object.freeze(["Residential", "Commercial", "Industrial"]);

/** Accepts the spellings used across the site; returns a canonical key or null. */
export function normalizeConnectionType(type) {
  const raw = String(type ?? "").trim().toLowerCase();
  if (raw === "residential" || raw === "home") return "Residential";
  if (raw === "commercial" || raw === "business") return "Commercial";
  if (raw === "industrial" || raw === "industry") return "Industrial";
  return null;
}

/** Rate-card entry for a connection type, or null when the sheet has no rate. */
export function rateFor(type) {
  const key = normalizeConnectionType(type);
  return key ? RATE_CARD.connections[key] : null;
}

/** Pricing applies from 1 kW up to 200 kW; fractional kW bills at the same rate. */
export function billableKw(kw) {
  const n = Number(kw);
  if (!Number.isFinite(n)) return RATE_CARD.minKw;
  return Math.min(RATE_CARD.maxKw, Math.max(RATE_CARD.minKw, n));
}

/** Flat ₹1,000 per metre above the 20 m allowance. */
export function heightSurcharge(heightM) {
  const h = Number(heightM);
  if (!Number.isFinite(h) || h <= RATE_CARD.heightIncludedM) return 0;
  return Math.round((h - RATE_CARD.heightIncludedM) * RATE_CARD.extraHeightPerM);
}

/**
 * Full turnkey quote for a capacity and connection type.
 * ratePerKw overrides the sheet rate (the calculator's editable assumption).
 * Returns ratePerKw null when the type has no sheet rate and none was supplied.
 */
export function quoteFor({ kw, connectionType = "Residential", heightM = 0, ratePerKw } = {}) {
  const connection = rateFor(connectionType);
  const label = connection?.label ?? (String(connectionType ?? "").trim() || null);
  const override = Number(ratePerKw);
  const rate = Number.isFinite(override) && override > 0 ? override : connection?.perKw ?? null;
  if (rate === null) {
    return {
      supported: false,
      connectionType: label,
      ratePerKw: null,
      billableKw: 0,
      baseCost: 0,
      heightSurcharge: 0,
      total: 0,
      subsidyEligible: false,
    };
  }
  const capacity = billableKw(kw);
  const baseCost = Math.round(capacity * rate);
  const extra = heightSurcharge(heightM);
  return {
    supported: true,
    connectionType: label ?? "Custom",
    ratePerKw: rate,
    billableKw: capacity,
    baseCost,
    heightSurcharge: extra,
    total: baseCost + extra,
    subsidyEligible: Boolean(connection?.subsidyEligible),
  };
}
