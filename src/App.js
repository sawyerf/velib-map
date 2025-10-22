// App.jsx
import React from "react";
import Map from "./components/map";
import StatInfo from "./components/StatInfo";
import Heatmap from "./components/Heatmap";
import Station from "./components/Station";
import { BarChart } from '@mui/x-charts/BarChart';
import stat from "./libs/stats";

import "./styles/App.css";

function App() {
  const [points, setPoints] = React.useState([]);
  const walletOperations = React.useRef([]);
  const [stats, setStats] = React.useState({});
  const [statsByDay, setStatsByDay] = React.useState({});
  const [statsByHour, setStatsByHour] = React.useState([]);
  const [typeVelib, setTypeVelib] = React.useState("ALL");
  const [topStations, setTopStations] = React.useState([]);

  const updateStats = React.useCallback(() => {
    const walletOpsFiltered = stat.filterOpe(walletOperations.current, typeVelib);
    setPoints(stat.processPoints(walletOpsFiltered));
    setStats(stat.getStat(walletOpsFiltered));
    setStatsByDay(stat.getStatsByDay(walletOpsFiltered));
    setStatsByHour(stat.getStatsByHour(walletOpsFiltered));
    setTopStations(stat.getTopStations(walletOpsFiltered, 5));
  }, [typeVelib]);

  React.useEffect(() => {
    updateStats();
  }, [updateStats]);

  document.body.ondrop = (event) => {
    handleFileChange(event);
  };

  document.body.ondragover = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    event.preventDefault();
    let file = null;

    if (event?.target?.files?.length > 0) {
      file = event.target.files[0];
    } else if (event?.dataTransfer?.files?.length > 0) {
      file = event.dataTransfer.files[0];
    } else {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        walletOperations.current = json.walletOperations.filter(op => op.parameter3.DISTANCE !== '0.0');
        updateStats();
      } catch (error) {
        console.error("Invalid JSON file", error);
      }
    }
    reader.readAsText(file);
  }

  return (
    <div className="main-container">
      <h1>Statistiques Vélib</h1>
      <div style={{
        display: "flex",
        flexDirection: "wrap",
        gap: "16px",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px",
        marginTop: "10px",
      }}
      >
        <a href="https://www.velib-metropole.fr/api/private/getCourseList?limit=10000" target="_blank" rel="noreferrer">Télécharger vos trajets (JSON)</a>
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
              <StatInfo name="Stations utilisées" value={points.length} unit="" />
            </div>
            <h3 className="subtitle">Top 5 des stations les plus utilisées</h3>
            <div className="stations-container">
              {topStations.map((station) => (
                <Station key={station.id} name={station.name} hits={station.hits} />
              ))}
            </div>
            <h3 className="subtitle">Nombre de trajets par jour</h3>
            <Heatmap data={statsByDay} />
          </>
        )}
      {
        statsByHour.length > 0 && (
          <>
            <h3 className="subtitle">Nombre de trajets par heure de la journée</h3>
            <BarChart
              dataset={statsByHour}
              xAxis={[{ dataKey: 'hour', label: 'Heure de la journée' }]}
              series={[
                { dataKey: 'count', label: 'Nombre de trajets', color: 'blue' },
                // { dataKey: 'totalDistance', label: 'Distance totale (m)', color: 'green' },
                // { dataKey: 'totalDuration', label: 'Durée totale (s)', color: 'orange' },
              ]}
              width={Math.min(window.innerWidth - 40, 800)}
              height={Math.min(window.innerWidth - 40, 800) * 0.5}
            />
          </>
        )
      }
    </div>
  );
}

export default App;
