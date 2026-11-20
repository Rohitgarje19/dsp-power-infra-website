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
      json: async () => ({ city: "Mumbai", state: "Maharashtra" }),
    }));
    const user = userEvent.setup();
    renderAt();
    await user.type(screen.getByLabelText(/pin code/i), "400001");
    await waitFor(() => expect(screen.getByLabelText(/^city/i)).toHaveValue("Mumbai"), { timeout: 2000 });
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
