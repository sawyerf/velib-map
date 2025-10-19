// App.jsx
import React from "react";
import Map from "./components/map";
import StatInfo from "./components/StatInfo";
import Heatmap from "./components/Heatmap";
import { processPoints, getStat, filterOpe, getStatsByDay } from "./libs/stats";

import "./styles/App.css";

function App() {
  const [points, setPoints] = React.useState([]);
  const walletOperations = React.useRef([]);
  const [stats, setStats] = React.useState({});
  const [statsByDay, setStatsByDay] = React.useState({});
  const [typeVelib, setTypeVelib] = React.useState("ALL");

  React.useEffect(() => {
    const walletOpsFiltered = filterOpe(walletOperations.current, typeVelib);
    setPoints(processPoints(walletOpsFiltered));
    setStats(getStat(walletOpsFiltered));
    setStatsByDay(getStatsByDay(walletOpsFiltered));
  }, [typeVelib]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        walletOperations.current = json.walletOperations.filter(op => op.parameter3.DISTANCE !== '0.0');
        const walletOpsFiltered = filterOpe(walletOperations.current, typeVelib);
        setPoints(processPoints(walletOpsFiltered));
        setStats(getStat(walletOpsFiltered));
        setStatsByDay(getStatsByDay(walletOpsFiltered));
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
      <div class="buttons">
        <button id="all" onClick={() => setTypeVelib("ALL")} disabled={typeVelib === "ALL"}>Tout</button>
        <button id="mechanical" onClick={() => setTypeVelib("MECHANICAL")} disabled={typeVelib === "MECHANICAL"}>Mécanique</button>
        <button id="electric" onClick={() => setTypeVelib("ELECTRIC")} disabled={typeVelib === "ELECTRIC"}>Électrique</button>
      </div>
      <Map points={points} />
      {
        points.length > 0 && (
          <>
            <div style={{ display: "grid", gap: "16px", marginTop: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", width: "100%", maxWidth: "800px" }}>
              <StatInfo name="Nombre de trajets" value={stats.totalRides} unit="" />
              <StatInfo name="Vitesse maximale" value={stats.maxSpeed?.toFixed(2)} unit="km/h" />
              <StatInfo name="Vitesse moyenne" value={stats.avgSpeed} unit="km/h" />
              <StatInfo name="Distance moyenne" value={stats.avgDistance?.toFixed(2)} unit="km" />
              <StatInfo name="Distance maximale" value={stats.maxDistance?.toFixed(2)} unit="km" />
              <StatInfo name="Distance totale" value={stats.totalDistance?.toFixed(2)} unit="km" />
              <StatInfo name="Durée moyenne" value={stats.avgDuration?.toFixed(2)} unit="min" />
              <StatInfo name="Durée totale" value={stats.totalDuration?.toFixed(2)} unit="min" />
            </div>
            <h3 className="subtitle">Nombre de trajets par jour</h3>
            <Heatmap data={statsByDay} />
          </>
        )}
    </div>
  );
}

export default App;
