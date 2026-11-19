import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Careers from "../Careers";
import Sitemap from "../Sitemap";
import { CONTACT } from "../../data/content";

// TC-CAREERS-* / TC-SITEMAP-* from docs/TEST_CASES.md
describe("Careers page", () => {
  it("TC-CAREERS-01: applies by email to the real contact address with a careers subject", () => {
    render(
      <MemoryRouter initialEntries={["/careers"]}>
        <Careers />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole("link", { name: /email your cv|dsp\.powerinfra@gmail\.com/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute("href")).toContain(`mailto:${CONTACT.email}`);
      expect(link.getAttribute("href")).toContain("Careers");
    }
    expect(screen.getByRole("heading", { name: /build a career in solar/i })).toBeInTheDocument();
  });

  it("TC-CAREERS-02: does not invent fixed vacancies", () => {
    render(
      <MemoryRouter>
        <Careers />
      </MemoryRouter>,
    );
    expect(screen.getByText(/not a list of fixed vacancies/i)).toBeInTheDocument();
  });
});

describe("Sitemap page", () => {
  it("TC-SITEMAP-01: links every major public route", () => {
    render(
      <MemoryRouter initialEntries={["/sitemap"]}>
        <Sitemap />
      </MemoryRouter>,
    );
    const expected = [
      "/homes", "/housing-societies", "/commercial",
      "/on-grid-solar", "/hybrid-solar", "/off-grid-solar",
      "/solar-calculator", "/subsidy-guide", "/how-it-works", "/book-visit", "/service-areas",
      "/about", "/projects", "/experience-centre", "/webinars", "/solar-partners", "/refer-a-friend", "/careers",
      "/blog", "/contact", "/privacy", "/terms",
    ];
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const path of expected) {
      expect(hrefs).toContain(path);
    }
    expect(hrefs).not.toContain("/admin");
  });
});