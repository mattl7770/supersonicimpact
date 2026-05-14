"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { BadgeCheck, Repeat, Sparkles } from "lucide-react";
import { routes } from "@/data/routes";
import { getAirportByIata } from "@/lib/airports";
import { buildRouteForPair, isCurated } from "@/lib/flight-time";
import { useSelection } from "@/lib/selection-context";
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
  const { origin, destination, setPair } = useSelection();
  const [roundTrip, setRoundTrip] = useState(false);

  const route = useMemo(() => {
    if (!origin || !destination) return null;
    return buildRouteForPair(origin, destination, routes);
  }, [origin, destination]);

  const curated = useMemo(() => {
    if (!origin || !destination) return false;
    return isCurated(origin.iata, destination.iata, routes);
  }, [origin, destination]);

  const pickerSelectedId = useMemo(() => {
    if (!origin || !destination) return routes[0].id;
    const match = routes.find(
      (r) =>
        (r.origin.iata === origin.iata && r.destination.iata === destination.iata) ||
        (r.origin.iata === destination.iata && r.destination.iata === origin.iata),
    );
    return match?.id ?? "";
  }, [origin, destination]);

  function handlePickRoute(id: string) {
    const r = routes.find((x) => x.id === id);
    if (!r) return;
    const o = getAirportByIata(r.origin.iata);
    const d = getAirportByIata(r.destination.iata);
    if (o && d) setPair(o, d);
  }

  return (
    <section
      id="comparator"
      className="relative scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28"
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
              selectedId={pickerSelectedId}
              onSelect={handlePickRoute}
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

        {route ? (
          <>
            <div className="mt-6 flex items-center gap-2">
              {curated ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                  <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                  Curated route
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground/70">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Estimated from formulas
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <RouteCard
                route={route}
                variant="subsonic"
                roundTrip={roundTrip}
              />
              <RouteCard
                route={route}
                variant="supersonic"
                roundTrip={roundTrip}
              />
            </div>

            <div className="mt-4">
              <RouteChart route={route} roundTrip={roundTrip} />
            </div>

            {route.notes && (
              <p className="mt-6 text-xs text-foreground/55">
                <span className="font-medium text-foreground/75">Note:</span>{" "}
                {route.notes}
              </p>
            )}
          </>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-foreground/15 bg-foreground/[0.02] px-6 py-12 text-center">
            <p className="text-sm text-foreground/60">
              Pick an origin and destination above (or tap two airports on the
              map) to see the comparison.
            </p>
          </div>
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
