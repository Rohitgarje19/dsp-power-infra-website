// PM Surya Ghar residential rooftop subsidy (central config — verify current
// rules at https://pmsuryaghar.gov.in before publishing any change).
// Slabs: ₹30,000/kW for the first 2 kW + ₹18,000/kW for capacity between 2–3 kW,
// capped at ₹78,000. Residential only; housing society common areas use a
// separate group-housing route at ₹18,000/kW (customer-confirmed 2026-11-21)
// and are not calculated through the residential slabs here.

export const SUBSIDY = Object.freeze({
  firstSlabKw: 2,
  firstSlabPerKw: 30000,
  secondSlabKw: 1,
  secondSlabPerKw: 18000,
  cap: 78000,
  societyPerKw: 18000,
});

export function subsidyFor(capacityKw, customerType = "Residential") {
  if (String(customerType).toLowerCase() !== "residential") return 0;
  const kw = Math.max(0, Number(capacityKw) || 0);
  const first = Math.min(kw, SUBSIDY.firstSlabKw) * SUBSIDY.firstSlabPerKw;
  const second = Math.min(Math.max(0, kw - SUBSIDY.firstSlabKw), SUBSIDY.secondSlabKw) * SUBSIDY.secondSlabPerKw;
  return Math.min(SUBSIDY.cap, Math.round(first + second));
}

/** Housing society common areas: separate group-housing route, ₹18,000/kW. */
export function societySubsidyFor(capacityKw) {
  const kw = Math.max(0, Number(capacityKw) || 0);
  return Math.round(kw * SUBSIDY.societyPerKw);
}

export function isSubsidyEligible(customerType = "Residential") {
  return String(customerType).toLowerCase() === "residential";
}

/** Net cost and payback after applying an eligible subsidy. */
export function afterSubsidy(grossCost, capacityKw, annualOffset, customerType = "Residential") {
  const subsidy = subsidyFor(capacityKw, customerType);
  const net = Math.max(0, Math.round(grossCost - subsidy));
  const yearly = Math.max(0, Number(annualOffset) || 0);
  return { subsidy, net, payback: yearly > 0 ? net / yearly : 0 };
}