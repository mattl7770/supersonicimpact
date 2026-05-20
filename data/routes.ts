import type { City, Route } from "@/lib/types";

const cities = {
  JFK: { iata: "JFK", name: "New York", country: "USA", flag: "🇺🇸" },
  LAX: { iata: "LAX", name: "Los Angeles", country: "USA", flag: "🇺🇸" },
  SFO: { iata: "SFO", name: "San Francisco", country: "USA", flag: "🇺🇸" },
  ORD: { iata: "ORD", name: "Chicago", country: "USA", flag: "🇺🇸" },
  BOS: { iata: "BOS", name: "Boston", country: "USA", flag: "🇺🇸" },
  SEA: { iata: "SEA", name: "Seattle", country: "USA", flag: "🇺🇸" },
  LHR: { iata: "LHR", name: "London", country: "UK", flag: "🇬🇧" },
  CDG: { iata: "CDG", name: "Paris", country: "France", flag: "🇫🇷" },
  FRA: { iata: "FRA", name: "Frankfurt", country: "Germany", flag: "🇩🇪" },
  DXB: { iata: "DXB", name: "Dubai", country: "UAE", flag: "🇦🇪" },
  SYD: { iata: "SYD", name: "Sydney", country: "Australia", flag: "🇦🇺" },
  HND: { iata: "HND", name: "Tokyo", country: "Japan", flag: "🇯🇵" },
  NRT: { iata: "NRT", name: "Tokyo", country: "Japan", flag: "🇯🇵" },
  SIN: { iata: "SIN", name: "Singapore", country: "Singapore", flag: "🇸🇬" },
} satisfies Record<string, City>;

export const routes: Route[] = [
  {
    id: "jfk-lhr",
    origin: cities.JFK,
    destination: cities.LHR,
    distanceNm: 3000,
    subsonicHours: 7.5,
    supersonicHours: 3.5,
  },
  {
    id: "jfk-cdg",
    origin: cities.JFK,
    destination: cities.CDG,
    distanceNm: 3150,
    subsonicHours: 7.0,
    supersonicHours: 3.5,
  },
  {
    id: "lax-syd",
    origin: cities.LAX,
    destination: cities.SYD,
    distanceNm: 6500,
    subsonicHours: 14.5,
    supersonicHours: 8.5,
    techStop: true,
    notes: "Beyond Overture's 4,250 NM range; assumes one technical stop.",
  },
  {
    id: "hnd-sea",
    origin: cities.HND,
    destination: cities.SEA,
    distanceNm: 4150,
    subsonicHours: 8.5,
    supersonicHours: 4.5,
  },
  {
    id: "jfk-lax",
    origin: cities.JFK,
    destination: cities.LAX,
    distanceNm: 2150,
    subsonicHours: 6.0,
    supersonicHours: 4.5,
    notes: "Domestic overland; uses Boom's Boomless Cruise (Mach 1.3).",
  },
  {
    id: "ord-lhr",
    origin: cities.ORD,
    destination: cities.LHR,
    distanceNm: 3450,
    subsonicHours: 8.0,
    supersonicHours: 4.0,
  },
  {
    id: "bos-lhr",
    origin: cities.BOS,
    destination: cities.LHR,
    distanceNm: 2850,
    subsonicHours: 6.75,
    supersonicHours: 3.5,
  },
  {
    id: "lhr-dxb",
    origin: cities.LHR,
    destination: cities.DXB,
    distanceNm: 2950,
    subsonicHours: 7.0,
    supersonicHours: 3.5,
  },
  {
    id: "sin-syd",
    origin: cities.SIN,
    destination: cities.SYD,
    distanceNm: 3400,
    subsonicHours: 7.75,
    supersonicHours: 4.0,
  },
  {
    id: "sfo-nrt",
    origin: cities.SFO,
    destination: cities.NRT,
    distanceNm: 4500,
    subsonicHours: 10.5,
    supersonicHours: 6.5,
    techStop: true,
    notes: "Beyond Overture's 4,250 NM range; assumes one technical stop.",
  },
  {
    id: "lhr-sin",
    origin: cities.LHR,
    destination: cities.SIN,
    distanceNm: 5900,
    subsonicHours: 12.5,
    supersonicHours: 7.5,
    techStop: true,
    notes: "Beyond Overture's 4,250 NM range; assumes one technical stop.",
  },
  {
    id: "jfk-fra",
    origin: cities.JFK,
    destination: cities.FRA,
    distanceNm: 3450,
    subsonicHours: 8.0,
    supersonicHours: 4.0,
  },
];

export function getRouteById(id: string): Route | undefined {
  return routes.find((r) => r.id === id);
}

export function getCuratedRouteByAirports(
  originIata: string,
  destinationIata: string,
): Route | undefined {
  const a = originIata.toUpperCase();
  const b = destinationIata.toUpperCase();
  return routes.find(
    (r) =>
      (r.origin.iata === a && r.destination.iata === b) ||
      (r.origin.iata === b && r.destination.iata === a),
  );
}
