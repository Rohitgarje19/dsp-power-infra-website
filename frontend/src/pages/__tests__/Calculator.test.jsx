import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

// TC-CALC: PIN -> City autofill on the planning tool.
describe("Calculator city autofill", () => {
  it("fills the city from a serviceable PIN", async () => {
    const user = userEvent.setup();
    renderAt();
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    expect(screen.getByLabelText(/^city/i)).toHaveValue("Pune");
  });

  it("prefills the city for a shared link that only has a PIN", () => {
    renderAt("?pincode=412033&billValue=3000");
    expect(screen.getByLabelText(/^city/i)).toHaveValue("Pune");
  });

  it("does not overwrite a city the visitor typed", async () => {
    const user = userEvent.setup();
    renderAt();
    const city = screen.getByLabelText(/^city/i);
    await user.type(city, "Pimpri");
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    expect(city).toHaveValue("Pimpri");
  });

  it("leaves the city empty for a non-serviceable PIN", async () => {
    const user = userEvent.setup();
    renderAt();
    await user.type(screen.getByLabelText(/pin code/i), "400001");
    expect(screen.getByLabelText(/^city/i)).toHaveValue("");
  });
});
