/** Shared display helpers. */
export const pct = (v, min, max) =>
  Math.max(0, Math.min(100, ((Number(v) - min) / (max - min)) * 100)) + "%";