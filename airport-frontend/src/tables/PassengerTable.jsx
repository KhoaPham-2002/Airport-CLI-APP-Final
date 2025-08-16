import { useEffect, useState } from "react";
import { getPassengers, createPassenger, updatePassenger, deletePassenger } from "../api/passengers";
import { getCities } from "../api/cities";

export default function PassengerTable() {
  const [passengers, setPassengers] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Create form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cityId, setCityId] = useState("");

  // Edit form
  const [editingId, setEditingId] = useState(null);
  const [eFirstName, setEFirstName] = useState("");
  const [eLastName, setELastName]   = useState("");
  const [ePhoneNumber, setEPhoneNumber] = useState("");
  const [eCityId, setECityId] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [ps, cs] = await Promise.all([getPassengers(), getCities()]);
        if (!mounted) return;
        setPassengers(Array.isArray(ps) ? ps : []);
        setCities(Array.isArray(cs) ? cs : []);
      } catch (e) {
        setErr(e.message || "Failed to load passengers/cities");
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
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !cityId) {
      setErr("Please fill First, Last, Phone and City.");
      return;
    }
    const body = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      // Your entity expects City; most controllers accept nested object or cityId:
      city: { id: Number(cityId) },
      cityId: Number(cityId),
    };
    try {
      const created = await createPassenger(body);
      setPassengers((prev) => [created, ...prev]);
      setFirstName(""); setLastName(""); setPhoneNumber(""); setCityId("");
    } catch (e) {
      setErr(e.message || "Create failed");
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setEFirstName(p.firstName || "");
    setELastName(p.lastName || "");
    setEPhoneNumber(p.phoneNumber || "");
    setECityId(String(p.city?.id ?? ""));
  }

  function cancelEdit() {
    setEditingId(null);
    setEFirstName(""); setELastName(""); setEPhoneNumber(""); setECityId("");
  }

  async function saveEdit(id) {
    setErr("");
    if (!eFirstName.trim() || !eLastName.trim() || !ePhoneNumber.trim() || !eCityId) {
      setErr("Please complete all fields.");
      return;
    }
    const body = {
      firstName: eFirstName.trim(),
      lastName: eLastName.trim(),
      phoneNumber: ePhoneNumber.trim(),
      city: { id: Number(eCityId) },
      cityId: Number(eCityId),
    };
    try {
      const updated = await updatePassenger(id, body);
      setPassengers((prev) => prev.map((p) => (p.id === id ? updated : p)));
      cancelEdit();
    } catch (e) {
      setErr(e.message || "Update failed");
    }
  }

  async function onDelete(id) {
    if (!confirm(`Delete passenger #${id}?`)) return;
    setErr("");
    try {
      await deletePassenger(id);
      setPassengers((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setErr(e.message || "Delete failed (passenger may be referenced).");
    }
  }

  if (loading) return <p>Loading passengers…</p>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h2>Passengers</h2>

      {err && (
        <div style={{ background: "#fee", border: "1px solid #f99", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {/* Create */}
      <form
        onSubmit={onCreate}
        style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr 1fr auto", alignItems: "end", marginBottom: 16 }}
      >
        <div>
          <label style={lbl}>First Name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Alex" />
        </div>
        <div>
          <label style={lbl}>Last Name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" />
        </div>
        <div>
          <label style={lbl}>Phone</label>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="555-1234" />
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

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>ID</th>
              <th style={th}>First</th>
              <th style={th}>Last</th>
              <th style={th}>Phone</th>
              <th style={th}>City</th>
              <th style={th}># Aircraft</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p) => {
              const isEditing = editingId === p.id;
              const cityLabel = p.city ? `${p.city.name}${p.city.state ? ", " + p.city.state : ""}` : "—";
              const aircraftCount = Array.isArray(p.aircraft) ? p.aircraft.length : "";

              return (
                <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={td}>{p.id}</td>

                  <td style={td}>
                    {isEditing ? (
                      <input value={eFirstName} onChange={(e) => setEFirstName(e.target.value)} />
                    ) : (
                      p.firstName
                    )}
                  </td>

                  <td style={td}>
                    {isEditing ? (
                      <input value={eLastName} onChange={(e) => setELastName(e.target.value)} />
                    ) : (
                      p.lastName
                    )}
                  </td>

                  <td style={td}>
                    {isEditing ? (
                      <input value={ePhoneNumber} onChange={(e) => setEPhoneNumber(e.target.value)} />
                    ) : (
                      p.phoneNumber
                    )}
                  </td>

                  <td style={td}>
                    {isEditing ? (
                      <select value={eCityId} onChange={(e) => setECityId(e.target.value)}>
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

                  <td style={{ ...td, textAlign: "center" }}>{aircraftCount}</td>

                  <td style={td}>
                    {!isEditing ? (
                      <>
                        <button style={btn} onClick={() => startEdit(p)}>Edit</button>{" "}
                        <button style={btn} onClick={() => onDelete(p.id)}>Delete</button>
                      </>
                    ) : (
                      <>
                        <button style={btn} onClick={() => saveEdit(p.id)}>Save</button>{" "}
                        <button style={btn} onClick={cancelEdit}>Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {passengers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 12, textAlign: "center", color: "#777" }}>
                  No passengers yet.
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
