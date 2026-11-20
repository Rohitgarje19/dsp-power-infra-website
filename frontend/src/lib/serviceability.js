// Serviceability is config-driven. DSP is based in Pune; prefixes below are the
// confirmed planning region. Unknown PINs are NOT rejected — the lead is still
// accepted and flagged for the team to confirm.

export const SERVICEABLE_PREFIXES = ["411", "412"]; // Pune region
export const SERVICEABLE_LABEL = "Pune region";

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
      ? "Great — this PIN is in our core service region."
      : "We haven't confirmed service at this PIN yet. Send your enquiry and the team will check availability.",
  };
}