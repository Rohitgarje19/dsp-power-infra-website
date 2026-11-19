import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import QuoteModal from "../QuoteModal";

function setup(props = {}) {
  const onClose = vi.fn();
  const utils = render(
    <MemoryRouter initialEntries={["/"]}>
      <QuoteModal open onClose={onClose} {...props} />
    </MemoryRouter>,
  );
  return { onClose, ...utils };
}

beforeEach(() => {
  document.body.style.overflow = "";
});

// TC-MODAL-* from docs/TEST_CASES.md
describe("QuoteModal", () => {
  it("TC-MODAL-01: renders nothing when closed", () => {
    render(
      <MemoryRouter>
        <QuoteModal open={false} onClose={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("TC-MODAL-02: open shows an accessible dialog containing the lead form", () => {
    setup();
    const dialog = screen.getByRole("dialog", { name: /get a free solar quote/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request a consultation/i })).toBeInTheDocument();
  });

  it("TC-MODAL-03: Escape calls onClose", () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("TC-MODAL-04: clicking the backdrop closes, clicking inside does not", async () => {
    const user = userEvent.setup();
    const { onClose, container } = setup();
    await user.click(container.querySelector(".quote-modal"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(container.querySelector(".quote-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("TC-MODAL-05: close button calls onClose", async () => {
    const user = userEvent.setup();
    const { onClose } = setup();
    await user.click(screen.getByRole("button", { name: /close quote form/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("TC-MODAL-06: body scroll is locked while open and restored on close", () => {
    const { unmount } = setup();
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("TC-MODAL-07: custom heading and source are passed to the form", () => {
    setup({ heading: "Book your free site visit.", eyebrow: "FREE SITE VISIT" });
    expect(screen.getByRole("heading", { name: /book your free site visit/i })).toBeInTheDocument();
    expect(screen.getByText("FREE SITE VISIT")).toBeInTheDocument();
  });
});