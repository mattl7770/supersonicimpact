export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatDistance(nm: number): string {
  const km = Math.round(nm * 1.852);
  return `${nm.toLocaleString()} NM · ${km.toLocaleString()} km`;
}

export function compressionRatio(subsonic: number, supersonic: number): number {
  if (supersonic === 0) return 1;
  return subsonic / supersonic;
}
