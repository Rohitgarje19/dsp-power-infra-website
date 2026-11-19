import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BookVisit from "../BookVisit";
import { postLead } from "../../lib/api";

vi.mock("../../lib/api", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, postLead: vi.fn() };
});

function setup() {
  return render(
    <MemoryRouter initialEntries={["/book-visit"]}>
      <BookVisit />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  postLead.mockReset();
});

// TC-VISIT-* from docs/TEST_CASES.md
describe("BookVisit page", () => {
  it("TC-VISIT-01: renders the survey pitch and booking form with prefilled intent", () => {
    setup();
    expect(screen.getByRole("heading", { name: /book a free visit/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /book your free site visit/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/project details/i)).toHaveValue(
      "I'd like to book a free site survey. Preferred days/times: ",
    );
  });

  it("TC-VISIT-02: submitting posts a lead with source free-visit and the page path", async () => {
    postLead.mockResolvedValue({ id: 1 });
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/full name/i), "Asha Kulkarni");
    await user.type(screen.getByLabelText(/^phone/i), "9876543210");
    await user.type(screen.getByLabelText(/^city/i), "Pune");
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /request a consultation/i }));
    await waitFor(() => expect(postLead).toHaveBeenCalledTimes(1));
    expect(postLead.mock.calls[0][0]).toMatchObject({
      source: "free-visit",
      sourcePage: "/book-visit",
      message: "I'd like to book a free site survey. Preferred days/times: ",
    });
    await waitFor(() => expect(screen.getByText(/thanks, we have your enquiry/i)).toBeInTheDocument());
  });
});