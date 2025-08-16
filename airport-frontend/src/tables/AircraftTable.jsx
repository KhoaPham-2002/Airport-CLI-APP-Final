//Name: Khoa Pham
//Project: Final Sprint (Airport-CLI-App)
//Date: 08/15/2025
import { useEffect, useState } from "react";
import { getAircraft, createAircraft, assignAirport, deleteAircraft } from "../api/aircraft";

export default function AircraftTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    type: "",
    numberOfPassengers: "",
  });

  const [assignForm, setAssignForm] = useState({
    aircraftId: "",
    airportId: "",
  });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await getAircraft();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to fetch aircraft");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.type.trim()) return setErr("Type is required.");

    try {
      const created = await createAircraft({
        type: form.type.trim(),
        numberOfPassengers: Number(form.numberOfPassengers) || 0,
      });
      setRows((list) => [created, ...list]);
      setForm({ type: "", numberOfPassengers: "" });
    } catch (e) {
      setErr(e.message || "Failed to create aircraft");
    }
  };

  const onAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignForm((f) => ({ ...f, [name]: value }));
  };

  const onAssign = async (e) => {
    e.preventDefault();
    try {
      await assignAirport(assignForm.aircraftId, assignForm.airportId);
      setAssignForm({ aircraftId: "", airportId: "" });
      load();
    } catch (e) {
      setErr(e.message || "Failed to assign airport");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this aircraft?")) return;
    try {
      await deleteAircraft(id);
      setRows((list) => list.filter((r) => r.id !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete aircraft");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <h1>Aircraft</h1>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <form onSubmit={onCreate} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input name="type" placeholder="Type" value={form.type} onChange={onFormChange} />
        <input name="numberOfPassengers" type="number" min="0" placeholder="Seats"
               value={form.numberOfPassengers} onChange={onFormChange} />
        <button type="submit">Add Aircraft</button>
      </form>

      <form onSubmit={onAssign} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input name="aircraftId" type="number" min="1" placeholder="Aircraft ID"
               value={assignForm.aircraftId} onChange={onAssignChange} />
        <input name="airportId" type="number" min="1" placeholder="Airport ID"
               value={assignForm.airportId} onChange={onAssignChange} />
        <button type="submit">Assign Airport</button>
      </form>

      {loading ? <div>Loading…</div> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th>ID</th>
              <th>Type</th>
              <th>Seats</th>
              <th>Airports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.type}</td>
                <td>{a.numberOfPassengers}</td>
                <td>
                  {a.airports?.length
                    ? a.airports.map((ap) => ap.name || ap.id).join(", ")
                    : "—"}
                </td>
                <td>
                  <button onClick={() => onDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan="5" style={{ textAlign: "center" }}>No aircraft</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
