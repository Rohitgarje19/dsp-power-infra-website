import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LeadForm from "../LeadForm";
import { postLead, ApiError } from "../../lib/api";

vi.mock("../../lib/api", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, postLead: vi.fn() };
});

function setup(props = {}) {
  return render(
    <MemoryRouter initialEntries={["/homes"]}>
      <LeadForm source="test-source" {...props} />
    </MemoryRouter>,
  );
}

async function fillValid(user, { name = "Asha Kulkarni", phone = "9876543210", city = "Pune", pin = "411046" } = {}) {
  await user.type(screen.getByLabelText(/full name/i), name);
  await user.type(screen.getByLabelText(/^phone/i), phone);
  await user.type(screen.getByLabelText(/^city/i), city);
  await user.type(screen.getByLabelText(/pin code/i), pin);
  await user.click(screen.getByRole("checkbox"));
}

beforeEach(() => {
  postLead.mockReset();
});

// TC-FORM-* from docs/TEST_CASES.md
describe("LeadForm", () => {
  it("TC-FORM-01: happy path posts the lead and shows success", async () => {
    postLead.mockResolvedValue({ id: 1 });
    const user = userEvent.setup();
    setup();
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /request a consultation/i }));
    await waitFor(() => expect(screen.getByText(/thanks, we have your enquiry/i)).toBeInTheDocument());
    expect(postLead).toHaveBeenCalledTimes(1);
    const payload = postLead.mock.calls[0][0];
    expect(payload).toMatchObject({
      fullName: "Asha Kulkarni",
      phone: "9876543210",
      city: "Pune",
      pincode: "411046",
      source: "test-source",
      sourcePage: "/homes",
      website: "",
      email: null,
      monthlyBill: null,
    });
  });

  it("TC-FORM-02: serviceable PIN shows a positive note while typing", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    expect(screen.getByText(/core service region/i)).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/pin code/i));
    await user.type(screen.getByLabelText(/pin code/i), "400001");
    expect(screen.getByText(/haven't confirmed service/i)).toBeInTheDocument();
  });

  it("TC-FORM-11: a serviceable PIN autofills the city", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    await waitFor(() => expect(screen.getByLabelText(/^city/i)).toHaveValue("Pune"));
  });

  it("TC-FORM-12: outside the region the city is only filled when the lookup answers", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/pin code/i), "400001");
    // No backend in this test, so the lookup is unavailable and the field stays empty.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.getByLabelText(/^city/i)).toHaveValue("");
  });

  it("TC-FORM-13: a manually typed city is never overwritten by the PIN hint", async () => {
    const user = userEvent.setup();
    setup();
    const city = screen.getByLabelText(/^city/i);
    await user.type(city, "Pimpri");
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    expect(city).toHaveValue("Pimpri");
    // Clearing it and trying again must also respect the visitor's choice.
    await user.clear(city);
    await user.clear(screen.getByLabelText(/pin code/i));
    await user.type(screen.getByLabelText(/pin code/i), "412033");
    expect(city).toHaveValue("");
  });

  it("submits the autofilled city with the lead", async () => {
    postLead.mockResolvedValue({ id: 2 });
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/full name/i), "Asha Kulkarni");
    await user.type(screen.getByLabelText(/^phone/i), "9876543210");
    await user.type(screen.getByLabelText(/pin code/i), "411046");
    await waitFor(() => expect(screen.getByLabelText(/^city/i)).toHaveValue("Pune"));
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /request a consultation/i }));
    await waitFor(() => expect(screen.getByText(/thanks, we have your enquiry/i)).toBeInTheDocument());
    expect(postLead.mock.calls[0][0]).toMatchObject({ city: "Pune", pincode: "411046" });
  });

  it("TC-FORM-03: 422 shows field errors and keeps entered data", async () => {
    postLead.mockRejectedValue(new ApiError(422, { errors: [{ field: "phone", message: "Phone must be 10–20 digits." }] }));
    const user = userEvent.setup();
    setup();
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /request a consultation/i }));
    await waitFor(() => expect(screen.getAllByText("Phone must be 10–20 digits.").length).toBeGreaterThan(0));
    expect(document.querySelector("small.field-error")).toHaveTextContent("Phone must be 10–20 digits.");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Asha Kulkarni");
    expect(screen.queryByText(/thanks, we have your enquiry/i)).not.toBeInTheDocument();
  });

  it("TC-FORM-04: network failure tells the user the enquiry was NOT saved", async () => {
    postLead.mockRejectedValue(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    setup();
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /request a consultation/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/NOT saved/));
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Asha Kulkarni");
  });

  it("TC-FORM-08: double-click submits only once", async () => {
    let resolve;
    postLead.mockReturnValue(new Promise((r) => { resolve = r; }));
    const user = userEvent.setup();
    setup();
    await fillValid(user);
    const button = screen.getByRole("button", { name: /request a consultation/i });
    await user.click(button);
    fireEvent.click(button); // second click while sending
    expect(postLead).toHaveBeenCalledTimes(1);
    resolve({ id: 1 });
    await waitFor(() => expect(screen.getByText(/thanks, we have your enquiry/i)).toBeInTheDocument());
  });

  it("TC-FORM-09: honeypot value is passed through for the backend to drop", async () => {
    postLead.mockResolvedValue({ id: 2 });
    const user = userEvent.setup();
    const { container } = setup();
    await fillValid(user);
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    fireEvent.change(honeypot, { target: { value: "http://spam.example" } });
    await user.click(screen.getByRole("button", { name: /request a consultation/i }));
    await waitFor(() => expect(postLead).toHaveBeenCalled());
    expect(postLead.mock.calls[0][0].website).toBe("http://spam.example");
  });

  it("TC-FORM-10: defaults prefill and custom source are used", async () => {
    postLead.mockResolvedValue({ id: 3 });
    const user = userEvent.setup();
    setup({ source: "calculator", defaults: { pincode: "411046", city: "Pune", monthlyBill: "3000", customerType: "Commercial" } });
    expect(screen.getByLabelText(/^city/i)).toHaveValue("Pune");
    expect(screen.getByLabelText(/pin code/i)).toHaveValue("411046");
    await user.type(screen.getByLabelText(/full name/i), "Ravi");
    await user.type(screen.getByLabelText(/^phone/i), "9876543210");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /request a consultation/i }));
    await waitFor(() => expect(postLead).toHaveBeenCalled());
    expect(postLead.mock.calls[0][0]).toMatchObject({ source: "calculator", customerType: "Commercial", monthlyBill: 3000, pincode: "411046" });
  });

  it("consent links point at the legal pages", () => {
    setup();
    expect(screen.getByRole("link", { name: /terms of use/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  });
});