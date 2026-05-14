export type AircraftEra =
  | "concept"
  | "historical"
  | "in-service"
  | "in-development";

export type Aircraft = {
  id: string;
  name: string;
  manufacturer: string;
  /** Top cruise speed in Mach. */
  topMach: number;
  /** Maximum range without a tech stop, nautical miles. */
  rangeNm: number;
  /** Mach number permitted over populated land (Boomless / subsonic). */
  boomlessCruiseMach: number;
  /** Passenger capacity. */
  passengers: number;
  era: AircraftEra;
};

export const aircraft: Aircraft[] = [
  {
    id: "overture",
    name: "Overture",
    manufacturer: "Boom",
    topMach: 1.7,
    rangeNm: 4250,
    boomlessCruiseMach: 1.3,
    passengers: 80,
    era: "in-development",
  },
  {
    id: "concorde",
    name: "Concorde",
    manufacturer: "BAC / Aérospatiale",
    topMach: 2.04,
    rangeNm: 3550,
    boomlessCruiseMach: 1.0,
    passengers: 100,
    era: "historical",
  },
  {
    id: "tu-144",
    name: "Tu-144",
    manufacturer: "Tupolev",
    topMach: 2.0,
    rangeNm: 3500,
    boomlessCruiseMach: 1.0,
    passengers: 140,
    era: "historical",
  },
  {
    id: "x-59",
    name: "X-59 QueSST",
    manufacturer: "NASA / Lockheed Martin",
    topMach: 1.4,
    rangeNm: 1850,
    boomlessCruiseMach: 1.4,
    passengers: 1,
    era: "in-development",
  },
  {
    id: "xb-1",
    name: "XB-1",
    manufacturer: "Boom",
    topMach: 2.2,
    rangeNm: 1600,
    boomlessCruiseMach: 1.0,
    passengers: 3,
    era: "in-development",
  },
  {
    id: "aerion-as2",
    name: "AS2",
    manufacturer: "Aerion",
    topMach: 1.4,
    rangeNm: 4750,
    boomlessCruiseMach: 1.2,
    passengers: 12,
    era: "concept",
  },
  {
    id: "spike-s512",
    name: "S-512",
    manufacturer: "Spike",
    topMach: 1.6,
    rangeNm: 6200,
    boomlessCruiseMach: 1.2,
    passengers: 18,
    era: "concept",
  },
  {
    id: "787-9",
    name: "787-9",
    manufacturer: "Boeing",
    topMach: 0.85,
    rangeNm: 7635,
    boomlessCruiseMach: 0.85,
    passengers: 290,
    era: "in-service",
  },
  {
    id: "777-300er",
    name: "777-300ER",
    manufacturer: "Boeing",
    topMach: 0.84,
    rangeNm: 7370,
    boomlessCruiseMach: 0.84,
    passengers: 396,
    era: "in-service",
  },
  {
    id: "a350-900",
    name: "A350-900",
    manufacturer: "Airbus",
    topMach: 0.85,
    rangeNm: 8100,
    boomlessCruiseMach: 0.85,
    passengers: 315,
    era: "in-service",
  },
  {
    id: "a380-800",
    name: "A380-800",
    manufacturer: "Airbus",
    topMach: 0.85,
    rangeNm: 8200,
    boomlessCruiseMach: 0.85,
    passengers: 525,
    era: "in-service",
  },
];

export const DEFAULT_AIRCRAFT = aircraft[0];

export function getAircraftById(id: string): Aircraft | undefined {
  return aircraft.find((a) => a.id === id);
}

/** Knots equivalent of one Mach at typical cruise altitude (35–55k ft). */
export const KTS_PER_MACH = 576;
