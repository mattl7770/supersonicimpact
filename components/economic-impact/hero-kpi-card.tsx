"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { formatUsdCompact } from "@/lib/format";
import { GDP_MULTIPLIER } from "@/lib/economic-impact";
import { GaugeRing } from "./gauge-ring";

type HeroKpiCardProps = {
  multipliedGdpImpact: number;
  directProductivity: number;
  globalGdpShare: number;
};

export function HeroKpiCard({
  multipliedGdpImpact,
  directProductivity,
  globalGdpShare,
}: HeroKpiCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-foreground/15 bg-background/55 p-7 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.45),inset_1px_1px_0_0_rgba(255,255,255,0.18),0_0_60px_-15px_rgba(34,211,238,0.5)] backdrop-blur-2xl backdrop-saturate-150 sm:p-9 dark:border-white/[0.10] dark:bg-gradient-to-br dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.01]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent dark:via-white/40"
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-accent">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Multiplied GDP Impact
          </div>
          <div className="mt-3 text-5xl font-semibold tabular-nums tracking-tight text-foreground sm:text-6xl">
            <CountUp value={multipliedGdpImpact} format={formatUsdCompact} />
            <span className="ml-1 text-2xl text-foreground/40 sm:text-3xl">
              /yr
            </span>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
            {GDP_MULTIPLIER.toFixed(1)}× catalytic multiplier
          </div>
        </div>
        <GaugeRing
          value={globalGdpShare}
          size={104}
          stroke={8}
          label="of global aviation GDP"
        />
      </div>

      <div className="mt-7 grid gap-3 border-t border-foreground/10 pt-5 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-foreground/55">
            Direct productivity recovered
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
            <CountUp value={directProductivity} format={formatUsdCompact} />
            <span className="ml-1 text-base font-medium text-foreground/45 sm:text-lg">
              /yr
            </span>
          </div>
        </div>
        <div className="text-xs leading-relaxed text-foreground/55 sm:pl-4">
          The multiplied figure applies aviation&rsquo;s catalytic multiplier
          (jobs, supply-chain, tourism) to the direct productivity that
          supersonic travel recovers.
        </div>
      </div>
    </motion.div>
  );
}
