const EARTH_RADIUS_NM = 3440.065;
const RAD = Math.PI / 180;

export type LngLat = [number, number];

export function haversineNm(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = (lat2 - lat1) * RAD;
  const dLng = (lng2 - lng1) * RAD;
  const lat1r = lat1 * RAD;
  const lat2r = lat2 * RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.sqrt(h));
}

function lngLatToXyz([lng, lat]: LngLat): [number, number, number] {
  const lngR = lng * RAD;
  const latR = lat * RAD;
  return [
    Math.cos(latR) * Math.cos(lngR),
    Math.cos(latR) * Math.sin(lngR),
    Math.sin(latR),
  ];
}

function xyzToLngLat([x, y, z]: [number, number, number]): LngLat {
  return [Math.atan2(y, x) / RAD, Math.asin(z) / RAD];
}

export function greatCircleArc(
  a: LngLat,
  b: LngLat,
  segments = 96,
): LngLat[] {
  const p0 = lngLatToXyz(a);
  const p1 = lngLatToXyz(b);

  const dot = Math.min(1, Math.max(-1, p0[0] * p1[0] + p0[1] * p1[1] + p0[2] * p1[2]));
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);

  const points: LngLat[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let s0: number;
    let s1: number;
    if (sinOmega < 1e-6) {
      s0 = 1 - t;
      s1 = t;
    } else {
      s0 = Math.sin((1 - t) * omega) / sinOmega;
      s1 = Math.sin(t * omega) / sinOmega;
    }
    const x = s0 * p0[0] + s1 * p1[0];
    const y = s0 * p0[1] + s1 * p1[1];
    const z = s0 * p0[2] + s1 * p1[2];
    points.push(xyzToLngLat([x, y, z]));
  }
  return points;
}

/**
 * Split an arc at the antimeridian so flat (Mercator) rendering doesn't draw
 * a horizontal stripe across the whole map. Returns one or more LineStrings.
 */
export function splitAtAntimeridian(arc: LngLat[]): LngLat[][] {
  const segments: LngLat[][] = [];
  let current: LngLat[] = [arc[0]];

  for (let i = 1; i < arc.length; i++) {
    const [prevLng, prevLat] = arc[i - 1];
    const [lng, lat] = arc[i];
    const delta = lng - prevLng;

    if (Math.abs(delta) > 180) {
      const sign = delta > 0 ? -1 : 1;
      const prevAdj = prevLng + sign * 360;
      const fraction = (sign * 180 - prevLng) / (lng - prevAdj - prevLng);
      const latAt = prevLat + (lat - prevLat) * fraction;
      current.push([sign * 180, latAt]);
      segments.push(current);
      current = [[-sign * 180, latAt], [lng, lat]];
    } else {
      current.push([lng, lat]);
    }
  }
  segments.push(current);
  return segments;
}

export function bearing(from: LngLat, to: LngLat): number {
  const lat1 = from[1] * RAD;
  const lat2 = to[1] * RAD;
  const dLng = (to[0] - from[0]) * RAD;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) / RAD) + 360) % 360;
}

/**
 * Interpolate along an arc. progress ∈ [0,1]. Returns the LngLat at that
 * fraction of the densified line, plus the bearing of motion at that point.
 */
export function pointAtProgress(
  arc: LngLat[],
  progress: number,
): { point: LngLat; heading: number } {
  if (progress <= 0) {
    return { point: arc[0], heading: bearing(arc[0], arc[1] ?? arc[0]) };
  }
  if (progress >= 1) {
    const last = arc[arc.length - 1];
    const prev = arc[arc.length - 2] ?? last;
    return { point: last, heading: bearing(prev, last) };
  }
  const idxF = progress * (arc.length - 1);
  const i = Math.floor(idxF);
  const t = idxF - i;
  const a = arc[i];
  const b = arc[i + 1] ?? a;
  const point: LngLat = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return { point, heading: bearing(a, b) };
}
