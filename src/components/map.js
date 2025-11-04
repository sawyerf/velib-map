// App.jsx
import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function Map({ points, rides }) {
  const map = React.useRef(null);
  const [showRides, setShowRides] = React.useState(false);

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
    if (points.length === 0) return;

    // 4️⃣ Ajouter la couche heatmap
    const heat = L.heatLayer(points, {
      radius: 20,      // Taille d’influence
      blur: 15,        // Lissage
      maxZoom: 17,     // Zoom max où la chaleur est visible
      gradient: {      // Couleurs
        0.1: "blue",
        0.3: "lime",
        0.6: "orange",
        0.9: "red",
      },
    });

    const stations = L.layerGroup();

    points.forEach(([lat, lon, intensity]) => {
      L.circleMarker([lat, lon], {
        radius: 1,
        color: 'black',
        fillColor: 'black',
      }).addTo(stations);
    });

    stations.addTo(map.current);
    heat.addTo(map.current);

    return () => {
      map.current.removeLayer(heat);
      map.current.removeLayer(stations);
    };
  }, [points]);

  React.useEffect(() => {
    if (!map.current) return;
    if (!showRides) return;
    if (rides.length === 0) return;

    const ridesLayer = L.layerGroup();

    rides.forEach((ride) => {
      console.log(ride);
      L.polyline(ride, {
        color: 'blue',
        weight: 4,
        opacity: 0.3
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
      <div
        style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 1000 }}
        onClick={e => setShowRides(!showRides)}
      >
        <input
          type="checkbox"
          checked={showRides}
          onChange={(e) => setShowRides(e.target.checked)}
        />
        <label
          style={{ marginLeft: "8px", color: "black", fontWeight: "bold", textShadow: "1px 1px 2px white" }}
        >Trajets</label>
      </div>
      <div
        id="map"
        style={{
          height: "100%",
          width: "100%",
          minHeight: "1px",
          minWidth: "1px",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}

export default Map;
