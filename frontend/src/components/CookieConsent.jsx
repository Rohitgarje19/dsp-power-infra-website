import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { analyticsConfigured, getConsent, setConsent } from "../lib/analytics";

/** Bottom consent prompt shown only when a GA4 measurement ID is configured. */
export default function CookieConsent() {
  const [open, setOpen] = useState(() => analyticsConfigured() && !getConsent());

  useEffect(() => {
    function reopen() { if (analyticsConfigured()) setOpen(true); }
    window.addEventListener("dsp:open-consent", reopen);
    return () => window.removeEventListener("dsp:open-consent", reopen);
  }, []);

  if (!open) return null;

  function choose(value) {
    setConsent(value);
    setOpen(false);
  }

  return (
    <aside className="cookie-banner" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-copy">
      <Cookie size={20} aria-hidden="true" />
      <div>
        <b id="cookie-title">Analytics cookies</b>
        <p id="cookie-copy">
          We would like to use Google Analytics to understand which pages help visitors. It loads only with your
          permission, never for advertising. Read our <Link to="/privacy">privacy policy</Link>.
        </p>
      </div>
      <div className="cookie-actions">
        <button type="button" className="button quiet" onClick={() => choose("denied")}>Decline analytics</button>
        <button type="button" className="button primary" onClick={() => choose("granted")}>Accept analytics</button>
      </div>
    </aside>
  );
}
