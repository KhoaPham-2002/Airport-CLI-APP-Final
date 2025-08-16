//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
import { apiGet, apiJson } from "./Client";

export function getPassengers() {
  return apiGet("/passenger");
}

export function getPassenger(id) {
  return apiGet(`/passenger/${id}`);
}

export function createPassenger(passenger) {
  return apiJson("/passenger", "POST", passenger);
}

export function updatePassenger(id, passenger) {
  return apiJson(`/passenger/${id}`, "PUT", passenger);
}

export async function deletePassenger(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/passenger/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DELETE /passenger/${id} failed: ${res.status}`);
}
