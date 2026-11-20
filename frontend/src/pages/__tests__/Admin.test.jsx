import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Admin from "../Admin";

const lead = {
  id: 7,
  fullName: "Asha Patil",
  email: "asha@example.com",
  phone: "9876543210",
  customerType: "Residential",
  city: "Pune",
  pincode: "411046",
  monthlyBill: "3000",
  message: "Rooftop solar for my home",
  source: "contact",
  createdAt: "2026-11-18T10:00:00",
  status: "NEW",
  notes: "",
  deleted: false,
};

function jsonResponse(data, status = 200) {
  return {
    ok: status < 400,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

function pagePayload(items, overrides = {}) {
  return {
    items,
    total: items.length,
    page: 1,
    size: 25,
    counts: {
      active: items.filter((row) => !row.deleted && !row.resolvedAt).length,
      resolved: items.filter((row) => !row.deleted && row.resolvedAt).length,
      deleted: items.filter((row) => row.deleted).length,
    },
    sources: ["contact", "quick-quote"],
    ...overrides,
  };
}

function mockFetch({ rows = [lead], loginStatus = 200, payloadOverrides = {} } = {}) {
  const calls = [];
  const fetchMock = vi.fn(async (url, options = {}) => {
    calls.push({ url, options });
    if (url.startsWith("/api/admin/leads?") && (!options.method || options.method === "GET")) {
      return jsonResponse(pagePayload(rows, payloadOverrides), loginStatus);
    }
    if (url === "/api/admin/leads/bulk" && options.method === "POST") {
      return jsonResponse({ updated: JSON.parse(options.body).ids.length });
    }
    if (/\/api\/admin\/leads\/\d+\/(resolve|restore|delete)$/.test(url)) {
      return jsonResponse({ ...lead, status: "RESOLVED", resolvedAt: "2026-11-20T10:00:00" });
    }
    if (/\/api\/admin\/leads\/\d+\/notes$/.test(url)) {
      return jsonResponse({ ...lead, notes: options.body ? JSON.parse(options.body).notes : "" });
    }
    if (/\/api\/admin\/leads\/\d+$/.test(url) && options.method === "DELETE") {
      return { ok: true, status: 204, json: async () => null, text: async () => "" };
    }
    return jsonResponse({ message: "not mocked" }, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, calls };
}

async function signIn() {
  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "admin" } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "local-dev-admin" } });
  fireEvent.click(screen.getByRole("button", { name: /sign in securely/i }));
  await screen.findByRole("heading", { name: "Enquiry dashboard" });
}

