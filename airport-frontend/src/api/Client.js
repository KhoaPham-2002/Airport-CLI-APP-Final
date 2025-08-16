//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiJson(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.json();
}
