import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TrackRecord from "../TrackRecord";
import { PM_SURYA_GHAR_METRICS } from "../../data/impact";

describe("PM Surya Ghar track record", () => {
  it("shows every scheme total with its label and as-of date", () => {
    render(<TrackRecord />);
    expect(screen.getByRole("heading", { name: "Our PM Surya Ghar track record." })).toBeVisible();
    for (const metric of PM_SURYA_GHAR_METRICS) {
      expect(screen.getByText(metric.value.toLocaleString("en-IN"))).toBeVisible();
      expect(screen.getByText(metric.label)).toBeVisible();
    }
    expect(screen.getByText(/20 November 2026/)).toBeVisible();
    expect(screen.getByText(/PM Surya Ghar: Muft Bijli Yojana/)).toBeVisible();
  });

  it("uses the approved subsidy count, not the dashboard's redeemed figure", () => {
    render(<TrackRecord />);
    expect(screen.getByText("325")).toBeVisible();
    expect(screen.queryByText("345")).not.toBeInTheDocument();
  });
});
