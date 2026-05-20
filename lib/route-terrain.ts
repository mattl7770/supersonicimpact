/**
 * For every route, figure out what fraction of the great-circle arc passes
 * over populated land. That fraction drives the Boomless Cruise math in
 * `lib/flight-time.ts`: over-land portions cruise at `boomlessCruiseMach`
 * (if the aircraft can do quiet supersonic over land) or drop to subsonic
 * (if it can't).
 *
 * Implementation: sample N points along the great circle (SLERP via
 * `greatCircleArc`), test each against the merged world-atlas country
 * polygons with `d3-geo.geoContains`. Lakes and inland seas read as
 * "not land" because they're holes in the country polygons — that's the
 * right behavior here since sonic-boom regulations are about populated
 * land underneath.
 */

import { geoContains, type ExtendedFeatureCollection } from "d3-geo";
import { feature } from "topojson-client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore world-atlas ships .json without types
import worldAtlas from "world-atlas/countries-110m.json";

import { greatCircleArc, type LngLat } from "./geo";

const COUNTRIES = feature(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  worldAtlas as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (worldAtlas as any).objects.countries,
) as unknown as ExtendedFeatureCollection;

const SAMPLE_COUNT = 64;
const cache = new Map<string, number>();

function cacheKey(a: LngLat, b: LngLat): string {
  // Round to 2 decimal places so visually-identical airport pairs share a cache entry.
  const fmt = (n: number) => n.toFixed(2);
  return `${fmt(a[0])},${fmt(a[1])}|${fmt(b[0])},${fmt(b[1])}`;
}

/**
 * Land fraction (0–1) for the great-circle arc between two points.
 * 0 = entirely over water; 1 = entirely over land; 0.5 = half-and-half.
 *
 * Cached by rounded coordinates, so repeat calls (every render) are free.
 */
export function computeLandFraction(origin: LngLat, destination: LngLat): number {
  const key = cacheKey(origin, destination);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const arc = greatCircleArc(origin, destination, SAMPLE_COUNT);
  let landSamples = 0;
  for (const point of arc) {
    if (geoContains(COUNTRIES, point as [number, number])) landSamples++;
  }
  const fraction = landSamples / arc.length;
  cache.set(key, fraction);
  return fraction;
}
