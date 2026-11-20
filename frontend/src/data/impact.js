// Source: DSP Power Infra's PM Surya Ghar vendor dashboard, 20 Nov 2026.
// These are scheme-only totals — not the company's total project count.
// "Subsidies approved" is used instead of the dashboard's "redeemed" figure
// because redeemed includes applications still pending approval.
const IMPACT = Object.freeze({
  scheme: "PM Surya Ghar: Muft Bijli Yojana",
  asOf: "20 November 2026",
  applicationsApproved: 468,
  installationsCompleted: 368,
  inspectionsApproved: 362,
  subsidiesApproved: 325,
});

export const PM_SURYA_GHAR = IMPACT;

export const PM_SURYA_GHAR_METRICS = Object.freeze([
  Object.freeze({ key: "applications", value: IMPACT.applicationsApproved, label: "Applications approved" }),
  Object.freeze({ key: "installations", value: IMPACT.installationsCompleted, label: "Installations completed" }),
  Object.freeze({ key: "inspections", value: IMPACT.inspectionsApproved, label: "Inspections approved" }),
  Object.freeze({ key: "subsidies", value: IMPACT.subsidiesApproved, label: "Subsidies approved" }),
]);
