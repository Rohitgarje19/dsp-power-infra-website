import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CookieConsent from "../CookieConsent";

// TC-ANALYTICS-04 / 05 from docs/TEST_CASES.md
function renderBanner() {
  return render(
    <MemoryRouter>
      <CookieConsent />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  document.getElementById("dsp-ga4")?.remove();
  delete window.dataLayer;
});

describe("cookie consent banner", () => {
  it("TC-ANALYTICS-04: stays hidden when no measurement ID is configured or a choice is stored", () => {
    const first = renderBanner();
    expect(screen.queryByRole("dialog")).toBeNull();
    first.unmount();

    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    window.localStorage.setItem("dsp-analytics-consent", "granted");
    renderBanner();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("TC-ANALYTICS-05: accepting stores consent, closes the banner and loads GA4", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    renderBanner();
    const dialog = screen.getByRole("dialog", { name: /analytics cookies/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");

    fireEvent.click(screen.getByRole("button", { name: /accept analytics/i }));
    expect(window.localStorage.getItem("dsp-analytics-consent")).toBe("granted");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.getElementById("dsp-ga4")).not.toBeNull();
  });

  it("TC-ANALYTICS-06: declining stores a denial and loads nothing", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: /decline analytics/i }));
    expect(window.localStorage.getItem("dsp-analytics-consent")).toBe("denied");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.getElementById("dsp-ga4")).toBeNull();
  });
});
