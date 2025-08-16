//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
import { useEffect, useMemo, useState } from "react";
import { getAirports, createAirport, updateAirport, deleteAirport } from "../api/airports";
import { getCities } from "../api/cities";

export default function AirportTable() {
  const [airports, setAirports] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [cityId, setCityId] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editCityId, setEditCityId] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [as, cs] = await Promise.all([getAirports(), getCities()]);
        if (!mounted) return;
        setAirports(Array.isArray(as) ? as : []);
        setCities(Array.isArray(cs) ? cs : []);
      } catch (e) {
        setErr(e.message || "Failed to load airports/cities");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !code.trim() || !cityId) {
      setErr("Please provide Name, Code, and City.");
      return;
    }
    const body = {
      name: name.trim(),
      code: code.trim(),
      city: { id: Number(cityId) },
      cityId: Number(cityId),
    };
    try {
      const created = await createAirport(body);
      setAirports((prev) => [created, ...prev]);
      setName("");
      setCode("");
      setCityId("");
    } catch (e) {
      setErr(e.message || "Create failed");
    }
  }

  function startEdit(a) {
    setEditingId(a.id);
    setEditName(a.name || "");
    setEditCode(a.code || "");
    setEditCityId(String(a.city?.id ?? ""));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditCode("");
    setEditCityId("");
  }

  async function saveEdit(id) {
    setErr("");
    if (!editName.trim() || !editCode.trim() || !editCityId) {
      setErr("Please fill all fields to update.");
      return;
    }
    const body = {
      name: editName.trim(),
      code: editCode.trim(),
      city: { id: Number(editCityId) },
      cityId: Number(editCityId),
    };
    try {
      const updated = await updateAirport(id, body);
      setAirports((prev) => prev.map((a) => (a.id === id ? updated : a)));
      cancelEdit();
    } catch (e) {
      setErr(e.message || "Update failed");
    }
  }

  async function onDelete(id) {
    if (!confirm(`Delete airport #${id}?`)) return;
    setErr("");
    try {
      await deleteAirport(id);
      setAirports((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setErr(e.message || "Delete failed (airport might be referenced by flights/gates).");
    }
  }

  if (loading) return <p>Loading airports…</p>;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <h2>Airports</h2>

      {err && (
        <div style={{ background: "#fee", border: "1px solid #f99", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {err}
        </div>
      )}

      <form onSubmit={onCreate} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr auto", alignItems: "end", marginBottom: 16 }}>
        <div>
          <label style={lbl}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="St. John's International" />
        </div>
        <div>
          <label style={lbl}>Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="YYT" />
        </div>
        <div>
          <label style={lbl}>City</label>
          <select value={cityId} onChange={(e) => setCityId(e.target.value)}>
            <option value="">— Select city —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.state ? `(${c.state})` : ""}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" style={btn}>Add</button>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Code</th>
              <th style={th}>City</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {airports.map((a) => {
              const isEditing = editingId === a.id;
              const cityLabel = a.city
                ? `${a.city.name}${a.city.state ? ", " + a.city.state : ""}`
                : "—";
              return (
                <tr key={a.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={td}>{a.id}</td>

                  <td style={td}>
                    {isEditing ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    ) : (
                      a.name
                    )}
                  </td>

                  <td style={td}>
                    {isEditing ? (
                      <input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                    ) : (
                      a.code
                    )}
                  </td>

                  <td style={td}>
                    {isEditing ? (
                      <select value={editCityId} onChange={(e) => setEditCityId(e.target.value)}>
                        <option value="">— Select city —</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.state ? `(${c.state})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      cityLabel
                    )}
                  </td>

                  <td style={td}>
                    {!isEditing ? (
                      <>
                        <button style={btn} onClick={() => startEdit(a)}>Edit</button>{" "}
                        <button style={btn} onClick={() => onDelete(a.id)}>Delete</button>
                      </>
                    ) : (
                      <>
                        <button style={btn} onClick={() => saveEdit(a.id)}>Save</button>{" "}
                        <button style={btn} onClick={cancelEdit}>Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {airports.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 12, textAlign: "center", color: "#777" }}>
                  No airports yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const lbl = { display: "block", fontSize: 12, color: "#555", marginBottom: 4 };
const th = { textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee", fontWeight: 600 };
const td = { padding: "10px 8px" };
const btn = { padding: "6px 10px", borderRadius: 6, cursor: "pointer" };


