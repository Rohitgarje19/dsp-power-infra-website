import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header";

function setup() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Header />
    </MemoryRouter>,
  );
}

// TC-NAV-* from docs/TEST_CASES.md
describe("Header", () => {
  it("TC-NAV-01: Get free quote opens the quote modal in place", async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /get free quote/i }));
    expect(screen.getByRole("dialog", { name: /get a free solar quote/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it("TC-NAV-02: Escape closes the quote modal from the header", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /get free quote/i }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("TC-NAV-03: mobile menu toggle still works and closes on navigation", async () => {
    const user = userEvent.setup();
    setup();
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("link", { name: /^homes$/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});