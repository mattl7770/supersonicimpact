"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Pencil, X } from "lucide-react";

import { GlassPanel } from "./glass-panel";
import { CountUp } from "@/components/count-up";
import { AirportPicker } from "@/components/world-map/airport-picker";
import { airports } from "@/lib/airports";
import { useSelection } from "@/lib/selection-context";
import { useAircraft } from "@/lib/aircraft-context";
import { useHourlyRate } from "@/lib/value-context";
import { buildRouteForPair } from "@/lib/flight-time";
import { routes } from "@/data/routes";
import { formatHours, formatDistance } from "@/lib/format";

export function RouteDetailsPanel() {
  const { origin, destination, setOrigin, setDestination, swap } =
    useSelection();
  const { config } = useAircraft();
  const { hourlyRate, setHourlyRate } = useHourlyRate();
  const [showPicker, setShowPicker] = useState<"from" | "to" | null>(null);
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(String(hourlyRate));

  const route = useMemo(() => {
    if (!origin || !destination) return null;
    return buildRouteForPair(origin, destination, routes, config);
  }, [origin, destination, config]);

  if (!origin || !destination || !route) return null;

  const hoursSaved = route.subsonicHours - route.supersonicHours;
  const valueSavedRoundTrip = Math.round(hoursSaved * 2 * hourlyRate);
  const showsDecimal = hoursSaved % 1 !== 0;

  return (
    <GlassPanel side="left">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
            Route Details
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-accent/85">
            Live
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden>{origin.flag}</span>
          <span>{origin.iata}</span>
          <ArrowRight className="h-3.5 w-3.5 text-foreground/45" aria-hidden="true" />
          <span aria-hidden>{destination.flag}</span>
          <span>{destination.iata}</span>
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="ml-auto text-foreground/45 transition-colors hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 4h10M11 2l2 2-2 2M13 12H3M5 14l-2-2 2-2" />
            </svg>
          </button>
        </div>
        <div className="text-xs text-foreground/60">
          {origin.city} to {destination.city}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Stat label="Distance" value={formatDistance(route.distanceNm)} small />
          <Stat label="Subsonic" value={formatHours(route.subsonicHours)} />
          <Stat
            label="Supersonic"
            value={formatHours(route.supersonicHours)}
            accent
          />
          <Stat
            label="Round-trip distance"
            value={formatDistance(route.distanceNm * 2)}
            small
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-accent/85">
            Hours saved
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5 text-3xl font-semibold tabular-nums text-accent">
            <CountUp value={hoursSaved} decimals={showsDecimal ? 1 : 0} />
            <span className="text-sm font-medium text-accent/80">
              hour{Math.abs(hoursSaved - 1) > 0.05 ? "s" : ""}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-foreground/70">
            <span>
              Round-trip ≈{" "}
              <span className="font-semibold text-foreground tabular-nums">
                ${valueSavedRoundTrip.toLocaleString()}
              </span>
            </span>
            {editingRate ? (
              <span className="inline-flex items-center gap-1">
                <span className="text-foreground/55">@</span>
                <input
                  type="number"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  onBlur={() => {
                    const n = Number(rateInput);
                    if (Number.isFinite(n) && n > 0) setHourlyRate(n);
                    setEditingRate(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const n = Number(rateInput);
                      if (Number.isFinite(n) && n > 0) setHourlyRate(n);
                      setEditingRate(false);
                    }
                    if (e.key === "Escape") {
                      setRateInput(String(hourlyRate));
                      setEditingRate(false);
                    }
                  }}
                  autoFocus
                  className="w-14 rounded bg-white/10 px-1 py-0.5 text-right text-xs tabular-nums text-foreground focus:outline-none"
                />
                <span className="text-foreground/55">/hr</span>
                <button
                  type="button"
                  onClick={() => {
                    setRateInput(String(hourlyRate));
                    setEditingRate(false);
                  }}
                  className="text-foreground/45 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRateInput(String(hourlyRate));
                  setEditingRate(true);
                }}
                className="inline-flex items-center gap-1 text-foreground/55 transition-colors hover:text-foreground"
              >
                @ ${hourlyRate}/hr
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
            Select another route
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowPicker(showPicker === "from" ? null : "from")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-left text-xs transition-colors hover:bg-white/[0.08]"
            >
              <div className="text-[9px] font-medium uppercase tracking-wider text-foreground/45">
                From
              </div>
              <div className="mt-0.5 truncate font-semibold text-foreground">
                {origin.iata} · {origin.city}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(showPicker === "to" ? null : "to")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-left text-xs transition-colors hover:bg-white/[0.08]"
            >
              <div className="text-[9px] font-medium uppercase tracking-wider text-foreground/45">
                To
              </div>
              <div className="mt-0.5 truncate font-semibold text-foreground">
                {destination.iata} · {destination.city}
              </div>
            </button>
          </div>
          {showPicker === "from" && (
            <AirportPicker
              label="Origin"
              airports={airports}
              selected={origin}
              onSelect={(a) => {
                setOrigin(a);
                setShowPicker(null);
              }}
              exclude={destination}
            />
          )}
          {showPicker === "to" && (
            <AirportPicker
              label="Destination"
              airports={airports}
              selected={destination}
              onSelect={(a) => {
                setDestination(a);
                setShowPicker(null);
              }}
              exclude={origin}
            />
          )}
        </div>

        {route.notes && (
          <p className="text-[11px] leading-relaxed text-foreground/55">
            {route.notes}
          </p>
        )}
      </div>
    </GlassPanel>
  );
}

function Stat({
  label,
  value,
  small,
  accent,
}: {
  label: string;
  value: string;
  small?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[9px] font-medium uppercase tracking-wider text-foreground/50">
        {label}
      </div>
      <div
        className={`mt-0.5 ${small ? "text-xs" : "text-base"} font-semibold tabular-nums ${accent ? "text-accent" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
