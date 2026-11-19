// Typed fetch wrapper + human-readable error mapping.

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.detail || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function api(path, { method = "GET", body, auth, headers } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(auth ? { Authorization: auth } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new TypeError("Failed to fetch");
  }
  if (!response.ok) {
    let parsed = null;
    try { parsed = await response.json(); } catch { /* non-JSON error body */ }
    throw new ApiError(response.status, parsed);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400: return "Some details look incorrect. Please review and try again.";
      case 401: return "Please sign in to continue.";
      case 403: return "You don't have permission to do this.";
      case 404: return "The record you're looking for doesn't exist.";
      case 422: {
        const fields = error.body?.errors;
        if (Array.isArray(fields) && fields.length) {
          return fields.map((f) => f.message).join(" ");
        }
        return "Please check the highlighted fields and try again.";
      }
      case 429: return "Too many requests. Please wait a minute and try again.";
      default: return "Something went wrong on our side. Please try again.";
    }
  }
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Could not reach the lead service. Your enquiry was NOT saved — check that the backend and database are running, then try again.";
  }
  return "An unexpected error occurred. Please try again.";
}

/** Field-level errors from a 422 response, keyed by field name. */
export function fieldErrors(error) {
  if (error instanceof ApiError && error.status === 422 && Array.isArray(error.body?.errors)) {
    const map = {};
    for (const f of error.body.errors) if (f.field) map[f.field] = f.message;
    return map;
  }
  return {};
}

export function postLead(payload) {
  return api("/api/leads", { method: "POST", body: payload });
}

export function checkServiceability(pincode) {
  return api(`/api/serviceability/${pincode}`);
}