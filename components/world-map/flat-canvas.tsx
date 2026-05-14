"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from "react-simple-maps";
import { feature } from "topojson-client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore world-atlas ships .json without types
import worldAtlas from "world-atlas/countries-110m.json";

import { MAJOR_HUBS, airports, type Airport } from "@/lib/airports";
import { useSelection } from "@/lib/selection-context";
import { useAircraft } from "@/lib/aircraft-context";
import { buildRouteForPair } from "@/lib/flight-time";
import { routes } from "@/data/routes";
import { greatCircleArc, splitAtAntimeridian, type LngLat } from "@/lib/geo";
import { formatHours } from "@/lib/format";

type FlatCanvasProps = { theme: "light" | "dark" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countriesGeoJSON = feature(worldAtlas as any, (worldAtlas as any).objects.countries) as any;

type FlatLabel = { coords: [number, number]; text: string; kind: "continent" | "ocean" };

// Faint continent + ocean labels — keeps the map from feeling sparse.
const FLAT_LABELS: FlatLabel[] = [
  { coords: [20, 8], text: "AFRICA", kind: "continent" },
  { coords: [95, 45], text: "ASIA", kind: "continent" },
  { coords: [15, 52], text: "EUROPE", kind: "continent" },
  { coords: [-100, 45], text: "NORTH AMERICA", kind: "continent" },
  { coords: [-60, -15], text: "SOUTH AMERICA", kind: "continent" },
  { coords: [135, -25], text: "AUSTRALIA", kind: "continent" },
  { coords: [80, -15], text: "Indian Ocean", kind: "ocean" },
  { coords: [-30, 5], text: "Atlantic Ocean", kind: "ocean" },
  { coords: [-150, 10], text: "Pacific Ocean", kind: "ocean" },
];

export function FlatCanvas({ theme }: FlatCanvasProps) {
  const { origin, destination, selectAirport } = useSelection();
  const { config } = useAircraft();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1, h: 1 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({
        w: Math.max(1, Math.round(entry.contentRect.width)),
        h: Math.max(1, Math.round(entry.contentRect.height)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const route = useMemo(() => {
    if (!origin || !destination) return null;
    return buildRouteForPair(origin, destination, routes, config);
  }, [origin, destination, config]);

  const arcSegments = useMemo<LngLat[][]>(() => {
    if (!origin || !destination) return [];
    const arc = greatCircleArc(
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
      96,
    );
    return splitAtAntimeridian(arc);
  }, [origin, destination]);

  const accent = theme === "dark" ? "#22d3ee" : "#06b6d4";
  const landFill = theme === "dark" ? "#1a1a1d" : "#e4e4e7";
  const landStroke = theme === "dark" ? "#3f3f46" : "#a1a1aa";
  const bg = theme === "dark" ? "#09090b" : "#fafafa";

  const isReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: bg }}
    >
      <ComposableMap
        projection="geoEquirectangular"
        width={size.w}
        height={size.h}
        projectionConfig={{ scale: size.w / 6.28 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={countriesGeoJSON}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={landFill}
                stroke={landStroke}
                strokeWidth={0.4}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: landFill },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Faint continent + ocean labels for context */}
        {FLAT_LABELS.map((label) => (
          <Marker key={label.text} coordinates={label.coords}>
            <text
              textAnchor="middle"
              y={4}
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: label.kind === "continent" ? 10 : 8,
                fontWeight: label.kind === "continent" ? 600 : 400,
                fontStyle: label.kind === "ocean" ? "italic" : "normal",
                letterSpacing:
                  label.kind === "continent" ? "0.18em" : "0.04em",
                fill:
                  theme === "dark"
                    ? "rgba(245,250,255,0.45)"
                    : "rgba(40,50,60,0.45)",
                pointerEvents: "none",
              }}
            >
              {label.text}
            </text>
          </Marker>
        ))}

        {/* Great-circle arcs: gray "subsonic" + glowing white "supersonic" */}
        {arcSegments.map((segment, i) => (
          <FlatArc
            key={`arc-${i}-${origin?.iata}-${destination?.iata}`}
            points={segment}
            accent={accent}
            reducedMotion={isReducedMotion}
            durationMs={
              route ? 2400 * (route.subsonicHours / route.supersonicHours) : 2400
            }
          />
        ))}

        {/* Airports */}
        {airports.map((a) => (
          <AirportMarker
            key={a.iata}
            airport={a}
            isSelected={
              origin?.iata === a.iata || destination?.iata === a.iata
            }
            accent={accent}
            onClick={() => selectAirport(a)}
          />
        ))}
      </ComposableMap>

      {/* Floating saved-hours label */}
      {route && (
        <div
          className="pointer-events-none absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-background shadow-lg shadow-accent/30"
          style={{ background: accent, color: bg }}
        >
          Saved {formatHours(route.subsonicHours - route.supersonicHours)}
        </div>
      )}
    </div>
  );
}

