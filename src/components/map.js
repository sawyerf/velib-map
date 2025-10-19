// App.jsx
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function Map({ points }) {
  useEffect(() => {
    // 1️⃣ Initialiser la carte centrée sur Paris
    const map = L.map("map", {
      center: [48.8566, 2.3522],
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
    });

    // 2️⃣ Ajouter le fond OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // 3️⃣ Exemple de points [lat, lon, intensité]
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
    stations.addTo(map);
    points.forEach(([lat, lon, intensity]) => {
      L.circleMarker([lat, lon], {
        radius: 1,
        color: 'black',
        fillColor: 'black',
      }).addTo(stations);
    });

    stations.addTo(map);


    heat.addTo(map);

    // 5️⃣ Nettoyer la carte à la destruction du composant
    return () => map.remove();
  }, [points]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <div
        id="map"
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}

export default Map;
