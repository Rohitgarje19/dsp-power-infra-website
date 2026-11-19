import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
});

// jsdom lacks these; components use them for scroll effects.
window.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
if (!("IntersectionObserver" in window)) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}