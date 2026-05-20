import { haversineNm } from "./geo";
import type { Route } from "./types";
import type { Airport } from "./airports";
import { KTS_PER_MACH } from "./aircraft";
import type { AircraftConfig } from "./aircraft-context";
import { computeLandFraction } from "./route-terrain";

const GROUND_OVERHEAD_H = 0.4;
const CLIMB_DESCENT_H = 0.5;
const TECH_STOP_H = 1.5;
const CRUISE_NM_DEDUCTION = 250;
const SUBSONIC_CRUISE_KTS = 480;
const SUBSONIC_OVERHEAD_H = 1.5;
const OVERTURE_RANGE_NM = 4250;

/** Default config matches stock Overture. Used when callers don't pass a config. */
const OVERTURE_DEFAULT: AircraftConfig = {
  topMach: 1.7,
  rangeNm: 4250,
  boomlessCruiseMach: 1.3,
  hasBoomlessCruise: true,
  passengers: 80,
};

/**
 * Block time for a supersonic flight given the route's land-fraction.
 *
 * `landFraction` is 0–1. Over-water segments cruise at `topMach`; over-land
 * segments cruise at `boomlessCruiseMach` if the aircraft has a designed
 * Boomless Cruise capability, otherwise they drop to subsonic (the real-world
 * Concorde / Tu-144 restriction).
 */
export function computeSupersonicHours(
  distanceNm: number,
  config: AircraftConfig = OVERTURE_DEFAULT,
  landFraction = 0,
): number {
  const cruiseNm = Math.max(0, distanceNm - CRUISE_NM_DEDUCTION);
  const overLandNm = cruiseNm * Math.max(0, Math.min(1, landFraction));
  const overWaterNm = cruiseNm - overLandNm;

  const overWaterKts = Math.max(1, config.topMach * KTS_PER_MACH);
  const overLandKts = config.hasBoomlessCruise
    ? Math.max(1, config.boomlessCruiseMach * KTS_PER_MACH)
    : SUBSONIC_CRUISE_KTS;

  const cruise = overWaterNm / overWaterKts + overLandNm / overLandKts;
  const techStop = distanceNm > config.rangeNm ? TECH_STOP_H : 0;
  return GROUND_OVERHEAD_H + CLIMB_DESCENT_H + techStop + cruise;
}

export function computeSubsonicHours(distanceNm: number): number {
  return distanceNm / SUBSONIC_CRUISE_KTS + SUBSONIC_OVERHEAD_H;
}

function airportToCity(a: Airport) {
  return {
    iata: a.iata,
    name: a.city,
    country: a.country,
    flag: a.flag,
  };
}

function curatedKey(origin: string, destination: string): string {
  return `${origin.toLowerCase()}-${destination.toLowerCase()}`;
}

/**
 * Returns a Route for the given origin/destination airport pair. Always
 * computes via formula now — curated `subsonicHours` / `supersonicHours` are
 * no longer authoritative because the formula correctly handles per-route
 * land fraction and per-aircraft Boomless Cruise behavior. Curated notes are
 * preserved when no formula-generated note overrides them.
 */
export function buildRouteForPair(
  origin: Airport,
  destination: Airport,
  curated: Route[],
  config: AircraftConfig = OVERTURE_DEFAULT,
): Route {
  const distanceNm = Math.round(
    haversineNm([origin.lng, origin.lat], [destination.lng, destination.lat]),
  );
  const landFraction = computeLandFraction(
    [origin.lng, origin.lat],
    [destination.lng, destination.lat],
  );

  const supersonicHours = roundQ(
    computeSupersonicHours(distanceNm, config, landFraction),
  );
  const subsonicHours = roundQ(computeSubsonicHours(distanceNm));
  const beyondRange = distanceNm > config.rangeNm;

  const curatedMatch = curated.find(
    (r) =>
      curatedKey(r.origin.iata, r.destination.iata) ===
        curatedKey(origin.iata, destination.iata) ||
      curatedKey(r.destination.iata, r.origin.iata) ===
        curatedKey(origin.iata, destination.iata),
  );

  const formulaNote = beyondRange
    ? `Beyond this aircraft's ${config.rangeNm.toLocaleString()} NM range; assumes one technical stop.`
    : undefined;

  return {
    id: `${origin.iata}-${destination.iata}`.toLowerCase(),
    origin: airportToCity(origin),
    destination: airportToCity(destination),
    distanceNm,
    subsonicHours,
    supersonicHours,
    techStop: beyondRange,
    notes: formulaNote ?? curatedMatch?.notes,
  };
}

function roundQ(h: number): number {
  return Math.round(h * 4) / 4;
}

export function isCurated(
  origin: string,
  destination: string,
  curated: Route[],
): boolean {
  return curated.some(
    (r) =>
      curatedKey(r.origin.iata, r.destination.iata) ===
        curatedKey(origin, destination) ||
      curatedKey(r.destination.iata, r.origin.iata) ===
        curatedKey(origin, destination),
  );
}

export { OVERTURE_RANGE_NM };
