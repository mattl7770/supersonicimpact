"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

import { useMediaQuery } from "@/lib/use-media-query";
import { CornerChrome } from "@/components/corner-chrome";
import { HeroPickerBar } from "@/components/hero-picker-bar";
import { ScrollHint } from "@/components/scroll-hint";
import { MapErrorBoundary } from "@/components/world-map/error-boundary";
import { MapPlaceholder } from "@/components/world-map/placeholder";
import type { Projection } from "@/components/world-map/projection-toggle";

const MapCanvas = dynamic(
  () =>
    import("@/components/world-map/map-canvas").then((m) => m.MapCanvas),
  {
    ssr: false,
    loading: () => <MapPlaceholder />,
  },
);

export function HeroGlobe() {
  const { resolvedTheme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [projection, setProjection] = useState<Projection>("globe");

  // On mobile, default to flat (globe touch is fiddly). The toggle still works.
  // We only apply this on the first render where isMobile flips to true.
  const effectiveProjection: Projection =
    projection === "globe" && isMobile ? "mercator" : projection;

  const mapTheme: "light" | "dark" =
    resolvedTheme === "light" ? "light" : "dark";

  return (
    <section id="globe" className="relative h-[100svh] w-full overflow-hidden">
      <MapErrorBoundary>
        <MapCanvas projection={effectiveProjection} theme={mapTheme} />
      </MapErrorBoundary>

      <CornerChrome
        projection={effectiveProjection}
        onProjectionChange={setProjection}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
        <div className="pointer-events-auto">
          <HeroPickerBar />
        </div>
        <ScrollHint />
      </div>

      {/* Bottom vignette to keep the picker pill legible over busy globe areas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background/60 to-transparent"
      />
    </section>
  );
}
