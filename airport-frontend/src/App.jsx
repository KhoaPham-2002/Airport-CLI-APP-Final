import { useState } from "react";
import FlightTable from "./tables/FlightTable";
import CityTable from "./tables/CityTable";
import AircraftTable from "./tables/AircraftTable";
import AirlineTable from "./tables/AirlineTable";
import AirportTable from "./tables/AirportTable";
import PassengerTable from "./tables/PassengerTable";
import GateTable from "./tables/GateTable";

export default function App() {
  const [page, setPage] = useState("flights");

  const renderPage = () => {
    switch (page) {
      case "cities":
        return <CityTable />;
      case "aircraft":
        return <AircraftTable />;
      case "airlines":
        return <AirlineTable />;
      case "airports":              // <-- add this
        return <AirportTable />;
      case "passengers": 
        return <PassengerTable />;
      case "gates": 
        return <GateTable />;
      default:
        return <FlightTable />;
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1>Airport Management</h1>
      <nav style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setPage("flights")}>Flights</button>
        <button onClick={() => setPage("cities")}>Cities</button>
        <button onClick={() => setPage("aircraft")}>Aircraft</button>
        <button onClick={() => setPage("airlines")}>Airlines</button>
        <button onClick={() => setPage("airports")}>Airports</button> 
        <button onClick={() => setPage("passengers")}>Passengers</button>
        <button onClick={() => setPage("gates")}>Gates</button>{}
      </nav>
      {renderPage()}
    </div>
  );
}
