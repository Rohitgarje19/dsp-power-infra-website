import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Results from "../Results";

function renderAt(search) {
  return render(
    <MemoryRouter initialEntries={[`/solar-calculator/results${search}`]}>
      <Results />
    </MemoryRouter>,
  );
}

// TC-CALC / TC-SUB integration: results page renders the same math the libs test.
describe("Results page", () => {
  it("renders size, cost and subsidy math from shareable query params", () => {
    renderAt("?billValue=2400&pincode=411046&city=Pune");
    // 2400/8 = 300 kWh → 2.5 kW → ₹1,50,000 gross; subsidy 2.5 kW → ₹69,000
    expect(screen.getByText("2.5 kW")).toBeInTheDocument();
    expect(screen.getAllByText("₹1,50,000").length).toBeGreaterThan(0);
    expect(screen.getByText("₹69,000")).toBeInTheDocument();
    expect(screen.getByText("₹81,000")).toBeInTheDocument(); // net
    expect(screen.getByText(/About 2\.8 years/)).toBeInTheDocument(); // 81000/28800
    expect(screen.getByText(/Pune · 411046/)).toBeInTheDocument();
  });

  it("carries the estimate into the contact CTA link", () => {
    renderAt("?billValue=2400&pincode=411046&city=Pune");
    const cta = screen.getByRole("link", { name: /discuss this estimate/i });
    expect(cta.getAttribute("href")).toContain("pincode=411046");
    expect(cta.getAttribute("href")).toContain("source=calculator");
    expect(cta.getAttribute("href")).toContain("billValue=2400");
  });

  it("shows the non-eligible message for commercial projects", () => {
    renderAt("?billValue=2400&customerType=Commercial");
    expect(screen.getByText(/does not apply to commercial projects/i)).toBeInTheDocument();
    expect(screen.queryByText("₹69,000")).not.toBeInTheDocument();
  });

  it("falls back to defaults when params are missing", () => {
    renderAt("");
    expect(screen.getByText(/your location/)).toBeInTheDocument();
    expect(screen.getAllByText(/kW/).length).toBeGreaterThan(0);
  });
});