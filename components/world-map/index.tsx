"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { ArrowRight, ArrowLeftRight } from "lucide-react";

import { airports } from "@/lib/airports";
import { useSelection } from "@/lib/selection-context";

import { AirportPicker } from "./airport-picker";
import { MapErrorBoundary } from "./error-boundary";
import { MapPlaceholder } from "./placeholder";
import { ProjectionToggle, type Projection } from "./projection-toggle";

const MapCanvas = dynamic(
  () => import("./map-canvas").then((m) => m.MapCanvas),
  {
    ssr: false,
    loading: () => <MapPlaceholder />,
  },
);

export function WorldMap() {
  const { origin, destination, setOrigin, setDestination, swap } = useSelection();
  const { resolvedTheme } = useTheme();
  const [projection, setProjection] = useState<Projection>("globe");

  const mapTheme: "light" | "dark" = resolvedTheme === "light" ? "light" : "dark";

  return (
    <section
      id="map"
      className="relative scroll-mt-20 px-6 pb-8 pt-16 sm:px-10 sm:pb-12 sm:pt-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              World Map
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Race the arcs across the planet.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/70">
              Pick two airports — by tapping the map or using the dropdowns —
              and watch the supersonic arc finish before the subsonic one even
              gets close.
            </p>
          </div>
          <ProjectionToggle value={projection} onChange={setProjection} />
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <AirportPicker
            label="From"
            airports={airports}
            selected={origin}
            onSelect={setOrigin}
            exclude={destination}
          />
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="self-center inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03] text-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:h-12 sm:w-12"
          >
            <ArrowLeftRight className="h-4 w-4 sm:hidden" aria-hidden="true" />
            <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
          </button>
          <AirportPicker
            label="To"
            airports={airports}
            selected={destination}
            onSelect={setDestination}
            exclude={origin}
          />
        </div>

        <div className="mt-4 h-[420px] sm:h-[520px] lg:h-[600px]">
          <MapErrorBoundary>
            <MapCanvas projection={projection} theme={mapTheme} />
          </MapErrorBoundary>
        </div>

        <p className="mt-3 text-[11px] text-foreground/45">
          Airport coordinates from{" "}
          <a
            href="https://ourairports.com"
            className="underline underline-offset-2 hover:text-foreground/70"
          >
            OurAirports.com
          </a>{" "}
          (CC0). Country outlines from Natural Earth (public domain). Click any
          airport to set origin, then another for destination.
        </p>
      </div>
    </section>
  );
}
