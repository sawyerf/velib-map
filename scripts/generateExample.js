// const fs = require("fs");
import fs from "fs";

const stations = await fetch("https://velib-metropole-opendata.smovengo.cloud/opendata/Velib_Metropole/station_information.json")
  .then(response => response.json())
  .then(data => (data.data.stations
    .filter(station => station.stationCode < 10000)
    .sort(() => 0.5 - Math.random())
    .slice(0, 30)
  ));

const random = (number) => {
  return Math.floor(Math.random() * number);
}

const generateOpe = () => {
  return {
    startDate: new Date(Date.now() - random(3 * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    amountWithTax: Math.random() < 0.5 ? 0 : 0.37,
    parameter1: Math.random() < 0.5 ? 'yes' : 'no',
    parameter3: {
      DISTANCE: (Math.random() * 10000).toFixed(1),
      departureStationId: stations[random(3)].station_id,
      arrivalStationId: stations[random(stations.length)].station_id,
      SAVED_CARBON_DIOXIDE: Math.random() * 500,
      AVERAGE_SPEED: Math.random() * 25
    },
    quantityStr: `${Math.floor(Math.random() * 30)}min`
  }
}

fs.writeFileSync("example.json", JSON.stringify({
  walletOperations: Array.from({ length: 200 }, () => generateOpe())
}, null, 2));