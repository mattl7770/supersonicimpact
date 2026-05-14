import { Plane } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { formatDistance, formatHours } from "@/lib/format";
import type { Route } from "@/lib/types";

type RouteCardProps = {
  route: Route;
  variant: "subsonic" | "supersonic";
  roundTrip: boolean;
};

export function RouteCard({ route, variant, roundTrip }: RouteCardProps) {
  const isSupersonic = variant === "supersonic";
  const multiplier = roundTrip ? 2 : 1;
  const hours =
    (isSupersonic ? route.supersonicHours : route.subsonicHours) * multiplier;
  const hoursSaved =
    (route.subsonicHours - route.supersonicHours) * multiplier;
  const distance = route.distanceNm * multiplier;
  const showsDecimal = hoursSaved % 1 !== 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 transition-colors sm:p-8 ${
        isSupersonic
          ? "border-accent/30 bg-accent/[0.04] shadow-[0_0_60px_-25px_rgba(34,211,238,0.45)]"
          : "border-foreground/10 bg-foreground/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            isSupersonic
              ? "bg-accent/15 text-accent"
              : "bg-foreground/[0.06] text-foreground/70"
          }`}
        >
          <Plane
            className={`h-3.5 w-3.5 ${isSupersonic ? "-rotate-45" : ""}`}
            aria-hidden="true"
          />
          {isSupersonic ? "Boom Overture" : "Subsonic Widebody"}
        </span>
        <span
          className={`text-xs tabular-nums ${
            isSupersonic ? "text-accent/80" : "text-foreground/50"
          }`}
        >
          {isSupersonic ? "Mach 1.7" : "~Mach 0.85"}
        </span>
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wider text-foreground/40">
          Flight time {roundTrip && "(round trip)"}
        </div>
        <div className="mt-1 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
          {formatHours(hours)}
        </div>
      </div>

      {isSupersonic && (
        <div className="mt-6 rounded-2xl bg-accent/10 px-4 py-3">
          <div className="text-xs uppercase tracking-wider text-accent/80">
            Hours saved
          </div>
          <div className="mt-1 flex items-baseline gap-2 text-3xl font-semibold tabular-nums text-accent">
            <CountUp value={hoursSaved} decimals={showsDecimal ? 1 : 0} />
            <span className="text-base font-normal">
              hour{Math.abs(hoursSaved - 1) > 0.05 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-xs text-foreground/50">
        <span>Distance</span>
        <span className="tabular-nums">{formatDistance(distance)}</span>
      </div>
    </div>
  );
}
