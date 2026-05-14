"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

import { CornerChrome } from "@/components/corner-chrome";
import { HeroPickerBar } from "@/components/hero-picker-bar";
import { ScrollHint } from "@/components/scroll-hint";
import { RouteDetailsPanel } from "@/components/panels/route-details-panel";
import { AircraftPanel } from "@/components/panels/aircraft-panel";
import { MapErrorBoundary } from "@/components/world-map/error-boundary";
import { MapPlaceholder } from "@/components/world-map/placeholder";
import { StarField } from "@/components/world-map/star-field";
import { useSelection } from "@/lib/selection-context";
import { useProjectionPref } from "@/lib/use-projection-pref";

const GlobeCanvas = dynamic(
  () =>
    import("@/components/world-map/globe-canvas").then((m) => m.GlobeCanvas),
  { ssr: false, loading: () => <MapPlaceholder /> },
);

const FlatCanvas = dynamic(
  () =>
    import("@/components/world-map/flat-canvas").then((m) => m.FlatCanvas),
  { ssr: false, loading: () => <MapPlaceholder /> },
);

export function HeroGlobe() {
  const { resolvedTheme } = useTheme();
  const { origin, destination } = useSelection();
  const [projection] = useProjectionPref();

  const mapTheme: "light" | "dark" =
    resolvedTheme === "light" ? "light" : "dark";

  const bothSelected = !!origin && !!destination;

  return (
    <section
      id="globe"
      className="relative h-[100svh] w-full overflow-hidden bg-background"
    >
      {/* Procedural starfield — only visible behind the globe (transparent canvas) */}
      {projection === "globe" && mapTheme === "dark" && (
        <StarField className="z-0" />
      )}

      <MapErrorBoundary resetKey={projection} key={projection}>
        {projection === "globe" ? (
          <GlobeCanvas theme={mapTheme} />
        ) : (
          <FlatCanvas theme={mapTheme} />
        )}
      </MapErrorBoundary>

      <CornerChrome />

      {/* Side panels — biased slightly above visual center so the picker bar
          doesn't pull the eye down. */}
      <AnimatePresence>
        {bothSelected && (
          <div
            key="left-panel"
            className="pointer-events-none absolute left-0 top-24 z-20 flex justify-start px-4 lg:inset-y-0 lg:top-0 lg:items-center lg:px-6 lg:pb-24"
          >
            <div className="pointer-events-auto">
              <RouteDetailsPanel />
            </div>
          </div>
        )}
        {bothSelected && (
          <div
            key="right-panel"
            className="pointer-events-none absolute right-0 top-24 z-20 hidden justify-end px-4 lg:inset-y-0 lg:top-0 lg:flex lg:items-center lg:px-6 lg:pb-24"
          >
            <div className="pointer-events-auto">
              <AircraftPanel />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom picker + scroll hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
        <div className="pointer-events-auto">
          <HeroPickerBar />
        </div>
        {!bothSelected && <ScrollHint />}
      </div>

      {/* Bottom vignette for legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-background/60 to-transparent"
      />
    </section>
  );
}
