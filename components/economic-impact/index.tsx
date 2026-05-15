"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Banknote, Clock, Network, Users, Wallet } from "lucide-react";
import {
  computeEconomicImpact,
  DEFAULT_INPUTS,
  INPUT_RANGES,
  type EconomicInputs,
} from "@/lib/economic-impact";
import { formatCountCompact, formatUsdCompact } from "@/lib/format";
import { Assumptions } from "./assumptions";
import { HeroKpiCard } from "./hero-kpi-card";
import { ImpactSlider } from "./impact-slider";
import { MetricCard } from "./metric-card";

const ImpactChart = dynamic(
  () => import("./impact-chart").then((m) => m.ImpactChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[296px] rounded-3xl border border-foreground/10 bg-foreground/[0.02]" />
    ),
  },
);

export function EconomicImpact() {
  const [inputs, setInputs] = useState<EconomicInputs>(DEFAULT_INPUTS);
  const reduced = useReducedMotion();

  const outputs = useMemo(() => computeEconomicImpact(inputs), [inputs]);

  function update<K extends keyof EconomicInputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <section
      id="economic-impact"
      className="relative scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Economic Impact
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            What happens when every business trip is hours shorter?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/70">
            Move the sliders to imagine a world where supersonic travel is
            mainstream. Recovered productivity flows through the aviation
            economy&rsquo;s catalytic multiplier into GDP and jobs &mdash; the
            same engine that today supports{" "}
            <span className="font-semibold text-foreground/85">$4.1T</span> of
            economic activity and{" "}
            <span className="font-semibold text-foreground/85">86.5M</span>{" "}
            jobs globally.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <HeroKpiCard
            multipliedGdpImpact={outputs.multipliedGdpImpact}
            directProductivity={outputs.directProductivity}
            globalGdpShare={outputs.globalGdpShare}
          />

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              delay: reduced ? 0 : 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 sm:p-8"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Scenario
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-accent">
                Live
              </span>
            </div>
            <div className="mt-5 space-y-6">
              <ImpactSlider
                label="Annual Passengers"
                value={inputs.passengersPerYear}
                min={INPUT_RANGES.passengersPerYear.min}
                max={INPUT_RANGES.passengersPerYear.max}
                step={INPUT_RANGES.passengersPerYear.step}
                onChange={(v) => update("passengersPerYear", v)}
                suffix="/yr"
                formatRange={formatCountCompact}
              />
              <ImpactSlider
                label="Number of Routes"
                value={inputs.routes}
                min={INPUT_RANGES.routes.min}
                max={INPUT_RANGES.routes.max}
                step={INPUT_RANGES.routes.step}
                onChange={(v) => update("routes", v)}
                suffix="hub-to-hub"
                formatRange={(v) => v.toString()}
              />
              <ImpactSlider
                label="Avg Business Hourly Value"
                value={inputs.hourlyValueUsd}
                min={INPUT_RANGES.hourlyValueUsd.min}
                max={INPUT_RANGES.hourlyValueUsd.max}
                step={INPUT_RANGES.hourlyValueUsd.step}
                onChange={(v) => update("hourlyValueUsd", v)}
                prefix="$"
                suffix="/hr"
                formatRange={(v) => `$${v}`}
              />
              <ImpactSlider
                label="Round Trips per Year"
                value={inputs.roundTripsPerPaxPerYear}
                min={INPUT_RANGES.roundTripsPerPaxPerYear.min}
                max={INPUT_RANGES.roundTripsPerPaxPerYear.max}
                step={INPUT_RANGES.roundTripsPerPaxPerYear.step}
                onChange={(v) => update("roundTripsPerPaxPerYear", v)}
                suffix="/pax"
                formatRange={(v) => v.toString()}
              />
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-xs text-foreground/65">
              <Network
                className="h-3.5 w-3.5 text-foreground/40"
                aria-hidden="true"
              />
              <span>
                ≈{" "}
                <span className="font-semibold tabular-nums text-foreground/85">
                  {formatCountCompact(outputs.passengersPerRoute)}
                </span>{" "}
                passengers per route across{" "}
                <span className="font-semibold tabular-nums text-foreground/85">
                  {inputs.routes}
                </span>{" "}
                hubs
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.5,
            delay: reduced ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          <MetricCard
            label="Hours saved"
            value={outputs.totalHoursSaved}
            format={formatCountCompact}
            caption="passenger-hours / yr"
            icon={<Clock className="h-4 w-4" />}
          />
          <MetricCard
            label="Direct productivity"
            value={outputs.directProductivity}
            format={formatUsdCompact}
            caption="hours saved × hourly value"
            icon={<Banknote className="h-4 w-4" />}
            accent="supersonic"
          />
          <MetricCard
            label="Jobs supported"
            value={outputs.jobsSupported}
            format={formatCountCompact}
            caption="at ATAG's jobs-per-$ ratio"
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            label="Per-passenger benefit"
            value={outputs.perPaxAnnualBenefit}
            format={formatUsdCompact}
            caption="recovered value / yr"
            icon={<Wallet className="h-4 w-4" />}
          />
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.5,
            delay: reduced ? 0 : 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-5"
        >
          <ImpactChart
            subsonicTimeCost={outputs.subsonicTimeCost}
            supersonicTimeCost={outputs.supersonicTimeCost}
            multipliedGdpImpact={outputs.multipliedGdpImpact}
          />
        </motion.div>

        <div className="mt-5">
          <Assumptions />
        </div>

        <p className="mt-8 text-xs text-foreground/45">
          Illustrative — based on Boom Supersonic&rsquo;s public claims and
          published aviation economic data (ATAG, IATA). Actuals depend on
          final aircraft specs, regulations, fuel availability, and route
          economics. See{" "}
          <a
            href="https://github.com/mattl7770/supersonicimpact/blob/main/docs/methodology.md"
            className="underline underline-offset-2 hover:text-foreground/70"
          >
            methodology
          </a>
          .
        </p>
      </div>
    </section>
  );
}
