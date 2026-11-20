import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// TC-ANALYTICS-* from docs/TEST_CASES.md
async function load() {
  vi.resetModules();
  return import("../analytics");
}

beforeEach(() => {
  window.localStorage.clear();
  document.getElementById("dsp-ga4")?.remove();
  delete window.dataLayer;
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("consent-aware analytics", () => {
  it("TC-ANALYTICS-01: without a measurement ID nothing loads and no events are queued", async () => {
    const analytics = await load();
    expect(analytics.analyticsConfigured()).toBe(false);
    analytics.initAnalytics();
    analytics.trackPageview("/homes");
    expect(document.getElementById("dsp-ga4")).toBeNull();
    expect(window.dataLayer).toBeUndefined();
    expect(analytics.isAnalyticsActive()).toBe(false);
  });

  it("TC-ANALYTICS-02: granting consent loads GA4 once and queues a config plus page view", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const analytics = await load();
    expect(analytics.analyticsConfigured()).toBe(true);

    analytics.initAnalytics();
    expect(document.getElementById("dsp-ga4")).toBeNull();

    analytics.setConsent("granted");
    const script = document.getElementById("dsp-ga4");
    expect(script).not.toBeNull();
    expect(script.src).toContain("googletagmanager.com/gtag/js?id=G-TEST123");
    expect(analytics.isAnalyticsActive()).toBe(true);

    const config = window.dataLayer.find((entry) => entry[0] === "config");
    expect(config[1]).toBe("G-TEST123");
    expect(config[2]).toMatchObject({ send_page_view: false, anonymize_ip: true });

    analytics.trackPageview("/blog?ref=test");
    await new Promise((resolve) => setTimeout(resolve, 10));
    const view = window.dataLayer.find((entry) => entry[0] === "event" && entry[1] === "page_view");
    expect(view[2]).toMatchObject({ page_path: "/blog?ref=test" });
  });

  it("TC-ANALYTICS-03: declining keeps analytics off and revoking stops page views", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const analytics = await load();

    analytics.setConsent("denied");
    expect(document.getElementById("dsp-ga4")).toBeNull();
    analytics.trackPageview("/homes");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(window.dataLayer?.some((entry) => entry[0] === "event") ?? false).toBe(false);

    analytics.setConsent("granted");
    expect(analytics.isAnalyticsActive()).toBe(true);
    analytics.setConsent("denied");
    expect(analytics.isAnalyticsActive()).toBe(false);
    analytics.trackPageview("/homes");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(window.dataLayer.filter((entry) => entry[0] === "event")).toHaveLength(0);
  });
});
