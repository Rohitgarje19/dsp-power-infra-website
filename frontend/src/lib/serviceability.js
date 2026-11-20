// Serviceability mirrors the backend's app.serviceability.* settings: the whole
// of Maharashtra is covered (PIN prefixes 400–445) except Goa's 403. Unknown
// PINs are NOT rejected — the lead is still accepted and flagged for the team
// to confirm.

function prefixRange(from, to, excluded = []) {
  return Array.from({ length: to - from + 1 }, (_, index) => String(from + index))
    .filter((prefix) => !excluded.includes(prefix));
}

export const SERVICEABLE_PREFIXES = prefixRange(400, 445, ["403"]); // Maharashtra
export const SERVICEABLE_LABEL = "Maharashtra";

// City hints for PIN -> City autofill. Only confirmed serviceable prefixes are
// listed — never guess a city outside the region. Visitors can always edit it.
export const PIN_CITY_HINTS = [
  { prefix: "411", city: "Pune" },
  { prefix: "412", city: "Pune" },
];

export function cityForPincode(pin) {
  const p = String(pin || "").trim();
  if (!isValidPincode(p)) return null;
  const hint = PIN_CITY_HINTS.find((entry) => p.startsWith(entry.prefix));
  return hint ? hint.city : null;
}

export function isValidPincode(pin) {
  return /^[1-9][0-9]{5}$/.test(String(pin || "").trim());
}

// Resolves the city for any Indian PIN through the backend's cached India Post
// lookup. The local confirmed-region hint is used immediately and whenever the
// lookup is unavailable, so autofill still works offline.
export async function resolveCity(pin) {
  const fallback = cityForPincode(pin);
  if (!isValidPincode(pin) || typeof fetch !== "function") return fallback;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(`/api/serviceability/${pin}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    const city = typeof data?.city === "string" ? data.city.trim() : "";
    return city || fallback;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export function checkPincode(pin) {
  const p = String(pin || "").trim();
  if (!isValidPincode(p)) {
    return { valid: false, serviceable: false, label: null, message: "Enter a valid 6-digit PIN code." };
  }
  const serviceable = SERVICEABLE_PREFIXES.some((prefix) => p.startsWith(prefix));
  return {
    valid: true,
    serviceable,
    label: serviceable ? SERVICEABLE_LABEL : null,
    message: serviceable
      ? "Great — this PIN is in our Maharashtra service region."
      : "We haven't confirmed service at this PIN yet. Send your enquiry and the team will check availability.",
  };
}