function FlatArc({
  points,
  accent,
  reducedMotion,
  durationMs,
}: {
  points: LngLat[];
  accent: string;
  reducedMotion: boolean;
  durationMs: number;
}) {
  // Projection happens implicitly inside react-simple-maps' SVG by using
  // <Marker coordinates>; for lines we use the raw projection via geoEquirectangular.
  // We approximate by using a polyline since react-simple-maps' Line only takes
  // 2 endpoints. So we build the points via the projection of the parent map.
  // Easiest: render polyline points via SVG with manual projection
  // matching geoEquirectangular: x = lng * (w/360) + w/2, y = -lat * (h/180) + h/2
  // (parent map already applies the projection to children, so we need raw screen coords)
  // For simplicity we use react-simple-maps' projection via the d3-geo helper inside the tree.

  // Easier path: render each great-circle segment as a series of <Marker>-style
  // anchored dots, OR a single <path> using the d3-geo path generator on the
  // parent. Since we're inside <ComposableMap> we can use d3-geo paths via
  // react-simple-maps' internal projection by emitting a <path> with d="..."
  // — but react-simple-maps doesn't expose its projection. So we draw a polyline
  // using simple linear lng/lat → svg-coord mapping for equirectangular.

  // svg viewbox is 800x600 by default in ComposableMap; we instead pass width/height
  // and projection scale so 1 unit lng = (w/2π/scale) px. Simpler: use raw lat/lng
  // as svg coords inside <g> that's projected; react-simple-maps clips children.

  // Pragmatic implementation: wrap polyline in <Marker> for each segment endpoint
  // and connect via SVG line in absolute coords using equirectangular formula
  // bound to the canvas size. For now we render the polyline coords directly
  // in lng/lat space inside the ComposableMap — react-simple-maps projects child
  // SVG elements automatically only for <Marker>/<Annotation>/<Graticule>. For
  // arbitrary <path>/<polyline> we need projected coords.

  // Fallback: use react-simple-maps' <Line>, which takes from/to coords and
  // renders a great-circle arc between them. Each densified segment becomes
  // a chained set of Lines. The lib's <Line> projects internally.

  // We use a <g> of <Marker> wrappers to project each densified point into
  // svg space, then draw a polyline through those projected screen coords.
  // Simpler still: import <Line from="..." to="..."> and chain pairs.

  // For now: render the segment as a chain of small Lines between consecutive points.
  // Lines support strokeDasharray for the dot effect.

  return (
    <g>
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        return (
          <ArcSegment
            key={i}
            from={p}
            to={next}
            color="rgba(255,255,255,0.55)"
            strokeWidth={1}
            dashArray="3 4"
            reducedMotion={reducedMotion}
          />
        );
      })}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        return (
          <ArcSegment
            key={`s-${i}`}
            from={p}
            to={next}
            color={accent}
            strokeWidth={1.6}
            reducedMotion={reducedMotion}
          />
        );
      })}
      {/* moving dot, animated with framer-motion along the path */}
      <ArcDot points={points} color={accent} durationMs={durationMs} reducedMotion={reducedMotion} />
    </g>
  );
}

function ArcSegment({
  from,
  to,
  color,
  strokeWidth,
  dashArray,
}: {
  from: LngLat;
  to: LngLat;
  color: string;
  strokeWidth: number;
  dashArray?: string;
  reducedMotion: boolean;
}) {
  return (
    <Line
      from={from}
      to={to}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={dashArray}
    />
  );
}

function ArcDot({
  points,
  color,
  durationMs,
  reducedMotion,
}: {
  points: LngLat[];
  color: string;
  durationMs: number;
  reducedMotion: boolean;
}) {
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);
  useEffect(() => {
    if (reducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(1);
      return;
    }
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const safeDuration = Math.max(1, durationMs);
    function tick(now: number) {
      if (cancelled) return;
      // Continuous loop: traverse origin → destination, then jump back.
      const elapsed = (now - start) % safeDuration;
      setProgress(elapsed / safeDuration);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [durationMs, reducedMotion, points.length]);

  if (points.length < 2) return null;
  const idxF = Math.max(0, Math.min(1, progress)) * (points.length - 1);
  const i = Math.floor(idxF);
  const t = idxF - i;
  const a = points[i];
  if (!a) return null;
  const b = points[i + 1] ?? a;
  const point: LngLat = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  return (
    <Marker coordinates={point}>
      <motion.circle
        r={2.5}
        fill={color}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
      />
    </Marker>
  );
}

function AirportMarker({
  airport,
  isSelected,
  accent,
  onClick,
}: {
  airport: Airport;
  isSelected: boolean;
  accent: string;
  onClick: () => void;
}) {
  const isMajor = MAJOR_HUBS.has(airport.iata);
  const r = isSelected ? 7 : isMajor ? 3.6 : 2.4;
  const fill = isSelected ? accent : isMajor ? "rgba(230,238,248,0.95)" : "rgba(180,190,205,0.75)";
  return (
    <Marker
      coordinates={[airport.lng, airport.lat]}
      onClick={onClick}
      style={{
        default: { cursor: "pointer" },
        hover: { cursor: "pointer" },
        pressed: { cursor: "pointer" },
      }}
    >
      {isSelected && (
        <circle r={r * 2.5} fill={accent} opacity={0.18} />
      )}
      <circle r={r} fill={fill} stroke="rgba(0,0,0,0.4)" strokeWidth={0.4} />
    </Marker>
  );
}
