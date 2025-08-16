//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
import { apiGet, apiJson } from "./Client";

const BASE = "/api/gates";

export function getGates() {
  return apiGet(`${BASE}`);
}

export function getGate(id) {
  return apiGet(`${BASE}/${id}`);
}

export function getGatesByAirport(airportId) {
  return apiGet(`${BASE}/airport/${airportId}`);
}

export function getGatesByAirportAndType(airportId, isDepartureGate) {
  // isDepartureGate is boolean
  return apiGet(`${BASE}/airport/${airportId}/type?isDepartureGate=${isDepartureGate}`);
}

export function createGate(gate) {
  return apiJson(`${BASE}`, "POST", gate);
}

export function updateGate(id, gate) {
  return apiJson(`${BASE}/${id}`, "PUT", gate);
}

export async function deleteGate(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DELETE ${BASE}/${id} failed: ${res.status}`);
}
