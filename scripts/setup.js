const fs = require("fs");

fetch("https://velib-metropole-opendata.smovengo.cloud/opendata/Velib_Metropole/station_information.json")
  .then(response => response.json())
  .then(data => {
    return data.data.stations.map(station => ({
      station_id: station.station_id,
      name: station.name,
      lat: station.lat,
      lon: station.lon,
    }))
  })
  .then(data => fs.writeFileSync("src/stations.json", JSON.stringify(data, null, null)))