//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
import { useEffect, useState } from "react";
import {
  getAirlines,
  createAirline,
  updateAirline,
  deleteAirline,
} from "../api/airline";

export default function AirlineTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", code: "" });
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({ name: "", code: "" });

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const data = await getAirlines();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load airlines");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim() || !form.code.trim()) {
      setErr("Name and Code are required.");
      return;
    }
    try {
      const created = await createAirline({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
      });
      setRows((prev) => [created, ...prev]);
      setForm({ name: "", code: "" });
    } catch (e) {
      setErr(e.message || "Failed to create airline");
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditRow({ name: row.name, code: row.code });
  };

  const saveEdit = async (id) => {
    setErr("");
    if (!editRow.name.trim() || !editRow.code.trim()) {
      setErr("Name and Code are required.");
      return;
    }
    try {
      const updated = await updateAirline(id, {
        name: editRow.name.trim(),
        code: editRow.code.trim().toUpperCase(),
      });
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch (e) {
      setErr(e.message || "Failed to update airline");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this airline?")) return;
    try {
      await deleteAirline(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete airline");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <h1>Airlines</h1>
      <form onSubmit={onCreate} style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
        <input
          name="name"
          placeholder="Airline Name"
          value={form.name}
          onChange={onFormChange}
        />
        <input
          name="code"
          placeholder="Code (e.g., AC)"
          value={form.code}
          onChange={onFormChange}
        />
        <button type="submit">Add</button>
      </form>

      {err && <div style={{ color: "red", marginBottom: "1rem" }}>{err}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>
                  {editingId === a.id ? (
                    <input
                      value={editRow.name}
                      onChange={(e) =>
                        setEditRow((r) => ({ ...r, name: e.target.value }))
                      }
                    />
                  ) : (
                    a.name
                  )}
                </td>
                <td>
                  {editingId === a.id ? (
                    <input
                      value={editRow.code}
                      onChange={(e) =>
                        setEditRow((r) => ({ ...r, code: e.target.value }))
                      }
                    />
                  ) : (
                    a.code
                  )}
                </td>
                <td>
                  {editingId === a.id ? (
                    <>
                      <button type="button" onClick={() => saveEdit(a.id)}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => startEdit(a)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => onDelete(a.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No airlines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
