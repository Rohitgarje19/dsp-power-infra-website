import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStoredTheme, preferredTheme, currentTheme, applyTheme } from "../theme";

function mockSystemTheme(dark) {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: query.includes("dark") ? dark : !dark,
    media: query,
  }));
}

beforeEach(() => {
  mockSystemTheme(false);
});

describe("theme", () => {
  it("TC-THEME-01: prefers a stored choice over the system setting", () => {
    localStorage.setItem("dsp-theme", "dark");
    expect(getStoredTheme()).toBe("dark");
    expect(preferredTheme()).toBe("dark");
  });

  it("TC-THEME-02: falls back to the system preference", () => {
    expect(preferredTheme()).toBe("light");
    mockSystemTheme(true);
    expect(preferredTheme()).toBe("dark");
  });

  it("TC-THEME-03: ignores unknown stored values", () => {
    localStorage.setItem("dsp-theme", "sepia");
    expect(getStoredTheme()).toBeNull();
  });

  it("TC-THEME-04: applyTheme updates the document and persists the choice", () => {
    expect(applyTheme("dark")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem("dsp-theme")).toBe("dark");
    expect(currentTheme()).toBe("dark");
    applyTheme("light");
    expect(currentTheme()).toBe("light");
  });
});
