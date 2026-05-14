"use client";

import { motion } from "framer-motion";
import { Plane, Sparkles } from "lucide-react";

import { GlassPanel } from "./glass-panel";
import { Slider } from "./slider";
import { ALL_AIRCRAFT, useAircraft } from "@/lib/aircraft-context";

export function AircraftPanel() {
  const { preset, config, setPreset, setConfig } = useAircraft();

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
        <div className="flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="text-accent"
          >
            <Plane
              className="h-12 w-12 -rotate-45"
              strokeWidth={1.2}
              aria-hidden="true"
            />
          </motion.div>
        </div>

        <div className="text-center">
          <div className="text-base font-semibold text-foreground">
            {preset.manufacturer} {preset.name}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-foreground/55">
            {preset.era.replace("-", " ")}
          </div>
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
            {ALL_AIRCRAFT.map((a) => (
              <option
                key={a.id}
                value={a.id}
                className="bg-background text-foreground"
              >
                {a.manufacturer} {a.name}
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
            max={8500}
            step={50}
            onChange={(n) => setConfig({ rangeNm: n })}
            formatValue={(v) => `${v.toLocaleString()} NM`}
          />
          <Slider
            label="Boomless cruise"
            value={config.boomlessCruiseMach}
            min={0.8}
            max={1.5}
            step={0.05}
            onChange={(n) => setConfig({ boomlessCruiseMach: n })}
            formatValue={(v) => `Mach ${v.toFixed(2)}`}
          />
          <Slider
            label="Passengers"
            value={config.passengers}
            min={1}
            max={550}
            step={1}
            onChange={(n) => setConfig({ passengers: n })}
            formatValue={(v) => `${v} pax`}
          />
        </div>
      </div>
    </GlassPanel>
  );
}
