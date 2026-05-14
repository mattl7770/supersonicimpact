"use client";

import { useTheme } from "next-themes";

import { CornerChrome } from "@/components/corner-chrome";
import { HeroPickerBar } from "@/components/hero-picker-bar";
import { ScrollHint } from "@/components/scroll-hint";
import { MapErrorBoundary } from "@/components/world-map/error-boundary";
import { GlobeCanvas } from "@/components/world-map/globe-canvas";

export function HeroGlobe() {
  const { resolvedTheme } = useTheme();
  const mapTheme: "light" | "dark" =
    resolvedTheme === "light" ? "light" : "dark";

  return (
    <section id="globe" className="relative h-[100svh] w-full overflow-hidden">
      <MapErrorBoundary>
        <GlobeCanvas theme={mapTheme} />
      </MapErrorBoundary>

      <CornerChrome />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
        <div className="pointer-events-auto">
          <HeroPickerBar />
        </div>
        <ScrollHint />
      </div>

      {/* Bottom vignette keeps the picker pill legible over bright globe areas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-background/60 to-transparent"
      />
    </section>
  );
}
