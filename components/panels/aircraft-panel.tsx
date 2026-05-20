"use client";

import { Sparkles } from "lucide-react";

import { GlassPanel } from "./glass-panel";
import { Slider } from "./slider";
import { StatusBadge } from "./status-badge";
import { AircraftSilhouette } from "../aircraft/silhouette";
import {
  ALL_AIRCRAFT,
  CUSTOM_AIRCRAFT,
  useAircraft,
} from "@/lib/aircraft-context";

export function AircraftPanel() {
  const { preset, config, setPreset, setConfig } = useAircraft();
  const isCustom = preset.id === CUSTOM_AIRCRAFT.id;
  const dropdownOptions = [CUSTOM_AIRCRAFT, ...ALL_AIRCRAFT];

  return (
    <GlassPanel side="right">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
            Aircraft
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
            Customize
          </span>
        </div>

        {/* Aircraft preview */}
        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.04]">
          <AircraftSilhouette aircraftId={preset.id} aircraftName={preset.name} />
        </div>

        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="text-base font-semibold text-foreground">
              {isCustom ? preset.name : `${preset.manufacturer} ${preset.name}`}
            </div>
            <StatusBadge era={isCustom ? undefined : preset.era} />
          </div>
          {isCustom ? (
            <div className="text-[11px] uppercase tracking-wider text-foreground/55">
              {preset.manufacturer}
            </div>
          ) : null}
        </div>

        {/* Preset selector */}
        <div>
          <label
            htmlFor="aircraft-preset"
            className="block text-[10px] font-medium uppercase tracking-wider text-foreground/55"
          >
            Preset
          </label>
          <select
            id="aircraft-preset"
            value={preset.id}
            onChange={(e) => setPreset(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {dropdownOptions.map((a) => (
              <option
                key={a.id}
                value={a.id}
                className="bg-background text-foreground"
              >
                {a.id === CUSTOM_AIRCRAFT.id
                  ? a.name
                  : `${a.manufacturer} ${a.name}`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 pt-1">
          <Slider
            label="Top speed"
            value={config.topMach}
            min={0.8}
            max={2.5}
            step={0.05}
            onChange={(n) => setConfig({ topMach: n })}
            formatValue={(v) => `Mach ${v.toFixed(2)}`}
          />
          <Slider
            label="Range"
            value={config.rangeNm}
            min={1500}
            max={7000}
            step={50}
            onChange={(n) => setConfig({ rangeNm: n })}
            formatValue={(v) => `${v.toLocaleString()} NM`}
          />
          {config.hasBoomlessCruise ? (
            <Slider
              label="Boomless cruise"
              value={config.boomlessCruiseMach}
              min={0.8}
              max={1.5}
              step={0.05}
              onChange={(n) => setConfig({ boomlessCruiseMach: n })}
              formatValue={(v) => `Mach ${v.toFixed(2)}`}
            />
          ) : (
            <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2.5 text-[11px] leading-snug text-foreground/65">
              <span className="font-medium text-foreground/80">
                Subsonic over land.
              </span>{" "}
              No Boomless Cruise; over-land legs drop to ~480 kt.
            </div>
          )}
          <Slider
            label="Passengers"
            value={config.passengers}
            min={1}
            max={200}
            step={1}
            onChange={(n) => setConfig({ passengers: n })}
            formatValue={(v) => `${v} pax`}
          />
        </div>
      </div>
    </GlassPanel>
  );
}
