"use client";

/**
 * Thin fetch wrapper for the admin API. Throws standardized errors and
 * returns the `data` payload from the { ok, data } envelope.
 */
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });

  let json;
  try {
    json = await res.json();
  } catch {
    json = { ok: false, error: { message: "Unexpected server response." } };
  }

  if (!res.ok || !json.ok) {
    const error = new Error(json?.error?.message || "Request failed.");
    error.code = json?.error?.code;
    error.issues = json?.error?.issues;
    error.status = res.status;
    throw error;
  }
  return json.data;
}

export const apiPost = (path, body) => api(path, { method: "POST", body });
export const apiPut = (path, body) => api(path, { method: "PUT", body });
export const apiPatch = (path, body) => api(path, { method: "PATCH", body });
export const apiDelete = (path) => api(path, { method: "DELETE" });