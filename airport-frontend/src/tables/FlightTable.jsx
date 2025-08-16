import { useEffect, useMemo, useState } from "react";
import {
  getFlights,
  getFlightByNumber,
  getFlightsBetween,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../api/flight";

// small helpers
function toLocalInputValue(dt) {
  // expects ISO ("2025-08-15T10:00" or "2025-08-15T10:00:00")
  if (!dt) return "";
  // keep minutes precision for <input type="datetime-local">
  return dt.slice(0, 16);
}

function fromLocalInputValue(v) {
  // ensure "YYYY-MM-DDTHH:mm"
  return v || "";
}

export default function FlightTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // create form
  const [form, setForm] = useState({
    flightNumber: "",
    airlineId: "",
    aircraftId: "",
    departureAirportId: "",
    arrivalAirportId: "",
    departureGateId: "",
    arrivalGateId: "",
    scheduledDeparture: "",
    scheduledArrival: "",
    status: "SCHEDULED",
  });

  // edit controls
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({
    flightNumber: "",
    airlineId: "",
    aircraftId: "",
    departureAirportId: "",
    arrivalAirportId: "",
    departureGateId: "",
    arrivalGateId: "",
    scheduledDeparture: "",
    scheduledArrival: "",
    status: "SCHEDULED",
  });

  // filters
  const [searchNumber, setSearchNumber] = useState("");
  const [between, setBetween] = useState({ start: "", end: "" });

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const data = await getFlights();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load flights");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const totalFlights = useMemo(() => rows.length, [rows]);

  // ------- create -------
  const onCreateChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.flightNumber.trim()) return setErr("Flight number is required.");
    if (!form.airlineId || !form.aircraftId || !form.departureAirportId || !form.arrivalAirportId) {
      return setErr("Airline, Aircraft, Departure Airport, and Arrival Airport are required.");
    }
    if (!form.scheduledDeparture || !form.scheduledArrival) {
      return setErr("Scheduled departure and arrival are required.");
    }

    const payload = {
      flightNumber: form.flightNumber.trim(),
      airline: { id: Number(form.airlineId) },
      aircraft: { id: Number(form.aircraftId) },
      departureAirport: { id: Number(form.departureAirportId) },
      arrivalAirport: { id: Number(form.arrivalAirportId) },
      ...(form.departureGateId ? { departureGate: { id: Number(form.departureGateId) } } : {}),
      ...(form.arrivalGateId ? { arrivalGate: { id: Number(form.arrivalGateId) } } : {}),
      scheduledDeparture: fromLocalInputValue(form.scheduledDeparture),
      scheduledArrival: fromLocalInputValue(form.scheduledArrival),
      status: form.status || "SCHEDULED",
    };

    try {
      const created = await createFlight(payload);
      setRows((list) => [created, ...list]);
      setForm({
        flightNumber: "",
        airlineId: "",
        aircraftId: "",
        departureAirportId: "",
        arrivalAirportId: "",
        departureGateId: "",
        arrivalGateId: "",
        scheduledDeparture: "",
        scheduledArrival: "",
        status: "SCHEDULED",
      });
    } catch (e) {
      setErr(e.message || "Failed to create flight");
    }
  };

  // ------- edit -------
  const startEdit = (f) => {
    setEditingId(f.id);
    setEditRow({
      flightNumber: f.flightNumber ?? "",
      airlineId: f.airline?.id ?? "",
      aircraftId: f.aircraft?.id ?? "",
      departureAirportId: f.departureAirport?.id ?? "",
      arrivalAirportId: f.arrivalAirport?.id ?? "",
      departureGateId: f.departureGate?.id ?? "",
      arrivalGateId: f.arrivalGate?.id ?? "",
      scheduledDeparture: toLocalInputValue(f.scheduledDeparture ?? ""),
      scheduledArrival: toLocalInputValue(f.scheduledArrival ?? ""),
      status: f.status ?? "SCHEDULED",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({
      flightNumber: "",
      airlineId: "",
      aircraftId: "",
      departureAirportId: "",
      arrivalAirportId: "",
      departureGateId: "",
      arrivalGateId: "",
      scheduledDeparture: "",
      scheduledArrival: "",
      status: "SCHEDULED",
    });
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditRow((r) => ({ ...r, [name]: value }));
  };

  const saveEdit = async (id) => {
    setErr("");

    const payload = {
      id,
      flightNumber: editRow.flightNumber.trim(),
      airline: editRow.airlineId ? { id: Number(editRow.airlineId) } : undefined,
      aircraft: editRow.aircraftId ? { id: Number(editRow.aircraftId) } : undefined,
      departureAirport: editRow.departureAirportId ? { id: Number(editRow.departureAirportId) } : undefined,
      arrivalAirport: editRow.arrivalAirportId ? { id: Number(editRow.arrivalAirportId) } : undefined,
      departureGate: editRow.departureGateId ? { id: Number(editRow.departureGateId) } : null,
      arrivalGate: editRow.arrivalGateId ? { id: Number(editRow.arrivalGateId) } : null,
      scheduledDeparture: fromLocalInputValue(editRow.scheduledDeparture),
      scheduledArrival: fromLocalInputValue(editRow.scheduledArrival),
      status: editRow.status || "SCHEDULED",
    };

    try {
      const updated = await updateFlight(id, payload);
      setRows((list) => list.map((r) => (r.id === id ? updated : r)));
      cancelEdit();
    } catch (e) {
      setErr(e.message || "Failed to update flight");
    }
  };

  // ------- delete -------
  const onDelete = async (id) => {
    if (!confirm("Delete this flight?")) return;
    setErr("");
    try {
      await deleteFlight(id);
      setRows((list) => list.filter((r) => r.id !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete flight");
    }
  };

  // ------- filters -------
  const onSearchNumber = async (e) => {
    e.preventDefault();
    if (!searchNumber.trim()) return loadAll();
    try {
      setLoading(true);
      const f = await getFlightByNumber(searchNumber.trim());
      setRows(f ? [f] : []);
    } catch (e) {
      setErr(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const onBetween = async (e) => {
    e.preventDefault();
    if (!between.start || !between.end) return setErr("Pick both start and end.");
    try {
      setLoading(true);
      const list = await getFlightsBetween(between.start, between.end);
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e.message || "Range query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "1rem" }}>
      <h1>Flights</h1>

      {/* Create flight */}
      <form onSubmit={onCreate}
            style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 12 }}>
        <input name="flightNumber" placeholder="Flight # (e.g., AC123)" value={form.flightNumber} onChange={onCreateChange} />
        <input name="airlineId" type="number" min="1" placeholder="Airline ID" value={form.airlineId} onChange={onCreateChange} />
        <input name="aircraftId" type="number" min="1" placeholder="Aircraft ID" value={form.aircraftId} onChange={onCreateChange} />
        <input name="departureAirportId" type="number" min="1" placeholder="Depart Airport ID" value={form.departureAirportId} onChange={onCreateChange} />
        <input name="arrivalAirportId" type="number" min="1" placeholder="Arrive Airport ID" value={form.arrivalAirportId} onChange={onCreateChange} />
        <select name="status" value={form.status} onChange={onCreateChange}>
          {["SCHEDULED","BOARDING","DEPARTED","ARRIVED","DELAYED","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="departureGateId" type="number" min="1" placeholder="Depart Gate ID (optional)" value={form.departureGateId} onChange={onCreateChange} />
        <input name="arrivalGateId" type="number" min="1" placeholder="Arrive Gate ID (optional)" value={form.arrivalGateId} onChange={onCreateChange} />
        <input name="scheduledDeparture" type="datetime-local" value={form.scheduledDeparture} onChange={onCreateChange} />
        <input name="scheduledArrival" type="datetime-local" value={form.scheduledArrival} onChange={onCreateChange} />
        <button type="submit" style={{ gridColumn: "span 6" }}>Add Flight</button>
      </form>

      {/* Quick search + between filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <form onSubmit={onSearchNumber} style={{ display: "flex", gap: 8 }}>
          <input placeholder="Search by Flight #"
                 value={searchNumber}
                 onChange={(e) => setSearchNumber(e.target.value)} />
          <button type="submit">Search</button>
          <button type="button" onClick={loadAll}>Clear</button>
        </form>

        <form onSubmit={onBetween} style={{ display: "flex", gap: 8 }}>
          <input type="datetime-local" value={between.start} onChange={(e) => setBetween((b) => ({ ...b, start: e.target.value }))} />
          <input type="datetime-local" value={between.end} onChange={(e) => setBetween((b) => ({ ...b, end: e.target.value }))} />
          <button type="submit">Between</button>
        </form>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                <th>ID</th>
                <th>Flight #</th>
                <th>Airline ID</th>
                <th>Aircraft ID</th>
                <th>Dep Airport</th>
                <th>Arr Airport</th>
                <th>Dep Gate</th>
                <th>Arr Gate</th>
                <th>Sched Dep</th>
                <th>Sched Arr</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>
                    {editingId === f.id ? (
                      <input name="flightNumber" value={editRow.flightNumber}
                             onChange={onEditChange} />
                    ) : f.flightNumber}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <input name="airlineId" type="number" value={editRow.airlineId}
                             onChange={onEditChange} />
                    ) : (f.airline?.id ?? "—")}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <input name="aircraftId" type="number" value={editRow.aircraftId}
                             onChange={onEditChange} />
                    ) : (f.aircraft?.id ?? "—")}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <input name="departureAirportId" type="number" value={editRow.departureAirportId}
                             onChange={onEditChange} />
                    ) : (f.departureAirport?.id ?? "—")}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <input name="arrivalAirportId" type="number" value={editRow.arrivalAirportId}
                             onChange={onEditChange} />
                    ) : (f.arrivalAirport?.id ?? "—")}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <input name="departureGateId" type="number" value={editRow.departureGateId}
                             onChange={onEditChange} />
                    ) : (f.departureGate?.id ?? "—")}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <input name="arrivalGateId" type="number" value={editRow.arrivalGateId}
                             onChange={onEditChange} />
                    ) : (f.arrivalGate?.id ?? "—")}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <input name="scheduledDeparture" type="datetime-local"
                             value={editRow.scheduledDeparture} onChange={onEditChange} />
                    ) : (f.scheduledDeparture ?? "—")}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <input name="scheduledArrival" type="datetime-local"
                             value={editRow.scheduledArrival} onChange={onEditChange} />
                    ) : (f.scheduledArrival ?? "—")}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <select name="status" value={editRow.status} onChange={onEditChange}>
                        {["SCHEDULED","BOARDING","DEPARTED","ARRIVED","DELAYED","CANCELLED"]
                          .map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : f.status}
                  </td>
                  <td>
                    {editingId === f.id ? (
                      <>
                        <button onClick={() => saveEdit(f.id)} style={{ marginRight: 6 }}>Save</button>
                        <button onClick={cancelEdit} type="button">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(f)} style={{ marginRight: 6 }}>Edit</button>
                        <button onClick={() => onDelete(f.id)} type="button">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center", padding: 16 }}>No flights</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ color: "#666", marginTop: 8 }}>Total flights: {totalFlights}</p>
    </div>
  );
}
