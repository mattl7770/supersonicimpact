"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Repeat } from "lucide-react";
import { routes } from "@/data/routes";
import { RouteCard } from "./route-card";
import { RoutePicker } from "./route-picker";

const RouteChart = dynamic(
  () => import("./route-chart").then((m) => m.RouteChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[208px] rounded-3xl border border-foreground/10 bg-foreground/[0.02]" />
    ),
  },
);

export function RouteComparator() {
  const [selectedId, setSelectedId] = useState(routes[0].id);
  const [roundTrip, setRoundTrip] = useState(false);
  const selected = routes.find((r) => r.id === selectedId) ?? routes[0];

  return (
    <section
      id="comparator"
      className="relative scroll-mt-20 px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Route Comparator
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Pick a route. See what supersonic does to it.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/70">
            Subsonic block times reflect today&rsquo;s scheduled widebody
            flights. Supersonic times model Boom&rsquo;s Overture — Mach 1.7
            over water, Mach 1.3 (Boomless Cruise) over land.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <RoutePicker
              routes={routes}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <button
            type="button"
            onClick={() => setRoundTrip((v) => !v)}
            aria-pressed={roundTrip}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              roundTrip
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-foreground/10 bg-foreground/[0.03] text-foreground/70 hover:bg-foreground/[0.06]"
            }`}
          >
            <Repeat className="h-4 w-4" aria-hidden="true" />
            Round trip
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <RouteCard
            route={selected}
            variant="subsonic"
            roundTrip={roundTrip}
          />
          <RouteCard
            route={selected}
            variant="supersonic"
            roundTrip={roundTrip}
          />
        </div>

        <div className="mt-4">
          <RouteChart route={selected} roundTrip={roundTrip} />
        </div>

        {selected.notes && (
          <p className="mt-6 text-xs text-foreground/55">
            <span className="font-medium text-foreground/75">Note:</span>{" "}
            {selected.notes}
          </p>
        )}

        <p className="mt-8 text-xs text-foreground/45">
          Illustrative — based on Boom Supersonic&rsquo;s public claims and
          published aviation data. See{" "}
          <a
            href="https://github.com/mattl7770/supersonicimpact/blob/main/docs/methodology.md"
            className="underline underline-offset-2 hover:text-foreground/70"
          >
            methodology
          </a>
          .
        </p>
      </div>
    </section>
  );
}
