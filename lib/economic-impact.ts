import { routes } from "@/data/routes";

const SAVED = routes.map((r) => r.subsonicHours - r.supersonicHours);
const SUBSONIC = routes.map((r) => r.subsonicHours);
const SUPERSONIC = routes.map((r) => r.supersonicHours);
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

export const AVG_HOURS_SAVED_PER_ONE_WAY = mean(SAVED);
export const AVG_SUBSONIC_HOURS_PER_ONE_WAY = mean(SUBSONIC);
export const AVG_SUPERSONIC_HOURS_PER_ONE_WAY = mean(SUPERSONIC);

export const GDP_MULTIPLIER = 3.5;
export const GLOBAL_AVIATION_GDP_USD = 4.1e12;
export const GLOBAL_AVIATION_JOBS = 86.5e6;
export const JOBS_PER_USD = GLOBAL_AVIATION_JOBS / GLOBAL_AVIATION_GDP_USD;

export type EconomicInputs = {
  passengersPerYear: number;
  routes: number;
  hourlyValueUsd: number;
  roundTripsPerPaxPerYear: number;
};

export type EconomicOutputs = {
  oneWayLegs: number;
  totalHoursSaved: number;
  directProductivity: number;
  multipliedGdpImpact: number;
  jobsSupported: number;
  perPaxAnnualBenefit: number;
  globalGdpShare: number;
  passengersPerRoute: number;
  subsonicTimeCost: number;
  supersonicTimeCost: number;
};

export const DEFAULT_INPUTS: EconomicInputs = {
  passengersPerYear: 2_000_000,
  routes: 20,
  hourlyValueUsd: 350,
  roundTripsPerPaxPerYear: 4,
};

export const INPUT_RANGES = {
  passengersPerYear: { min: 100_000, max: 10_000_000, step: 50_000 },
  routes: { min: 5, max: 100, step: 1 },
  hourlyValueUsd: { min: 100, max: 800, step: 10 },
  roundTripsPerPaxPerYear: { min: 1, max: 12, step: 1 },
} as const;

export function computeEconomicImpact(i: EconomicInputs): EconomicOutputs {
  const oneWayLegs = i.passengersPerYear * i.roundTripsPerPaxPerYear * 2;
  const totalHoursSaved = oneWayLegs * AVG_HOURS_SAVED_PER_ONE_WAY;
  const directProductivity = totalHoursSaved * i.hourlyValueUsd;
  const multipliedGdpImpact = directProductivity * GDP_MULTIPLIER;
  const jobsSupported = multipliedGdpImpact * JOBS_PER_USD;
  const perPaxAnnualBenefit =
    directProductivity / Math.max(1, i.passengersPerYear);
  const globalGdpShare = multipliedGdpImpact / GLOBAL_AVIATION_GDP_USD;
  const passengersPerRoute = i.passengersPerYear / Math.max(1, i.routes);
  const subsonicTimeCost =
    oneWayLegs * AVG_SUBSONIC_HOURS_PER_ONE_WAY * i.hourlyValueUsd;
  const supersonicTimeCost = Math.max(0, subsonicTimeCost - directProductivity);
  return {
    oneWayLegs,
    totalHoursSaved,
    directProductivity,
    multipliedGdpImpact,
    jobsSupported,
    perPaxAnnualBenefit,
    globalGdpShare,
    passengersPerRoute,
    subsonicTimeCost,
    supersonicTimeCost,
  };
}
