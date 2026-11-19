import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Faq from "../Faq";

const ITEMS = [
  { q: "How long does installation take?", a: "Typically a few days on site after approvals." },
  { q: "Do you handle the subsidy paperwork?", a: "Yes, we guide every portal step." },
];

describe("Faq accordion", () => {
  it("opens the first item by default and toggles on click", async () => {
    const user = userEvent.setup();
    render(<Faq items={ITEMS} />);
    const first = screen.getByRole("button", { name: ITEMS[0].q });
    const second = screen.getByRole("button", { name: ITEMS[1].q });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(ITEMS[0].a)).toBeVisible();

    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");

    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "false");
  });
});