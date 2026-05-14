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
      <MapErrorBoundary>
        {projection === "globe" ? (
          <GlobeCanvas theme={mapTheme} />
        ) : (
          <FlatCanvas theme={mapTheme} />
        )}
      </MapErrorBoundary>

      <CornerChrome />

      {/* Side panels — only when both endpoints set */}
      <AnimatePresence>
        {bothSelected && (
          <div
            key="left-panel-wrap"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden items-center px-4 lg:flex lg:px-6"
          >
            <div className="pointer-events-auto">
              <RouteDetailsPanel />
            </div>
          </div>
        )}
        {bothSelected && (
          <div
            key="right-panel-wrap"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden items-center px-4 lg:flex lg:px-6"
          >
            <div className="pointer-events-auto">
              <AircraftPanel />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile: stack panels below picker */}
      <AnimatePresence>
        {bothSelected && (
          <div
            key="mobile-panels"
            className="pointer-events-none absolute inset-x-0 top-20 z-20 flex flex-col items-center gap-3 px-4 lg:hidden"
          >
            <div className="pointer-events-auto">
              <RouteDetailsPanel />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom picker + scroll hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
        <div className="pointer-events-auto">
          <HeroPickerBar />
        </div>
        <ScrollHint />
      </div>

      {/* Bottom vignette for legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-background/60 to-transparent"
      />
    </section>
  );
}
