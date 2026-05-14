import { haversineNm } from "./geo";
import type { Route } from "./types";
import type { Airport } from "./airports";
import { KTS_PER_MACH } from "./aircraft";
import type { AircraftConfig } from "./aircraft-context";

const GROUND_OVERHEAD_H = 0.4;
const CLIMB_DESCENT_H = 0.5;
const TECH_STOP_H = 1.5;
const CRUISE_NM_DEDUCTION = 250;
const SUBSONIC_CRUISE_KTS = 480;
const SUBSONIC_OVERHEAD_H = 1.5;
const OVERTURE_RANGE_NM = 4250;

const OVERTURE_DEFAULT: AircraftConfig = {
  topMach: 1.7,
  rangeNm: 4250,
  boomlessCruiseMach: 1.3,
  passengers: 80,
};

export function computeSupersonicHours(
  distanceNm: number,
  config: AircraftConfig = OVERTURE_DEFAULT,
): number {
  const cruiseKts = config.topMach * KTS_PER_MACH;
  const techStop = distanceNm > config.rangeNm ? TECH_STOP_H : 0;
  const cruise =
    Math.max(0, distanceNm - CRUISE_NM_DEDUCTION) / Math.max(1, cruiseKts);
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

function isOvertureDefault(config: AircraftConfig): boolean {
  return (
    Math.abs(config.topMach - OVERTURE_DEFAULT.topMach) < 0.01 &&
    Math.abs(config.rangeNm - OVERTURE_DEFAULT.rangeNm) < 50 &&
    Math.abs(config.boomlessCruiseMach - OVERTURE_DEFAULT.boomlessCruiseMach) <
      0.01
  );
}

/**
 * Returns a Route for the given origin/destination airport pair.
 *
 * - If `aircraft` matches stock Overture and a curated route exists, reuse
 *   its hand-set supersonic/subsonic hours (authoritative).
 * - Otherwise, always recompute from formulas. Curated values would be wrong
 *   for non-stock aircraft (e.g. Concorde, custom slider settings).
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

  const curatedMatch = curated.find(
    (r) =>
      curatedKey(r.origin.iata, r.destination.iata) ===
        curatedKey(origin.iata, destination.iata) ||
      curatedKey(r.destination.iata, r.origin.iata) ===
        curatedKey(origin.iata, destination.iata),
  );

  if (curatedMatch && isOvertureDefault(config)) {
    const flipped =
      curatedMatch.origin.iata !== origin.iata
        ? {
            ...curatedMatch,
            id: `${origin.iata}-${destination.iata}`.toLowerCase(),
            origin: airportToCity(origin),
            destination: airportToCity(destination),
          }
        : curatedMatch;
    return flipped;
  }

  const supersonicHours = roundQ(computeSupersonicHours(distanceNm, config));
  const subsonicHours = roundQ(computeSubsonicHours(distanceNm));
  const beyondRange = distanceNm > config.rangeNm;

  return {
    id: `${origin.iata}-${destination.iata}`.toLowerCase(),
    origin: airportToCity(origin),
    destination: airportToCity(destination),
    distanceNm,
    subsonicHours,
    supersonicHours,
    techStop: beyondRange,
    notes: beyondRange
      ? `Beyond this aircraft's ${config.rangeNm.toLocaleString()} NM range — assumes one technical stop.`
      : undefined,
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
