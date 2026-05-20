/**
 * For every route, figure out which sections of the great-circle arc pass
 * over populated land. The result drives both:
 *
 *  1. The Boomless Cruise math in `lib/flight-time.ts`: over-land legs
 *     cruise at `boomlessCruiseMach` (if the aircraft can do quiet supersonic
 *     over land) or drop to subsonic (if it can't).
 *  2. The arc coloring on the globe + flat map + the inline cruise-profile
 *     bar in the Route Comparator, so users can see *where* on the route
 *     the aircraft slows down.
 *
 * Implementation: sample N points along the great circle (SLERP via
 * `greatCircleArc`), test each against the merged world-atlas country
 * polygons with `d3-geo.geoContains`. Lakes and inland seas read as
 * "not land" because they're holes in the country polygons, which is the
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

export type RouteSegment = {
  /** Fractional progress along the great-circle arc, 0–1. */
  startProgress: number;
  endProgress: number;
  isLand: boolean;
};

type CacheEntry = {
  segments: RouteSegment[];
  landFraction: number;
};

const cache = new Map<string, CacheEntry>();

function cacheKey(a: LngLat, b: LngLat): string {
  const fmt = (n: number) => n.toFixed(2);
  return `${fmt(a[0])},${fmt(a[1])}|${fmt(b[0])},${fmt(b[1])}`;
}

function computeFor(origin: LngLat, destination: LngLat): CacheEntry {
  const arc = greatCircleArc(origin, destination, SAMPLE_COUNT);
  const N = arc.length - 1; // number of intervals
  const samples = arc.map((pt) =>
    geoContains(COUNTRIES, pt as [number, number]),
  );

  const segments: RouteSegment[] = [];
  let segStartProgress = 0;
  let segIsLand = samples[0];
  let landSamples = segIsLand ? 1 : 0;

  for (let i = 1; i < samples.length; i++) {
    if (samples[i]) landSamples++;
    if (samples[i] !== segIsLand) {
      // Place the boundary at the midpoint between the two differing samples.
      const transition = (i - 0.5) / N;
      segments.push({
        startProgress: segStartProgress,
        endProgress: transition,
        isLand: segIsLand,
      });
      segStartProgress = transition;
      segIsLand = samples[i];
    }
  }
  segments.push({
    startProgress: segStartProgress,
    endProgress: 1,
    isLand: segIsLand,
  });

  return {
    segments,
    landFraction: landSamples / samples.length,
  };
}

function getEntry(origin: LngLat, destination: LngLat): CacheEntry {
  const key = cacheKey(origin, destination);
  const cached = cache.get(key);
  if (cached) return cached;
  const entry = computeFor(origin, destination);
  cache.set(key, entry);
  return entry;
}

/**
 * Land fraction (0–1) for the great-circle arc between two points.
 * 0 = entirely over water; 1 = entirely over land; 0.5 = half-and-half.
 */
export function computeLandFraction(origin: LngLat, destination: LngLat): number {
  return getEntry(origin, destination).landFraction;
}

/**
 * True if `[lng, lat]` falls inside any country polygon. Used by the map
 * canvases to color individual arc segments without re-importing world-atlas.
 */
export function isPointOverLand(point: LngLat): boolean {
  return geoContains(COUNTRIES, point as [number, number]);
}

/**
 * Ordered land/water segments along the great-circle arc. Consecutive
 * segments alternate `isLand`, and together they cover [0, 1] without gaps.
 */
export function computeRouteSegments(
  origin: LngLat,
  destination: LngLat,
): RouteSegment[] {
  return getEntry(origin, destination).segments;
}
