import { apiGet, apiJson } from "./Client";

export function getCities() {
  return apiGet("/city");
}

export function getCity(id) {
  return apiGet(`/city/${id}`);
}

export function createCity(city) {
  return apiJson("/city", "POST", city);
}

export function updateCity(id, city) {
  return apiJson(`/city/${id}`, "PUT", city);
}

export async function deleteCity(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/city/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DELETE /city/${id} failed: ${res.status}`);
}
