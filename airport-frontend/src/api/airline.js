import { apiGet, apiJson } from "./Client";

const BASE = "/api/airlines";

export function getAirlines() {
  return apiGet(BASE);
}

export function getAirline(id) {
  return apiGet(`${BASE}/${id}`);
}

export function getAirlineByCode(code) {
  return apiGet(`${BASE}/code/${encodeURIComponent(code)}`);
}

export function createAirline(payload) {
  return apiJson(BASE, "POST", payload);
}

export function updateAirline(id, payload) {
  return apiJson(`${BASE}/${id}`, "PUT", payload);
}

export async function deleteAirline(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete airline: ${res.status}`);
}
