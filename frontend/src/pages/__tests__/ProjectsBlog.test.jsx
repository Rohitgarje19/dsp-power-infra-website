import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Projects from "../Projects";
import Blog from "../Blog";
import { BLOG_ARTICLES } from "../../data/blog";
import { PROJECT_GALLERY, PROJECT_TAGS } from "../../data/projects";

// TC-CONTENT-* from docs/TEST_CASES.md
describe("Blog content", () => {
  it("TC-CONTENT-01: six claim-safe articles with unique slugs and full bodies", () => {
    expect(BLOG_ARTICLES).toHaveLength(6);
    expect(new Set(BLOG_ARTICLES.map((a) => a.slug)).size).toBe(6);
    for (const article of BLOG_ARTICLES) {
      expect(article.body.length).toBeGreaterThanOrEqual(4);
      expect(article.excerpt.length).toBeGreaterThan(40);
      expect(Number.isNaN(new Date(article.date).getTime())).toBe(false);
      for (const [, text] of article.body) expect(text).not.toMatch(/we guarantee|guaranteed (savings|returns|payback)|best in (india|pune|maharashtra)/i);
    }
  });

  it("TC-CONTENT-02: blog index lists all six guides with links", () => {
    render(
      <MemoryRouter initialEntries={["/blog"]}>
        <Blog />
      </MemoryRouter>,
    );
    for (const article of BLOG_ARTICLES) {
      expect(screen.getByRole("link", { name: new RegExp(article.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") })).toBeInTheDocument();
    }
  });
});

describe("Projects gallery", () => {
  it("TC-CONTENT-03: gallery is labelled representative and filters by project type", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]}>
        <Projects />
      </MemoryRouter>,
    );
    expect(screen.getByText(/representative imagery — not claimed DSP installations/i)).toBeInTheDocument();
    expect(screen.getAllByRole("figure")).toHaveLength(PROJECT_GALLERY.length);

    const commercial = screen.getByRole("button", { name: /^commercial/i });
    expect(commercial).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(commercial);
    expect(commercial).toHaveAttribute("aria-pressed", "true");
    const expected = PROJECT_GALLERY.filter((p) => p.tag === "Commercial").length;
    expect(screen.getAllByRole("figure")).toHaveLength(expected);

    fireEvent.click(screen.getByRole("button", { name: /^all/i }));
    expect(screen.getAllByRole("figure")).toHaveLength(PROJECT_GALLERY.length);
    expect(PROJECT_TAGS.every((tag) => PROJECT_GALLERY.some((p) => p.tag === tag))).toBe(true);
  });
});
