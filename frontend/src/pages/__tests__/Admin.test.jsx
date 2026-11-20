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

const notifySeed = {
  items: [
    { id: 1, email: "owner@example.com", label: "Owner", active: true, createdAt: "2026-11-20T09:00:00" },
    { id: 2, email: "sales@example.com", label: null, active: false, createdAt: "2026-11-20T09:05:00" },
  ],
  notificationsEnabled: false,
  smtpConfigured: false,
  fallbackRecipient: null,
  maxRecipients: 20,
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

function mockFetch({
  rows = [lead],
  loginStatus = 200,
  payloadOverrides = {},
  notify = notifySeed,
  addRecipientResponse = null,
} = {}) {
  const calls = [];
  const fetchMock = vi.fn(async (url, options = {}) => {
    calls.push({ url, options });
    if (url === "/api/admin/notification-recipients" && (!options.method || options.method === "GET")) {
      return jsonResponse(notify);
    }
    if (url === "/api/admin/notification-recipients" && options.method === "POST") {
      if (addRecipientResponse) return jsonResponse(addRecipientResponse.body, addRecipientResponse.status);
      const body = JSON.parse(options.body);
      return jsonResponse({
        id: 99,
        email: String(body.email).trim().toLowerCase(),
        label: body.label,
        active: true,
        createdAt: "2026-11-20T12:00:00",
      }, 201);
    }
    if (url === "/api/admin/notification-recipients/test" && options.method === "POST") {
      return jsonResponse({ sent: 2, message: "Test email sent to 2 addresses." });
    }
    if (/\/api\/admin\/notification-recipients\/\d+$/.test(url)) {
      if (options.method === "PATCH") {
        const found = notify.items.find((item) => url.endsWith(`/${item.id}`));
        return jsonResponse({ ...found, active: JSON.parse(options.body).active });
      }
      if (options.method === "DELETE") {
        return { ok: true, status: 204, json: async () => null, text: async () => "" };
      }
    }
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
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "local-dev-admin" } });
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
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
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
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in securely/i }));
    expect(await screen.findByText(/too many failed sign-in attempts/i)).toBeInTheDocument();
  });

  it("TC-ADMIN-12: password reveal toggle switches the input type", () => {
    mockFetch();
    setup();
    const field = screen.getByLabelText("Password");
    expect(field).toHaveAttribute("type", "password");
    const show = screen.getByRole("button", { name: /show password/i });
    expect(show).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(show);
    expect(field).toHaveAttribute("type", "text");
    const hide = screen.getByRole("button", { name: /hide password/i });
    expect(hide).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(hide);
    expect(field).toHaveAttribute("type", "password");
  });
});

describe("Admin email recipients", () => {
  async function openRecipients() {
    setup();
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: /email recipients/i }));
    await screen.findByText(/email alerts are not switched on yet|email alerts are on/i);
  }

  it("TC-NOTIFY-01: lists inboxes and explains when mail is off", async () => {
    mockFetch();
    await openRecipients();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("sales@example.com")).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send test email/i })).toBeDisabled();
  });

  it("TC-NOTIFY-02: adds a Gmail address for new enquiries", async () => {
    const { calls } = mockFetch();
    await openRecipients();
    fireEvent.change(screen.getByLabelText(/^email address$/i), { target: { value: "Rohit@Example.com" } });
    fireEvent.change(screen.getByLabelText(/who is this/i), { target: { value: "Rohit — sales" } });
    fireEvent.click(screen.getByRole("button", { name: /add recipient/i }));
    await waitFor(() => expect(calls.some((call) => call.url === "/api/admin/notification-recipients" && call.options.method === "POST")).toBe(true));
    const post = calls.find((call) => call.url === "/api/admin/notification-recipients" && call.options.method === "POST");
    expect(JSON.parse(post.options.body)).toEqual({ email: "Rohit@Example.com", label: "Rohit — sales" });
    expect(await screen.findByText("rohit@example.com")).toBeInTheDocument();
    expect(screen.getByText(/will get an email for every new enquiry/i)).toBeInTheDocument();
  });

  it("TC-NOTIFY-03: a duplicate address shows the server explanation", async () => {
    mockFetch({
      addRecipientResponse: {
        status: 422,
        body: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          errors: [{ field: "email", message: "this address is already on the list" }],
        },
      },
    });
    await openRecipients();
    fireEvent.change(screen.getByLabelText(/^email address$/i), { target: { value: "owner@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /add recipient/i }));
    expect(await screen.findByText(/already on the list/i)).toBeInTheDocument();
  });

  it("TC-NOTIFY-04: pausing an inbox updates it in place", async () => {
    const { calls } = mockFetch();
    await openRecipients();
    fireEvent.click(screen.getByRole("button", { name: /^pause$/i }));
    await waitFor(() => expect(calls.some((call) => call.url === "/api/admin/notification-recipients/1")).toBe(true));
    const patch = calls.find((call) => call.url === "/api/admin/notification-recipients/1");
    expect(JSON.parse(patch.options.body)).toEqual({ active: false });
    expect(await screen.findByText(/will stop receiving new enquiry emails/i)).toBeInTheDocument();
    expect(screen.getAllByText("Paused")).toHaveLength(2);
  });

  it("TC-NOTIFY-05: removing an inbox asks first and drops the row", async () => {
    const { calls } = mockFetch();
    await openRecipients();
    fireEvent.click(screen.getByRole("button", { name: /remove sales@example.com/i }));
    await waitFor(() => expect(calls.some((call) => call.url === "/api/admin/notification-recipients/2" && call.options.method === "DELETE")).toBe(true));
    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText("sales@example.com")).not.toBeInTheDocument());
  });

  it("TC-NOTIFY-06: a test email reports delivery when mail is on", async () => {
    mockFetch({ notify: { ...notifySeed, notificationsEnabled: true, smtpConfigured: true } });
    setup();
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: /email recipients/i }));
    await screen.findByText(/email alerts are on/i);
    fireEvent.click(screen.getByRole("button", { name: /send test email/i }));
    expect(await screen.findByText(/test email sent to 2 addresses/i)).toBeInTheDocument();
  });
});