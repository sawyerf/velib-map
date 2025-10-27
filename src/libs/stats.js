import stationsData from "../stations.json";

// const stations = stationInfo.data.stations;
const stationsById = stationsData.reduce((acc, station) => {
  acc[station.station_id.toString()] = station;
  return acc;
}, {});

// "10min" -> 10 * 60
export const parseDuration = (str) => {
  const match = str.match(/(\d+)([a-zA-Z]+)/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
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

export const getHitStations = (walletOperations) => {
  const hitStations = {};
  for (const operation of walletOperations) {
    const departureId = operation.parameter3.departureStationId;
    const arrivalId = operation.parameter3.arrivalStationId;
    hitStations[departureId] = (hitStations[departureId] || 0) + 1;
    hitStations[arrivalId] = (hitStations[arrivalId] || 0) + 1;
  }
  return hitStations;
}

export const processPoints = (walletOperations) => {
  if (!walletOperations?.length) return [];

  const hitStations = getHitStations(walletOperations);

  const maxHit = Math.max(...Object.values(hitStations));

  return Object.entries(hitStations).map(([stationId, hits]) => {
    const station = stationsById[stationId];
    if (!station) return null;
    return [
      station.lat,
      station.lon,
      (hits / maxHit) * 100
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
    amount: walletOperations.reduce((acc, op) => acc + op.amountWithTax, 0),
    avgAmount: walletOperations.reduce((acc, op) => acc + op.amountWithTax, 0) / walletOperations.length,
    savedCo2: walletOperations.reduce((acc, op) => acc + op.parameter3.SAVED_CARBON_DIOXIDE, 0) / 1000,
  }
}

export const getStatsByDay = (walletOperations) => {
  if (!walletOperations?.length) return {};
  const statsByDay = {};
  for (const op of walletOperations) {
    const date = new Date(op.startDate);
    const dayKey = date.toISOString().split('T')[0];
    if (!statsByDay[dayKey]) statsByDay[dayKey] = 0;
    statsByDay[dayKey] += 1;
  }
  return statsByDay;
}

export const getStatsByHour = (walletOperations) => {
  if (!walletOperations?.length) return [];
  const statsByHour = {};
  for (const op of walletOperations) {
    const date = new Date(op.startDate);
    const hourKey = date.getHours();
    statsByHour[hourKey] = {
      count: (statsByHour[hourKey]?.count || 0) + 1,
      totalDistance: (statsByHour[hourKey]?.totalDistance || 0) + parseInt(op.parameter3.DISTANCE, 10),
      totalDuration: (statsByHour[hourKey]?.totalDuration || 0) + parseDuration(op.quantityStr),
    }
  }
  return Array.from({ length: 24 }).map((_, hour) => ({
    hour,
    ...(statsByHour[hour] || { count: 0, totalDistance: 0, totalDuration: 0 }),
  }));
}

export const filterOpe = (operations, typeVelib, startDate, endDate) => {
  console.log("Filtering operations:", { typeVelib, startDate, endDate });
  let result = operations

  if (typeVelib === "ELECTRIC") result = result.filter(op => op.parameter1 === 'yes')
  else if (typeVelib === "MECHANICAL") result = result.filter(op => op.parameter1 === 'no')

  if (startDate) result = result.filter(op => new Date(op.startDate) >= new Date(startDate))
  if (endDate) result = result.filter(op => new Date(op.startDate) <= new Date(endDate))

  return result;
}

export const getTopStations = (walletOperations, topN = 5) => {
  if (!walletOperations?.length) return [];
  const hitStations = getHitStations(walletOperations);
  const stationsArray = Object.entries(hitStations).map(([stationId, hits]) => {
    const station = stationsById[stationId];
    return {
      id: stationId,
      name: station ? station.name : "Inconnu",
      hits,
    };
  });
  stationsArray.sort((a, b) => b.hits - a.hits);
  return stationsArray.slice(0, topN);
}

export default {
  parseDuration,
  processPoints,
  getStat,
  getStatsByDay,
  filterOpe,
  getTopStations,
  getStatsByHour,
  processPoints2,
};