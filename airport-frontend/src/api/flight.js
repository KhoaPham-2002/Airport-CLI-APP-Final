//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
import { apiGet, apiJson } from "./Client";

const BASE = "/api/flights";

export function getFlights() {
  return apiGet(BASE);
}

export function getFlight(id) {
  return apiGet(`${BASE}/${id}`);
}

export function getFlightByNumber(flightNumber) {
  return apiGet(`${BASE}/number/${encodeURIComponent(flightNumber)}`);
}

export function getFlightsBetween(startISO, endISO) {
  // startISO / endISO like "2025-08-15T10:00"
  const params = new URLSearchParams({ start: startISO, end: endISO });
  return apiGet(`${BASE}/between?${params.toString()}`);
}

export function createFlight(payload) {
  return apiJson(BASE, "POST", payload);
}

export function updateFlight(id, payload) {
  return apiJson(`${BASE}/${id}`, "PUT", payload);
}

export async function deleteFlight(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete flight: ${res.status}`);
}
