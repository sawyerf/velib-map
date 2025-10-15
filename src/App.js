// App.jsx
import React from "react";
import Map from "./map";
import stationInfo from "./station_information.json";
import StatInfo from "./StatInfo";

// const stations = stationInfo.data.stations;
const stationsById = stationInfo.data.stations.reduce((acc, station) => {
  acc[station.station_id.toString()] = station;
  return acc;
}, {});
console.log(stationsById);

const processPoints = (data) => {
  if (!data?.walletOperations?.length) return [];

  const hitStations = {}

  const addHit = (id) => {
    if (!hitStations[id]) hitStations[id] = 1;
    else hitStations[id] += 1;
  }

  for (const operation of data.walletOperations) {
    addHit(operation.parameter3.departureStationId);
    addHit(operation.parameter3.arrivalStationId);
  }

  const maxHit = Math.max(...Object.values(hitStations));

  return Object.entries(hitStations).map(([stationId, hits]) => {
    const station = stationsById[stationId];
    if (!station) return null;
    return [
      station.lat,
      station.lon,
      (hits / maxHit ) * 100
    ];
  }).filter(Boolean);
}

const processPoints2 = (data) => {
  if (!data?.walletOperations?.length) return [];

  const hitStations = []

  const addHit = (id) => {
    const station = stationsById[id];
    if (!station) return;
    hitStations.push([station.lat, station.lon, 1]);
  }

  for (const operation of data.walletOperations) {
    addHit(operation.parameter3.departureStationId);
    addHit(operation.parameter3.arrivalStationId);
  }

  return hitStations;
}

const getStat = (data) => {
  if (!data?.walletOperations?.length) return {};

  return {
    totalRides: data.walletOperations.length,
    maxDistance: Math.max(...data.walletOperations.map(op => parseInt(op.parameter3.DISTANCE, 10))) / 1000,
    maxSpeed: Math.max(...data.walletOperations.map(op => op.parameter3.AVERAGE_SPEED)),
    totalDistance: data.walletOperations.reduce((acc, op) => acc + parseInt(op.parameter3.DISTANCE, 10), 0) / 1000,
    totalDuration: data.walletOperations.reduce((acc, op) => acc + op.parameter3.duration, 0) / 60,
    avgDuration: data.walletOperations.reduce((acc, op) => acc + op.parameter3.duration, 0) / data.walletOperations.length / 60,
    avgDistance: data.walletOperations.reduce((acc, op) => acc + parseInt(op.parameter3.DISTANCE, 10), 0) / data.walletOperations.length / 1000,
    avgSpeed: (data.walletOperations.reduce((acc, op) => acc + op.parameter3.AVERAGE_SPEED, 0) / data.walletOperations.length).toFixed(2),
  }
}

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
    <div>
      <h1>Carte de Chaleur avec Leaflet et React</h1>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <Map points={points} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "20px" }}>
        <StatInfo name="Nombre total de trajets" value={stats.totalRides} />
        <StatInfo name="Distance totale" value={stats.totalDistance?.toFixed(2)} />
        <StatInfo name="Durée totale" value={stats.totalDuration?.toFixed(2)} />
        <StatInfo name="Distance maximale" value={stats.maxDistance?.toFixed(2)} />
        <StatInfo name="Vitesse maximale" value={stats.maxSpeed?.toFixed(2)} />
        <StatInfo name="Durée moyenne" value={stats.avgDuration?.toFixed(2)} />
        <StatInfo name="Distance moyenne" value={stats.avgDistance?.toFixed(2)} />
        <StatInfo name="Vitesse moyenne" value={stats.avgSpeed} />
      </div>
    </div>
  );
}

export default App;
