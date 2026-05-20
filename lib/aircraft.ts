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
  /**
   * Whether the aircraft has a designed Boomless Cruise capability (quiet
   * supersonic over land). When false, over-land legs drop to subsonic in the
   * flight-time math, regardless of `boomlessCruiseMach`. The slider for
   * Boomless Cruise hides when this is false.
   */
  hasBoomlessCruise: boolean;
  /** Passenger capacity. */
  passengers: number;
  era: AircraftEra;
};

export const ERA_LABEL: Record<AircraftEra, string> = {
  concept: "Concept",
  historical: "Historical",
  "in-service": "In Service",
  "in-development": "In Development",
};

export const aircraft: Aircraft[] = [
  {
    id: "overture",
    name: "Overture",
    manufacturer: "Boom",
    topMach: 1.7,
    rangeNm: 4250,
    boomlessCruiseMach: 1.3,
    hasBoomlessCruise: true,
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
    hasBoomlessCruise: false,
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
    hasBoomlessCruise: false,
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
    hasBoomlessCruise: true,
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
    hasBoomlessCruise: false,
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
    hasBoomlessCruise: true,
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
    hasBoomlessCruise: true,
    passengers: 18,
    era: "concept",
  },
];

export const DEFAULT_AIRCRAFT = aircraft[0];

/**
 * Sentinel "preset" used when the user has dragged a slider away from any
 * stock aircraft. Not a member of `aircraft` — surfaced separately so call
 * sites that iterate the preset list aren't accidentally tripped by it.
 * Values mirror Overture so the first auto-switch is visually a no-op.
 */
export const CUSTOM_AIRCRAFT: Aircraft = {
  id: "custom",
  name: "Custom",
  manufacturer: "Configure your own",
  topMach: DEFAULT_AIRCRAFT.topMach,
  rangeNm: DEFAULT_AIRCRAFT.rangeNm,
  boomlessCruiseMach: DEFAULT_AIRCRAFT.boomlessCruiseMach,
  hasBoomlessCruise: true,
  passengers: DEFAULT_AIRCRAFT.passengers,
  era: DEFAULT_AIRCRAFT.era,
};

export function getAircraftById(id: string): Aircraft | undefined {
  if (id === CUSTOM_AIRCRAFT.id) return CUSTOM_AIRCRAFT;
  return aircraft.find((a) => a.id === id);
}

/** Knots equivalent of one Mach at typical cruise altitude (35–55k ft). */
export const KTS_PER_MACH = 576;
