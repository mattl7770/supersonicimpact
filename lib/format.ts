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

function compact(n: number): { value: string; suffix: string } {
  const abs = Math.abs(n);
  if (abs >= 1e12) return { value: (n / 1e12).toFixed(2), suffix: "T" };
  if (abs >= 1e9) return { value: (n / 1e9).toFixed(2), suffix: "B" };
  if (abs >= 1e6) return { value: (n / 1e6).toFixed(2), suffix: "M" };
  if (abs >= 1e3) return { value: (n / 1e3).toFixed(1), suffix: "K" };
  return { value: Math.round(n).toString(), suffix: "" };
}

function trimTrailingZeros(s: string): string {
  if (!s.includes(".")) return s;
  return s.replace(/\.?0+$/, "");
}

export function formatUsdCompact(n: number): string {
  const { value, suffix } = compact(n);
  return `$${trimTrailingZeros(value)}${suffix}`;
}

export function formatCountCompact(n: number): string {
  const { value, suffix } = compact(n);
  return `${trimTrailingZeros(value)}${suffix}`;
}
