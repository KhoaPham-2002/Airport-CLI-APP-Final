import { apiGet, apiJson } from "./Client";

const BASE = "/api/aircraft";

export function getAircraft() {
  return apiGet(BASE);
}

export function getOneAircraft(id) {
  return apiGet(`${BASE}/${id}`);
}

export function createAircraft(payload) {
  return apiJson(BASE, "POST", payload);
}

export function assignAirport(aircraftId, airportId) {
  return apiJson(`${BASE}/${aircraftId}/airport/${airportId}`, "PUT");
}

export async function deleteAircraft(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DELETE ${BASE}/${id} failed: ${res.status}`);
}
