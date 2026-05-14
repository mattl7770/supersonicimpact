const RAD = Math.PI / 180;

/**
 * The subsolar point — the spot on Earth directly under the sun at `date`.
 * Latitude is the sun's declination, longitude is the local meridian where
 * solar noon is occurring.
 */
export function getSubsolarPoint(date: Date): { lat: number; lng: number } {
  // SunCalc gives sun position relative to an observer at (lat, lng).
  // To find where the sun is overhead we look for the place where altitude
  // is maximal (i.e. directly above). The math: declination is the latitude
  // where the sun is overhead, and the longitude is determined by UTC time.
  const dayMs = 1000 * 60 * 60 * 24;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / dayMs);
  // Spencer (1971) approximation of solar declination.
  const gamma =
    (2 * Math.PI * (dayOfYear - 1 + (date.getUTCHours() - 12) / 24)) / 365;
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const lat = decl / RAD;

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // 15° of longitude per hour; subsolar longitude is 12:00 UTC meridian shifted east.
  let lng = (12 - utcHours) * 15;
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;

  return { lat, lng };
}

/** Convert lat/lng on a unit sphere to a (x, y, z) direction vector. */
export function lngLatToVec3([lng, lat]: [number, number]): [number, number, number] {
  const phi = (90 - lat) * RAD;
  const theta = (lng + 180) * RAD;
  return [
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ];
}

export function getSunDirection(date: Date): [number, number, number] {
  const { lat, lng } = getSubsolarPoint(date);
  return lngLatToVec3([lng, lat]);
}
