//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
import { apiGet, apiJson } from "./Client";

export function getAirports() {
  return apiGet("/airport");
}

export function getAirport(id) {
  return apiGet(`/airport/${id}`);
}

export function createAirport(airport) {
  return apiJson("/airport", "POST", airport);
}

export function updateAirport(id, airport) {
  return apiJson(`/airport/${id}`, "PUT", airport);
}

export async function deleteAirport(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/airport/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DELETE /airport/${id} failed: ${res.status}`);
}