function setup(props) {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Admin {...props} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  document.body.style.overflow = "";
  vi.stubGlobal("confirm", vi.fn(() => true));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// TC-ADMIN-* from docs/TEST_CASES.md (design-fix round)
describe("Admin enquiry desk", () => {
  it("TC-ADMIN-01: login screen has its own page title", () => {
    mockFetch();
    setup();
    expect(document.title).toBe("Enquiry dashboard | DSP Power Infra");
    expect(screen.getByRole("button", { name: /sign in securely/i })).toBeInTheDocument();
  });

  it("TC-ADMIN-02: rejected credentials show a clear error", async () => {
    mockFetch({ loginStatus: 401 });
    setup();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in securely/i }));
    expect(await screen.findByText(/username or password was not accepted/i)).toBeInTheDocument();
  });

  it("TC-ADMIN-03: signing in loads enquiries with Basic auth", async () => {
    const { calls } = mockFetch();
    setup();
    await signIn();
    expect(screen.getByText("Enquiry dashboard")).toBeInTheDocument();
    const loginCall = calls.find((c) => c.url.startsWith("/api/admin/leads?"));
    expect(loginCall.options.headers.Authorization).toMatch(/^Basic /);
  });

  it("TC-ADMIN-04: detail modal opens, locks scroll, and Escape closes it", async () => {
    mockFetch();
    setup();
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: "Asha Patil" }));
    const dialog = await screen.findByRole("dialog", { name: /enquiry details/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe("");
  });

  it("TC-ADMIN-05: Tab stays contained inside the detail modal", async () => {
    mockFetch();
    const { container } = setup();
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: "Asha Patil" }));
    const dialog = await screen.findByRole("dialog", { name: /enquiry details/i });
    const focusables = [...dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea')]
      .filter((el) => el.getAttribute("aria-hidden") !== "true" && el.tabIndex !== -1);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    expect(container.contains(document.activeElement)).toBe(true);
  });

  it("TC-ADMIN-06: lifecycle actions are available inside the detail modal", async () => {
    const { fetchMock } = mockFetch();
    setup();
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: "Asha Patil" }));
    await screen.findByRole("dialog", { name: /enquiry details/i });
    const resolve = screen.getByRole("button", { name: /mark resolved/i });
    expect(screen.getByRole("button", { name: /move to deleted/i })).toBeInTheDocument();
    fireEvent.click(resolve);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/admin/leads/7/resolve", expect.objectContaining({ method: "PUT" })),
    );
    // Let the leave-animation + refresh flow finish before unmount.
    await act(async () => { await new Promise((r) => setTimeout(r, 1000)); });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("TC-ADMIN-07: deleted records offer restore and permanent delete in the modal", async () => {
    mockFetch({ rows: [{ ...lead, deleted: true, deletedAt: "2026-11-19T10:00:00" }] });
    setup();
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: /deleted/i }));
    fireEvent.click(screen.getByRole("button", { name: "Asha Patil" }));
    const dialog = await screen.findByRole("dialog", { name: /enquiry details/i });
    expect(within(dialog).getByRole("button", { name: /restore enquiry/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /delete permanently/i })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /mark resolved/i })).not.toBeInTheDocument();
  });

  it("TC-ADMIN-08: search, source and date filters run server-side", async () => {
    const { calls } = mockFetch();
    setup();
    await signIn();

    fireEvent.change(screen.getByLabelText(/filter by source/i), { target: { value: "contact" } });
    await waitFor(() => expect(calls.some((c) => c.url.includes("source=contact"))).toBe(true));

    fireEvent.change(screen.getByLabelText(/received from date/i), { target: { value: "2026-11-01" } });
    await waitFor(() => expect(calls.some((c) => c.url.includes("from=2026-11-01") && c.url.includes("source=contact"))).toBe(true));

    fireEvent.change(screen.getByLabelText(/search enquiries/i), { target: { value: "asha" } });
    await waitFor(() => expect(calls.some((c) => c.url.includes("q=asha"))).toBe(true), { timeout: 2000 });

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    await waitFor(() => expect(calls.some((c) => !c.url.includes("source=") && !c.url.includes("q=asha"))).toBe(true));
  });

  it("TC-ADMIN-09: pagination asks the server for the next page", async () => {
    const { calls } = mockFetch({ payloadOverrides: { total: 60 } });
    setup();
    await signIn();
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    await waitFor(() => expect(calls.some((c) => c.url.includes("page=2"))).toBe(true));
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
  });

  it("TC-ADMIN-10: bulk resolve posts the selected ids", async () => {
    const { calls } = mockFetch();
    setup();
    await signIn();
    fireEvent.click(screen.getByRole("checkbox", { name: /select asha patil/i }));
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /resolve selected/i }));
    await waitFor(() => expect(calls.some((c) => c.url === "/api/admin/leads/bulk" && c.options.method === "POST")).toBe(true));
    const bulk = calls.find((c) => c.url === "/api/admin/leads/bulk");
    expect(JSON.parse(bulk.options.body)).toEqual({ ids: [7], action: "resolve" });
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/1 enquiry resolved/i));
  });

  it("TC-ADMIN-11: too many failed sign-ins shows a clear throttle message", async () => {
    mockFetch({ loginStatus: 429 });
    setup();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in securely/i }));
    expect(await screen.findByText(/too many failed sign-in attempts/i)).toBeInTheDocument();
  });
});