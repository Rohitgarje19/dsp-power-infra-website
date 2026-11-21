// Consent-aware GA4 wiring. Nothing loads until (a) a measurement ID is
// configured at build time and (b) the visitor grants analytics consent.
const CONSENT_KEY = "dsp-analytics-consent";
const SCRIPT_ID = "dsp-ga4";
let active = false;

function measurementId() {
  return (import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
}

export function analyticsConfigured() {
  return measurementId().length > 0;
}

export function getConsent() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    if (value === "granted" || value === "denied") window.localStorage.setItem(CONSENT_KEY, value);
    else window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage disabled: fall back to in-memory state only.
  }
  if (value === "granted") enableAnalytics();
  else disableAnalytics();
  window.dispatchEvent(new CustomEvent("dsp:consent-change", { detail: value }));
}

function gtag(...args) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function enableAnalytics() {
  const id = measurementId();
  if (!id || getConsent() !== "granted") return;
  if (!document.getElementById(SCRIPT_ID)) {
    window.dataLayer = window.dataLayer || [];
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
    gtag("js", new Date());
    // Page views are sent explicitly by the router so SPA navigations count.
    gtag("config", id, { send_page_view: false, anonymize_ip: true });
  }
  gtag("consent", "update", { analytics_storage: "granted" });
  active = true;
}

function disableAnalytics() {
  active = false;
  if (typeof window.gtag === "function" || Array.isArray(window.dataLayer)) {
    gtag("consent", "update", { analytics_storage: "denied" });
  }
}

/** Called once on app start; no-ops unless consent was already granted. */
export function initAnalytics() {
  if (getConsent() === "granted") enableAnalytics();
}

export function trackPageview(path) {
  if (!active || !analyticsConfigured() || getConsent() !== "granted") return;
  if (typeof document === "undefined") return;
  // Defer one tick so the route's title/meta effects have run.
  setTimeout(() => {
    gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, 0);
}

export function isAnalyticsActive() {
  return active;
}
