import { haversineNm } from "./geo";
import type { Route } from "./types";
import type { Airport } from "./airports";

const OVERTURE_RANGE_NM = 4250;
const GROUND_OVERHEAD_H = 0.4;
const CLIMB_DESCENT_H = 0.5;
const TECH_STOP_H = 1.5;
const CRUISE_NM_DEDUCTION = 250;
const SUPERSONIC_KTS = 980;
const SUBSONIC_CRUISE_KTS = 480;
const SUBSONIC_OVERHEAD_H = 1.5;

export function computeSupersonicHours(distanceNm: number): number {
  const techStop = distanceNm > OVERTURE_RANGE_NM ? TECH_STOP_H : 0;
  const cruise =
    Math.max(0, distanceNm - CRUISE_NM_DEDUCTION) / SUPERSONIC_KTS;
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
 * Returns a Route for the given origin/destination airport pair.
 * If a curated route exists in `curated` (either direction), reuse its hand-set
 * subsonic/supersonic hours. Otherwise synthesize one from haversine + formulas.
 */
export function buildRouteForPair(
  origin: Airport,
  destination: Airport,
  curated: Route[],
): Route {
  const curatedRoute = curated.find(
    (r) =>
      curatedKey(r.origin.iata, r.destination.iata) ===
        curatedKey(origin.iata, destination.iata) ||
      curatedKey(r.destination.iata, r.origin.iata) ===
        curatedKey(origin.iata, destination.iata),
  );

  if (curatedRoute) {
    const flipped =
      curatedRoute.origin.iata !== origin.iata
        ? {
            ...curatedRoute,
            id: `${origin.iata}-${destination.iata}`.toLowerCase(),
            origin: airportToCity(origin),
            destination: airportToCity(destination),
          }
        : curatedRoute;
    return flipped;
  }

  const distanceNm = Math.round(
    haversineNm([origin.lng, origin.lat], [destination.lng, destination.lat]),
  );
  const supersonicHours =
    Math.round(computeSupersonicHours(distanceNm) * 4) / 4;
  const subsonicHours = Math.round(computeSubsonicHours(distanceNm) * 4) / 4;

  return {
    id: `${origin.iata}-${destination.iata}`.toLowerCase(),
    origin: airportToCity(origin),
    destination: airportToCity(destination),
    distanceNm,
    subsonicHours,
    supersonicHours,
    techStop: distanceNm > OVERTURE_RANGE_NM,
    notes:
      distanceNm > OVERTURE_RANGE_NM
        ? "Beyond Overture's 4,250 NM range — assumes one technical stop. Estimated, not a curated route."
        : "Estimated — not a curated route. See methodology for the formulas used.",
  };
}

export function isCurated(origin: string, destination: string, curated: Route[]): boolean {
  return curated.some(
    (r) =>
      curatedKey(r.origin.iata, r.destination.iata) ===
        curatedKey(origin, destination) ||
      curatedKey(r.destination.iata, r.origin.iata) ===
        curatedKey(origin, destination),
  );
}
