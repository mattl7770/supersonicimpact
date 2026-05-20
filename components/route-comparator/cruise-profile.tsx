"use client";

import type { AircraftConfig } from "@/lib/aircraft-context";
import type { RouteSegment } from "@/lib/route-terrain";

type Props = {
  segments: RouteSegment[];
  originIata: string;
  destinationIata: string;
  config: AircraftConfig;
  distanceNm: number;
};

const WATER_CLASS = "bg-accent";
const BOOMLESS_CLASS = "bg-amber-400/85 dark:bg-amber-300/80";
const SUBSONIC_CLASS = "bg-foreground/35";

export function CruiseProfile({
  segments,
  originIata,
  destinationIata,
  config,
  distanceNm,
}: Props) {
  const overLandClass = config.hasBoomlessCruise ? BOOMLESS_CLASS : SUBSONIC_CLASS;
  const overLandLabel = config.hasBoomlessCruise
    ? `Boomless cruise · Mach ${config.boomlessCruiseMach.toFixed(2)}`
    : "Subsonic over land · ~480 kt";
  const overLandShort = config.hasBoomlessCruise ? "boomless" : "subsonic";

  const landFraction = segments
    .filter((s) => s.isLand)
    .reduce((sum, s) => sum + (s.endProgress - s.startProgress), 0);
  const waterFraction = 1 - landFraction;
  const overLandNm = Math.round(distanceNm * landFraction);
  const overWaterNm = Math.round(distanceNm * waterFraction);

  return (
    <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          Cruise profile
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-foreground/45">
          where it&rsquo;s fast vs. where it slows down
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-xs font-semibold tabular-nums text-foreground/75">
          {originIata}
        </span>
        <div className="relative flex h-4 flex-1 overflow-hidden rounded-full bg-foreground/5 ring-1 ring-foreground/10">
          {segments.map((s, i) => {
            const widthPct = (s.endProgress - s.startProgress) * 100;
            if (widthPct <= 0) return null;
            const cls = s.isLand ? overLandClass : WATER_CLASS;
            return (
              <div
                key={i}
                className={`${cls} transition-colors`}
                style={{ width: `${widthPct}%` }}
                aria-label={
                  s.isLand
                    ? `Over land at ${overLandShort} speed`
                    : "Over water at top speed"
                }
              />
            );
          })}
        </div>
        <span className="text-xs font-semibold tabular-nums text-foreground/75">
          {destinationIata}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <LegendDot className={WATER_CLASS}>
          <span className="font-medium text-foreground/85">
            Top speed
          </span>
          <span className="text-foreground/55">
            {" "}
            · Mach {config.topMach.toFixed(2)} ·{" "}
            <span className="tabular-nums">
              {overWaterNm.toLocaleString()} NM
            </span>
          </span>
        </LegendDot>
        <LegendDot className={overLandClass}>
          <span className="font-medium text-foreground/85">
            {config.hasBoomlessCruise ? "Boomless cruise" : "Subsonic over land"}
          </span>
          <span className="text-foreground/55">
            {" "}
            · {overLandLabel.split(" · ")[1]} ·{" "}
            <span className="tabular-nums">
              {overLandNm.toLocaleString()} NM
            </span>
          </span>
        </LegendDot>
      </div>
    </div>
  );
}

function LegendDot({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${className}`}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  );
}
