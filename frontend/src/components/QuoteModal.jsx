import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import LeadForm from "./LeadForm";

/**
 * In-place quick-quote modal (SolarSquare-style "Get Free Quote" flow).
 * Reuses LeadForm so validation, honeypot, consent and UTM capture stay identical.
 */
export default function QuoteModal({
  open,
  onClose,
  source = "quick-quote",
  heading = "Get your free quote.",
  eyebrow = "FREE QUOTE",
  intro = "Share a few details and our team will call with a clear, site-specific estimate — no obligation.",
  defaults = {},
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const trigger = document.activeElement;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => {
      panelRef.current?.querySelector("input:not([aria-hidden]), select, textarea")?.focus();
    }, 40);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(focusTimer);
      if (trigger && typeof trigger.focus === "function") trigger.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="quote-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="quote-modal" role="dialog" aria-modal="true" aria-label="Get a free solar quote" ref={panelRef}>
        <button type="button" className="quote-close" onClick={onClose} aria-label="Close quote form">
          <X size={20} />
        </button>
        <LeadForm source={source} defaults={defaults} heading={heading} eyebrow={eyebrow} intro={intro} />
      </div>
    </div>
  );
}