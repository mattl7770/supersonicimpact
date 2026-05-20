"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Car, Leaf, Plane, TrendingUp } from "lucide-react";

import { ImpactSlider } from "../economic-impact/impact-slider";
import { MetricCard } from "../economic-impact/metric-card";
import { useSelection } from "@/lib/selection-context";
import { haversineNm } from "@/lib/geo";
import {
  DEFAULT_DISTANCE_NM,
  computeSustainabilityImpact,
  formatCount,
  formatKgCo2,
  formatMultiplier,
} from "@/lib/sustainability";

export function Sustainability() {
  const { origin, destination } = useSelection();
  const reduced = useReducedMotion();
  // Stored as 0–100 integer so the ImpactSlider's numeric text input reads
  // "50%" rather than "0.5". Converted back to 0–1 for computation.
  const [safPct, setSafPct] = useState(0);
  const safBlend = safPct / 100;

  const distanceNm = useMemo(() => {
    if (origin && destination) {
      return haversineNm(
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      );
    }
    return DEFAULT_DISTANCE_NM;
  }, [origin, destination]);

  const routeLabel = useMemo(() => {
    if (origin && destination) {
      return `${origin.iata} → ${destination.iata}`;
    }
    return "JFK → LHR (sample)";
  }, [origin, destination]);

  const outputs = useMemo(
    () => computeSustainabilityImpact({ safBlend, distanceNm }),
    [safBlend, distanceNm],
  );

  const jetAPct = 100 - safPct;
  const lifecycleReductionPct = Math.round(outputs.lifecycleReductionPct);

  return (
    <section
      id="sustainability"
      className="relative scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Sustainability
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Faster, but at what climate cost?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/70">
            Independent analysis by{" "}
            <span className="font-semibold text-foreground/85">ICCT/MIT</span>{" "}
            estimates a commercial supersonic transport like Overture burns{" "}
            <span className="font-semibold text-foreground/85">5–8×</span> the
            fuel per passenger of a modern 787-9. Sustainable Aviation Fuel
            (SAF) can offset most of that on paper — but in 2024, global SAF
            supply was just{" "}
            <span className="font-semibold text-foreground/85">0.3%</span> of
            jet-fuel demand.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          {/* Slider + readouts card */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 sm:p-8"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Fuel scenario
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[10px] font-medium text-foreground/65">
                <Plane className="h-2.5 w-2.5" aria-hidden="true" />
                {routeLabel}
              </span>
            </div>

            <div className="mt-5">
              <ImpactSlider
                label="Sustainable Aviation Fuel blend"
                value={safPct}
                min={0}
                max={100}
                step={1}
                onChange={(v) => setSafPct(v)}
                suffix="%"
                formatRange={(v) => `${v}%`}
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2">
                <div className="text-foreground/55">SAF</div>
                <div className="mt-0.5 font-semibold tabular-nums text-foreground">
                  {safPct}%
                </div>
              </div>
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2">
                <div className="text-foreground/55">Jet A</div>
                <div className="mt-0.5 font-semibold tabular-nums text-foreground">
                  {jetAPct}%
                </div>
              </div>
              <div className="rounded-xl border border-accent/25 bg-accent/[0.06] px-3 py-2">
                <div className="text-accent/80">Lifecycle cut</div>
                <div className="mt-0.5 font-semibold tabular-nums text-accent">
                  {lifecycleReductionPct}%
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-foreground/55">
              SAF lifecycle reduction modeled at up to 80% (IATA HEFA cap).
              Global SAF supply was{" "}
              <span className="font-semibold text-foreground/75">0.3%</span> of
              jet-fuel demand in 2024 — so a 100% SAF tank today is a
              book-and-claim accounting move, not a physical reality.
            </p>
          </motion.div>

          {/* KPI grid */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              delay: reduced ? 0 : 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            <MetricCard
              label="Per passenger"
              value={outputs.supersonicKgPerPaxRoundTrip}
              format={formatKgCo2}
              caption="CO₂ round-trip on Overture"
              icon={<Plane className="h-4 w-4" />}
              accent="supersonic"
            />
            <MetricCard
              label="vs 787-9"
              value={outputs.multiplierVsSubsonic}
              format={formatMultiplier}
              caption="more CO₂ than the same trip on a modern widebody"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <MetricCard
              label="Car-miles"
              value={outputs.carMilesEquivalent}
              format={formatCount}
              caption="driving an average US car (EPA)"
              icon={<Car className="h-4 w-4" />}
            />
            <MetricCard
              label="Tree-years"
              value={outputs.treeYearsEquivalent}
              format={formatCount}
              caption="of a mature tree absorbing CO₂"
              icon={<Leaf className="h-4 w-4" />}
            />
          </motion.div>
        </div>

        {/* Methodology + sources */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.5,
            delay: reduced ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-6 rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 sm:p-8"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
            How this is calculated
          </h3>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/70">
            <li>
              <span className="font-semibold text-foreground/90">
                Supersonic baseline
              </span>{" "}
              uses the midpoint of ICCT/MIT&rsquo;s independent analysis
              (December 2024): Overture burns roughly 7× the fuel per
              passenger-kilometer of a 787-9, with a range of 5–8×.
            </li>
            <li>
              <span className="font-semibold text-foreground/90">
                Subsonic baseline
              </span>{" "}
              is 60 g CO₂ / pax-km — a fully-loaded 787-9 in economy, per
              ICCT&rsquo;s commercial-aviation emissions dataset.
            </li>
            <li>
              <span className="font-semibold text-foreground/90">
                SAF effect
              </span>{" "}
              is modeled as up to 80% lifecycle CO₂ reduction (IATA, on
              currently-available HEFA pathways). The slider blends linearly:
              50% SAF ≈ 40% lifecycle cut.
            </li>
            <li>
              <span className="font-semibold text-foreground/90">
                Boom&rsquo;s &ldquo;net-zero with 100% SAF&rdquo; claim
              </span>{" "}
              folds in book-and-claim accounting and external carbon-removal
              credits. This section models only physical combustion + lifecycle
              SAF reduction, so 100% SAF here lands at the 80% cap, not
              net-zero.
            </li>
            <li>
              <span className="font-semibold text-foreground/90">
                Equivalents
              </span>{" "}
              use 248 g CO₂/km for an average US passenger vehicle (US EPA,
              2023) and ~21 kg CO₂/year absorption per mature tree
              (widely-cited forestry heuristic; range 10–40 kg).
            </li>
          </ul>

          <p className="mt-5 text-xs text-foreground/45">
            Illustrative — Overture has not flown; figures use independently
            published projections. Actuals will depend on final aircraft specs,
            engine performance, route, load factor, and the regional SAF
            feedstock mix. Sources:{" "}
            <a
              href="https://theicct.org/supersonic-aircraft-dec24/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground/70"
            >
              ICCT (Dec 2024)
            </a>
            ,{" "}
            <a
              href="https://www.iata.org/en/pressroom/2024-releases/2024-12-10-03/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground/70"
            >
              IATA SAF 2024
            </a>
            ,{" "}
            <a
              href="https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground/70"
            >
              US EPA passenger vehicle
            </a>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}
