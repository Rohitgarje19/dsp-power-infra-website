import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Calculator from "../Calculator";

function renderAt(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/solar-calculator${search}`]}>
      <Calculator />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// TC-CALC-RATE: the DSP rate card drives the calculator cost.
describe("Calculator connection pricing", () => {
  it("switches the system rate with the connection type", async () => {
    const user = userEvent.setup();
    renderAt();
    // Default bill ₹2,500 → 3.0 kW; residential ₹70,000/kW → ₹2,10,000
    expect(screen.getByText("₹2,10,000")).toBeInTheDocument();
    expect(screen.getByLabelText(/system cost/i)).toHaveValue(70000);

    await user.selectOptions(screen.getByLabelText(/connection type/i), "Commercial");
    expect(screen.getByLabelText(/system cost/i)).toHaveValue(35000);
    expect(screen.getByText("₹1,05,000")).toBeInTheDocument(); // 3.0 kW × ₹35,000
  });

  it("keeps a manually adjusted rate and offers a reset", async () => {
    const user = userEvent.setup();
    renderAt();
    await user.click(screen.getByText("Adjust the estimate assumptions"));
    const cost = screen.getByLabelText(/system cost/i);
    await user.clear(cost);
    await user.type(cost, "65000");
    expect(screen.getByRole("button", { name: /reset to dsp rate/i })).toBeInTheDocument();
  });

  it("shows a site-specific proposal preview above 200 kW", () => {
    // 50,000 bill @ ₹1/kWh = 50,000 kWh → 417.0 kW at the default yield
    renderAt("?billValue=50000&tariff=1");
    expect(screen.getAllByText(/417\.0/).length).toBeGreaterThan(0);
    expect(screen.getByText("Site-specific")).toBeInTheDocument();
    expect(screen.getByText(/above 200 kW, so DSP prices it in a site-specific proposal/i)).toBeInTheDocument();
  });
});

// TC-CALC: PIN -> City autofill on the planning tool.
describe("Calculator city autofill", () => {
  it("fills the city from a serviceable PIN", async () => {
    const user = userEvent.setup();
    renderAt();
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    await waitFor(() => expect(screen.getByLabelText(/^city/i)).toHaveValue("Pune"));
  });

  it("prefills the city for a shared link that only has a PIN", async () => {
    renderAt("?pincode=412033&billValue=3000");
    await waitFor(() => expect(screen.getByLabelText(/^city/i)).toHaveValue("Pune"));
  });

  it("resolves any Indian PIN through the backend lookup", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ city: "Latur", state: "Maharashtra" }),
    }));
    const user = userEvent.setup();
    renderAt();
    expect(screen.getByLabelText(/^city/i)).toHaveAttribute("placeholder", "Auto-fills from PIN");
    await user.type(screen.getByLabelText(/pin code/i), "413517");
    await waitFor(() => expect(screen.getByLabelText(/^city/i)).toHaveValue("Latur"), { timeout: 2000 });
    expect(screen.getByText(/Filled from PIN 413517/i)).toBeInTheDocument();
  });

  it("does not overwrite a city the visitor typed", async () => {
    const user = userEvent.setup();
    renderAt();
    const city = screen.getByLabelText(/^city/i);
    await user.type(city, "Pimpri");
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(city).toHaveValue("Pimpri");
  });

  it("leaves the city empty when the lookup fails and the PIN is outside the region", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const user = userEvent.setup();
    renderAt();
    await user.type(screen.getByLabelText(/pin code/i), "452001");
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.getByLabelText(/^city/i)).toHaveValue("");
  });
});
