//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
import { useEffect, useMemo, useState } from "react";
import { getCities, createCity, deleteCity, updateCity } from "../api/cities";

export default function CityTable() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", state: "", population: "" });
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({ name: "", state: "", population: "" });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await getCities();
      setCities(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to fetch cities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalPopulation = useMemo(
    () => cities.reduce((sum, c) => sum + (Number(c.population) || 0), 0),
    [cities]
  );

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setErr("");
    const payload = {
      name: form.name.trim(),
      state: form.state.trim(),
      population: Number(form.population) || 0,
    };
    if (!payload.name || !payload.state) {
      setErr("Name and State are required.");
      return;
    }
    try {
      const created = await createCity(payload);
      setCities((list) => [created, ...list]);
      setForm({ name: "", state: "", population: "" });
    } catch (e) {
      setErr(e.message || "Failed to create city");
    }
  };

  const startEdit = (city) => {
    setEditingId(city.id);
    setEditRow({ name: city.name, state: city.state, population: city.population });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({ name: "", state: "", population: "" });
  };

  const saveEdit = async (id) => {
    setErr("");
    try {
      const updated = await updateCity(id, {
        id,
        name: editRow.name.trim(),
        state: editRow.state.trim(),
        population: Number(editRow.population) || 0,
      });
      setCities((list) => list.map((c) => (c.id === id ? updated : c)));
      cancelEdit();
    } catch (e) {
      setErr(e.message || "Failed to update city");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this city?")) return;
    setErr("");
    try {
      await deleteCity(id);
      setCities((list) => list.filter((c) => c.id !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete city");
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Cities</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        Total cities: {cities.length} · Total population: {totalPopulation.toLocaleString()}
      </p>

      <form onSubmit={onCreate}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "1rem" }}>
        <input name="name" placeholder="City name" value={form.name} onChange={onFormChange} />
        <input name="state" placeholder="State/Province" value={form.state} onChange={onFormChange} />
        <input name="population" type="number" min="0" placeholder="Population" value={form.population} onChange={onFormChange} />
        <button type="submit">Add</button>
      </form>

      {err && <div style={{ color: "crimson", marginBottom: "0.75rem" }}>{err}</div>}
      {loading ? <div>Loading…</div> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#f5f5f5" }}>
                <th style={th}>ID</th>
                <th style={th}>Name</th>
                <th style={th}>State</th>
                <th style={th}>Population</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={td}>{c.id}</td>

                  <td style={td}>
                    {editingId === c.id ? (
                      <input
                        value={editRow.name}
                        onChange={(e) => setEditRow((r) => ({ ...r, name: e.target.value }))}
                      />
                    ) : c.name}
                  </td>

                  <td style={td}>
                    {editingId === c.id ? (
                      <input
                        value={editRow.state}
                        onChange={(e) => setEditRow((r) => ({ ...r, state: e.target.value }))}
                      />
                    ) : c.state}
                  </td>

                  <td style={td}>
                    {editingId === c.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editRow.population}
                        onChange={(e) => setEditRow((r) => ({ ...r, population: e.target.value }))}
                      />
                    ) : Number(c.population).toLocaleString()}
                  </td>

                  <td style={td}>
                    {editingId === c.id ? (
                      <>
                        <button onClick={() => saveEdit(c.id)} style={{ marginRight: 8 }}>Save</button>
                        <button onClick={cancelEdit} type="button">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)} style={{ marginRight: 8 }}>Edit</button>
                        <button onClick={() => onDelete(c.id)} type="button">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!cities.length && (
                <tr>
                  <td colSpan="5" style={{ padding: "1rem", textAlign: "center", color: "#777" }}>
                    No cities yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = { padding: "10px 8px", fontWeight: 600, fontSize: 14 };
const td = { padding: "10px 8px", fontSize: 14 };
