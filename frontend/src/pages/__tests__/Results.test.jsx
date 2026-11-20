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
    // 2400/8 = 300 kWh → 2.5 kW → ₹1,75,000 gross at the ₹70,000/kW residential rate; subsidy 2.5 kW → ₹69,000
    expect(screen.getAllByText("2.5 kW").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹1,75,000").length).toBeGreaterThan(0);
    expect(screen.getByText("₹69,000")).toBeInTheDocument();
    expect(screen.getByText("₹1,06,000")).toBeInTheDocument(); // net
    expect(screen.getByText(/About 3\.7 years/)).toBeInTheDocument(); // 106000/28800
    expect(screen.getByText(/Pune · 411046/)).toBeInTheDocument();
  });

  it("carries the estimate into the contact CTA link", () => {
    renderAt("?billValue=2400&pincode=411046&city=Pune");
    const cta = screen.getByRole("link", { name: /discuss this estimate/i });
    expect(cta.getAttribute("href")).toContain("pincode=411046");
    expect(cta.getAttribute("href")).toContain("source=calculator");
    expect(cta.getAttribute("href")).toContain("billValue=2400");
    expect(cta.getAttribute("href")).toContain("customerType=Residential");
    expect(cta.getAttribute("href")).toContain("systemKw=2.5");
    expect(cta.getAttribute("href")).toContain("estimateCost=175000");
  });

  it("uses the commercial rate and shows the non-eligible message", () => {
    renderAt("?billValue=2400&customerType=Commercial");
    expect(screen.getAllByText("₹87,500").length).toBeGreaterThan(0); // 2.5 kW × ₹35,000
    expect(screen.queryByText("₹69,000")).not.toBeInTheDocument();
    expect(screen.getByText(/does not apply to commercial projects/i)).toBeInTheDocument();
    expect(screen.getAllByText(/₹35,000\/kW/).length).toBeGreaterThan(0);
  });

  it("adds the height surcharge above 20 m", () => {
    renderAt("?billValue=2400&height=22");
    // 2.5 kW × ₹70,000 = ₹1,75,000 + 2 m × ₹1,000 = ₹1,77,000
    expect(screen.getAllByText("₹1,77,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹2,000/).length).toBeGreaterThan(0);
  });

  it("falls back to defaults when params are missing", () => {
    renderAt("");
    expect(screen.getByText(/your location/)).toBeInTheDocument();
    expect(screen.getAllByText(/kW/).length).toBeGreaterThan(0);
  });
});
