/**
 * CO₂ math for the Sustainability section.
 *
 * All baselines below are sourced figures (see About > Methodology for the
 * full citation list). Numbers are intentionally fixed constants so the file
 * stays pure and trivially testable.
 *
 * Subsonic baseline:
 *   60 g CO₂ / pax-km — 787-9 / A350-900 economy, ICCT 2020 data on commercial
 *   aviation emissions, cross-referenced with Wikipedia's fuel-economy table.
 *
 * Supersonic baseline:
 *   420 g CO₂ / pax-km — midpoint of ICCT/MIT's December 2024 finding that a
 *   commercial SST like Overture burns 5–8× the fuel per passenger of a 787-9.
 *   Overture has not flown; this is a projected, defensible figure.
 *
 * SAF lifecycle reduction:
 *   80% — IATA's "up to 80%" cap on currently-available HEFA pathways. Power-
 *   to-Liquid can reach 94% but isn't at commercial scale. Boom's "net-zero"
 *   claim relies on book-and-claim + carbon-removal accounting on top of
 *   physical combustion, which the slider deliberately does NOT model.
 *
 * Equivalents:
 *   Average US car: 248 g CO₂ / km (EPA, 2023 update).
 *   Mature tree CO₂ absorption: ~21 kg / year (One Tree Planted, heuristic).
 */

export const SUBSONIC_CO2_G_PER_PAX_KM = 60;
export const SUPERSONIC_CO2_G_PER_PAX_KM = 420;
export const SAF_LIFECYCLE_REDUCTION = 0.8;
export const CAR_CO2_G_PER_KM = 248;
export const TREE_CO2_KG_PER_YEAR = 21;
export const NM_TO_KM = 1.852;
export const KM_TO_MI = 0.621371;

/** Fallback route used when no origin/destination is selected (JFK → LHR). */
export const DEFAULT_DISTANCE_NM = 3000;

/** Round trip — every figure in this section is round-trip per passenger. */
const ROUND_TRIP = 2;

export type SustainabilityInputs = {
  /** SAF blend, 0–1. */
  safBlend: number;
  /** Great-circle distance for the active route, nautical miles. */
  distanceNm: number;
};

export type SustainabilityOutputs = {
  distanceKm: number;
  effectiveSupersonicGramsPerPaxKm: number;
  lifecycleReductionPct: number;
  subsonicKgPerPaxRoundTrip: number;
  supersonicKgPerPaxRoundTrip: number;
  multiplierVsSubsonic: number;
  carMilesEquivalent: number;
  treeYearsEquivalent: number;
};

export const DEFAULT_INPUTS: SustainabilityInputs = {
  safBlend: 0,
  distanceNm: DEFAULT_DISTANCE_NM,
};

export const INPUT_RANGES = {
  safBlend: { min: 0, max: 1, step: 0.01 },
} as const;

export function computeSustainabilityImpact(
  i: SustainabilityInputs,
): SustainabilityOutputs {
  const distanceKm = i.distanceNm * NM_TO_KM;

  // Linear blend: SAF portion gets the lifecycle reduction, Jet A portion
  // emits the full baseline. (60% SAF * 80% reduction = 48% effective cut.)
  const blendReduction = i.safBlend * SAF_LIFECYCLE_REDUCTION;
  const effectiveSupersonicGramsPerPaxKm =
    SUPERSONIC_CO2_G_PER_PAX_KM * (1 - blendReduction);

  const subsonicGramsRoundTrip =
    SUBSONIC_CO2_G_PER_PAX_KM * distanceKm * ROUND_TRIP;
  const supersonicGramsRoundTrip =
    effectiveSupersonicGramsPerPaxKm * distanceKm * ROUND_TRIP;

  const subsonicKgPerPaxRoundTrip = subsonicGramsRoundTrip / 1000;
  const supersonicKgPerPaxRoundTrip = supersonicGramsRoundTrip / 1000;

  const multiplierVsSubsonic =
    subsonicKgPerPaxRoundTrip > 0
      ? supersonicKgPerPaxRoundTrip / subsonicKgPerPaxRoundTrip
      : 0;

  // Car: g of CO₂ → km of driving → miles.
  const carKmEquivalent = supersonicGramsRoundTrip / CAR_CO2_G_PER_KM;
  const carMilesEquivalent = carKmEquivalent * KM_TO_MI;

  // Tree-years: kg of CO₂ / (kg of CO₂ absorbed per tree per year).
  const treeYearsEquivalent = supersonicKgPerPaxRoundTrip / TREE_CO2_KG_PER_YEAR;

  return {
    distanceKm,
    effectiveSupersonicGramsPerPaxKm,
    lifecycleReductionPct: blendReduction * 100,
    subsonicKgPerPaxRoundTrip,
    supersonicKgPerPaxRoundTrip,
    multiplierVsSubsonic,
    carMilesEquivalent,
    treeYearsEquivalent,
  };
}

/**
 * Formatter for CO₂ mass: kg under 1 tonne, tonnes (1 decimal) over.
 */
export function formatKgCo2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t`;
  }
  return `${Math.round(kg).toLocaleString()} kg`;
}

/**
 * Formatter for the "5.2×" multiplier card.
 */
export function formatMultiplier(x: number): string {
  if (!Number.isFinite(x) || x <= 0) return "—";
  return `${x.toFixed(1)}×`;
}

/**
 * Formatter for tangible counts (miles, tree-years). Compact for huge values.
 */
export function formatCount(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  return Math.round(n).toLocaleString();
}
