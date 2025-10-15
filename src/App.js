// App.jsx
import React from "react";
import Map from "./components/map";
import StatInfo from "./components/StatInfo";
import { processPoints, getStat } from "./libs/stats";

import "./styles/App.css";


function App() {
  const [points, setPoints] = React.useState([]);
  const [stats, setStats] = React.useState({});

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setPoints(processPoints(json))
        setStats(getStat(json))
      } catch (error) {
        console.error("Invalid JSON file", error);
      }
    }
    reader.readAsText(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>Velib Stats Visualizer</h1>
      <div>
        <a href="https://www.velib-metropole.fr/api/private/getCourseList?limit=10000" target="_blank" rel="noreferrer">Download your ride history (JSON)</a>
        <input type="file" accept=".json" onChange={handleFileChange} />
      </div>
      <Map points={points} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "20px" }}>
        <StatInfo name="Nombre total de trajets" value={stats.totalRides} unit="" />
        <StatInfo name="Vitesse maximale" value={stats.maxSpeed?.toFixed(2)} unit="km/h" />
        <StatInfo name="Vitesse moyenne" value={stats.avgSpeed} unit="km/h" />
        <StatInfo name="Distance moyenne" value={stats.avgDistance?.toFixed(2)} unit="km" />
        <StatInfo name="Distance maximale" value={stats.maxDistance?.toFixed(2)} unit="km" />
        <StatInfo name="Distance totale" value={stats.totalDistance?.toFixed(2)} unit="km" />
        <StatInfo name="Durée moyenne" value={stats.avgDuration?.toFixed(2)} unit="min" />
        <StatInfo name="Durée totale" value={stats.totalDuration?.toFixed(2)} unit="min" />
      </div>
    </div>
  );
}

export default App;
