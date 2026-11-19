// Serviceability is config-driven. DSP is based in Pune; prefixes below are the
// confirmed planning region. Unknown PINs are NOT rejected — the lead is still
// accepted and flagged for the team to confirm.

export const SERVICEABLE_PREFIXES = ["411", "412"]; // Pune region
export const SERVICEABLE_LABEL = "Pune region";

export function isValidPincode(pin) {
  return /^[1-9][0-9]{5}$/.test(String(pin || "").trim());
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