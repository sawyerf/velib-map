import React from "react";

import stat from "../libs/stats";
import Map from "../components/map";
import StatInfo from "../components/StatInfo";
import Heatmap from "../components/Heatmap";
import Station from "../components/Station";
import { BarChart } from '@mui/x-charts/BarChart';

const Stats = ({ walletOperations, typeVelib, startDate, endDate, setStartDate, setEndDate }) => {
  const [points, setPoints] = React.useState([]);
  const [rides, setRides] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [statsByDay, setStatsByDay] = React.useState(null);
  const [statsByHour, setStatsByHour] = React.useState([]);
  const [topStations, setTopStations] = React.useState([]);

  const updateStats = React.useCallback(() => {
    const walletOpsFiltered = stat.filterOpe(walletOperations, typeVelib, startDate, endDate);
    setPoints(stat.processPoints(walletOpsFiltered));
    setStats(stat.getStat(walletOpsFiltered));
    setStatsByDay(stat.getStatsByDay(walletOpsFiltered));
    setStatsByHour(stat.getStatsByHour(walletOpsFiltered));
    setTopStations(stat.getTopStations(walletOpsFiltered, 5));
    setRides(stat.getRides(walletOpsFiltered));
  }, [walletOperations, typeVelib, startDate, endDate]);

  React.useEffect(() => {
    updateStats();
  }, [walletOperations, typeVelib, startDate, endDate]);

  if (!walletOperations?.length) return null;
  return (
    <>
      <Map points={points} rides={rides} />
      {stats && (
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
          <StatInfo name="Total dépensé" value={stats.amount?.toFixed(2)} unit="€" />
          <StatInfo name="Dépense moyenne" value={stats.avgAmount?.toFixed(2)} unit="€" />
          <StatInfo name="CO2 économisé" value={stats.savedCo2?.toFixed(2)} unit="kg" />
        </div>
      )}
      {topStations.length > 0 && (
        <>
          <h3 className="subtitle">Top 5 des stations les plus utilisées</h3>
          <div className="stations-container">
            {topStations.map((station) => (
              <Station key={station.id} name={station.name} hits={station.hits} />
            ))}
          </div>
        </>
      )}
      {statsByDay && (
        <>
          <h3 className="subtitle">Nombre de trajets par jour</h3>
          <Heatmap data={statsByDay} onClick={(date) => {
            if (date === startDate && date === endDate) {
              setStartDate(null);
              setEndDate(null);
              return;
            }
            setStartDate(date);
            setEndDate(date);
          }} />
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
    </>
  )
}

export default Stats;