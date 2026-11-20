import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CitySolar from "../CitySolar";
import ServiceAreas from "../ServiceAreas";
import { CITIES, CITY_BY_SLUG } from "../../data/cities";

// TC-CITY-* from docs/TEST_CASES.md
function renderCity(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/service-areas/:slug" element={<CitySolar />} />
        <Route path="/service-areas" element={<div>All service areas</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("City landing pages", () => {
  it("TC-CITY-01: ten distinct Maharashtra cities with complete, honest content", () => {
    expect(CITIES).toHaveLength(10);
    expect(new Set(CITIES.map((c) => c.slug)).size).toBe(10);
    expect(new Set(CITIES.map((c) => c.name)).size).toBe(10);
    for (const city of CITIES) {
      expect(city.title.length).toBeGreaterThan(20);
      expect(city.lede.length).toBeGreaterThan(40);
      expect(city.local).toHaveLength(3);
      expect(city.faqs).toHaveLength(3);
      expect(city.nearby).toHaveLength(3);
      for (const slug of city.nearby) {
        expect(CITY_BY_SLUG[slug]).toBeDefined();
        expect(slug).not.toBe(city.slug);
      }
    }
  });

  it("TC-CITY-02: renders the requested city with local context, FAQ and enquiry form", () => {
    renderCity("/service-areas/pune");
    expect(screen.getByRole("heading", { level: 1, name: /rooftop solar in pune/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what matters on a pune roof/i })).toBeInTheDocument();
    expect(screen.getByText(/society approvals/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /questions we hear in pune/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /get a pune site survey/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pimpri-chinchwad/i })).toHaveAttribute("href", "/service-areas/pimpri-chinchwad");
  });

  it("TC-CITY-03: an unknown city slug returns to the service areas page", () => {
    renderCity("/service-areas/not-a-city");
    expect(screen.getByText("All service areas")).toBeInTheDocument();
  });

  it("TC-CITY-04: the service areas page links every city guide", () => {
    render(
      <MemoryRouter initialEntries={["/service-areas"]}>
        <ServiceAreas />
      </MemoryRouter>,
    );
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const city of CITIES) {
      expect(hrefs).toContain(`/service-areas/${city.slug}`);
      expect(screen.getByText(city.name)).toBeInTheDocument();
    }
  });
});
