// App.jsx
import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../styles/map.css";

function Map({ points, rides }) {
  const map = React.useRef(null);
  const [showRides, setShowRides] = React.useState(false);
  const [showStations, setShowStations] = React.useState(true);
  const [showHeatmap, setShowHeatmap] = React.useState(true);

  React.useEffect(() => {
    // 1️⃣ Initialiser la carte centrée sur Paris
    map.current = L.map("map", {
      center: [48.8566, 2.3522],
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
    });

    // 2️⃣ Ajouter le fond OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.current);

    return () => map.current.remove();
  }, []);

  React.useEffect(() => {
    if (!map.current) return;
    if (!showHeatmap) return;
    if (points.length === 0) return;

    // 4️⃣ Ajouter la couche heatmap
    const heat = L.heatLayer(points, {
      radius: 20,      // Taille d’influence
      blur: 15,        // Lissage
      maxZoom: 17,     // Zoom max où la chaleur est visible
      minOpacity: 0.1, // Opacité minimale
      gradient: {      // Couleurs
        0.1: "blue",
        0.3: "lime",
        0.6: "orange",
        0.9: "red",
      },
    });

    heat.addTo(map.current);
    return () => {
      map.current.removeLayer(heat);
    }
  }, [points, showHeatmap]);

  React.useEffect(() => {
    if (!map.current) return;
    if (!showStations) return;
    if (points.length === 0) return;
    const stations = L.layerGroup();

    points.forEach(([lat, lon, intensity]) => {
      L.circleMarker([lat, lon], {
        radius: 1,
        color: 'black',
        fillColor: 'black',
      }).addTo(stations);
    });

    stations.addTo(map.current);

    return () => {
      map.current.removeLayer(stations);
    };
  }, [points, showStations]);

  React.useEffect(() => {
    if (!map.current) return;
    if (!showRides) return;
    if (rides.length === 0) return;

    const ridesLayer = L.layerGroup();

    rides.forEach((ride) => {
      if (ride.length < 3) return;
      L.polyline([ride[0], ride[1]], {
        color: ride[2] === 'electric' ? 'blue' : '#006800ff',
        weight: 4,
        opacity: 0.4
      })
        .addTo(ridesLayer);
    });

    ridesLayer.addTo(map.current);

    return () => {
      map.current.removeLayer(ridesLayer);
    };
  }, [rides, showRides]);

  return (
    <div style={{ height: "500px", width: "100%", position: "relative" }}>
      <div className="map-options">
        <div onClick={e => setShowHeatmap(!showHeatmap)}>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
          />
          <label>Heatmap</label>
        </div>
        <div onClick={e => setShowStations(!showStations)}>
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
          />
          <label>Stations</label>
        </div>
        <div onClick={e => setShowRides(!showRides)}>
          <input
            type="checkbox"
            checked={showRides}
            onChange={(e) => setShowRides(e.target.checked)}
          />
          <label>Trajets</label>
        </div>
      </div>
      <div id="map" />
    </div>
  );
}

export default Map;
