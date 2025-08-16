// src/tables/GateTable.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getGates,
  getGatesByAirport,
  getGatesByAirportAndType,
  createGate,
  updateGate,
  deleteGate,
} from "../api/gates";
import { getAirports } from "../api/airports";
import { getAircraft } from "../api/aircraft";

export default function GateTable() {
  const [gates, setGates] = useState([]);
  const [airports, setAirports] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [filterAirportId, setFilterAirportId] = useState("");
  const [filterIsDeparture, setFilterIsDeparture] = useState("");

  const [form, setForm] = useState({
    id: null,
    gateNumber: "",
    terminal: "",
    departureGate: true, // backend field
    airportId: "",
    aircraftId: "",
  });

  const airportMap = useMemo(() => {
    const m = new Map();
    airports.forEach((a) => m.set(a.id, a));
    return m;
  }, [airports]);

  const aircraftMap = useMemo(() => {
    const m = new Map();
    aircraft.forEach((a) => m.set(a.id, a));
    return m;
  }, [aircraft]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [gs, aps, acs] = await Promise.all([
          getGates(),
          getAirports(),
          getAircraft(),
        ]);
        setGates(gs);
        setAirports(aps);
        setAircraft(acs);
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function resetForm() {
    setForm({
      id: null,
      gateNumber: "",
      terminal: "",
      departureGate: true,
      airportId: "",
      aircraftId: "",
    });
  }

  function onEdit(g) {
    setForm({
      id: g.id,
      gateNumber: g.gateNumber ?? "",
      terminal: g.terminal ?? "",
      departureGate: Boolean(g.departureGate),
      airportId: g.airport?.id ?? "",
      aircraftId: g.aircraft?.id ?? "",
    });
  }

  async function onDelete(id) {
    if (!confirm("Delete this gate?")) return;
    try {
      await deleteGate(id);
      setGates((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      alert(e.message || e);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      gateNumber: form.gateNumber,
      terminal: form.terminal,
      departureGate: Boolean(form.departureGate),
      airport: form.airportId ? { id: Number(form.airportId) } : null,
      aircraft: form.aircraftId ? { id: Number(form.aircraftId) } : null,
    };

    try {
      if (form.id) {
        const updated = await updateGate(form.id, payload);
        setGates((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const created = await createGate(payload);
        setGates((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function applyFilters() {
    try {
      setLoading(true);
      let data = [];
      if (filterAirportId && filterIsDeparture !== "") {
        data = await getGatesByAirportAndType(
          Number(filterAirportId),
          filterIsDeparture === "true"
        );
      } else if (filterAirportId) {
        data = await getGatesByAirport(Number(filterAirportId));
      } else {
        data = await getGates();
      }
      setGates(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading gates…</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  return (
    <div>
      <h2>Gates</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <label>
          Airport:&nbsp;
          <select
            value={filterAirportId}
            onChange={(e) => setFilterAirportId(e.target.value)}
          >
            <option value="">All</option>
            {airports.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          Type:&nbsp;
          <select
            value={filterIsDeparture}
            onChange={(e) => setFilterIsDeparture(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Departure</option>
            <option value="false">Arrival</option>
          </select>
        </label>

        <button onClick={applyFilters}>Apply</button>
        <button
          onClick={() => {
            setFilterAirportId("");
            setFilterIsDeparture("");
            applyFilters();
          }}
        >
          Clear
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 8, maxWidth: 520, marginBottom: 20 }}
      >
        <div>
          <label>Gate Number&nbsp;</label>
          <input
            value={form.gateNumber}
            onChange={(e) => setForm((f) => ({ ...f, gateNumber: e.target.value }))}
            required
            placeholder="A12"
          />
        </div>

        <div>
          <label>Terminal&nbsp;</label>
          <input
            value={form.terminal}
            onChange={(e) => setForm((f) => ({ ...f, terminal: e.target.value }))}
            required
            placeholder="T1 / Domestic / Intl"
          />
        </div>

        <div>
          <label>Is Departure Gate?&nbsp;</label>
          <input
            type="checkbox"
            checked={form.departureGate}
            onChange={(e) => setForm((f) => ({ ...f, departureGate: e.target.checked }))}
          />
        </div>

        <div>
          <label>Airport&nbsp;</label>
          <select
            value={form.airportId}
            onChange={(e) => setForm((f) => ({ ...f, airportId: e.target.value }))}
            required
          >
            <option value="">-- select airport --</option>
            {airports.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Aircraft (optional)&nbsp;</label>
          <select
            value={form.aircraftId}
            onChange={(e) => setForm((f) => ({ ...f, aircraftId: e.target.value }))}
          >
            <option value="">-- none --</option>
            {aircraft.map((ac) => (
              <option key={ac.id} value={ac.id}>
                {ac.type} (#{ac.id})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving}>
            {form.id ? "Save" : "Add"}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Gate</th>
            <th>Terminal</th>
            <th>Departure?</th>
            <th>Airport</th>
            <th>Aircraft</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gates.map((g) => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.gateNumber}</td>
              <td>{g.terminal}</td>
              <td>{g.departureGate ? "Yes" : "No"}</td>
              <td>{g.airport ? `${g.airport.name} (${g.airport.code})` : "—"}</td>
              <td>{g.aircraft ? `${g.aircraft.type} (#${g.aircraft.id})` : "—"}</td>
              <td>
                <button onClick={() => onEdit(g)}>Edit</button>{" "}
                <button onClick={() => onDelete(g.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {gates.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No gates yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
