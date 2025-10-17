import stationInfo from "../station_information.json";

// const stations = stationInfo.data.stations;
const stationsById = stationInfo.data.stations.reduce((acc, station) => {
  acc[station.station_id.toString()] = station;
  return acc;
}, {});
console.log(stationsById);

// "10min" -> 10 * 60
export const parseDuration = (str) => {
  const match = str.match(/(\d+)([a-zA-Z]+)/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  console.log({value, unit});
  switch (unit) {
    case 'min':
      return value * 60;
    case 'h':
      return value * 3600;
    case 's':
      return value;
    default:
      return 0;
  }
}

export const processPoints = (walletOperations) => {
  if (!walletOperations?.length) return [];

  const hitStations = {}

  const addHit = (id) => {
    if (!hitStations[id]) hitStations[id] = 1;
    else hitStations[id] += 1;
  }

  for (const operation of walletOperations) {
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

export const processPoints2 = (walletOperations) => {
  if (!walletOperations?.length) return [];

  const hitStations = []

  const addHit = (id) => {
    const station = stationsById[id];
    if (!station) return;
    hitStations.push([station.lat, station.lon, 1]);
  }

  for (const operation of walletOperations) {
    addHit(operation.parameter3.departureStationId);
    addHit(operation.parameter3.arrivalStationId);
  }

  return hitStations;
}

export const getStat = (walletOperations) => {
  if (!walletOperations?.length) return {};

  return {
    totalRides: walletOperations.length,
    maxDistance: Math.max(...walletOperations.map(op => parseInt(op.parameter3.DISTANCE, 10))) / 1000,
    maxSpeed: Math.max(...walletOperations.map(op => op.parameter3.AVERAGE_SPEED)),
    totalDistance: walletOperations.reduce((acc, op) => acc + parseInt(op.parameter3.DISTANCE, 10), 0) / 1000,
    totalDuration: walletOperations.reduce((acc, op) => acc + parseDuration(op.quantityStr), 0) / 60,
    avgDuration: walletOperations.reduce((acc, op) => acc + parseDuration(op.quantityStr), 0) / walletOperations.length / 60,
    avgDistance: walletOperations.reduce((acc, op) => acc + parseInt(op.parameter3.DISTANCE, 10), 0) / walletOperations.length / 1000,
    avgSpeed: (walletOperations.reduce((acc, op) => acc + op.parameter3.AVERAGE_SPEED, 0) / walletOperations.length).toFixed(2),
  }
}