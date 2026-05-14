"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
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
        <ZoomableGroup
          zoom={1}
          minZoom={1}
          maxZoom={1}
          translateExtent={[
            [-size.w * 2.0, 0],
            [size.w * 3.0, size.h],
          ]}
        >
          {/* Render the world three times side-by-side so dragging wraps. */}
          {[-1, 0, 1].map((shift) => (
            <g
              key={`world-${shift}`}
              transform={`translate(${shift * size.w}, 0)`}
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
                <Marker
                  key={`${shift}-${label.text}`}
                  coordinates={label.coords}
                >
                  <text
                    textAnchor="middle"
                    y={4}
                    style={{
                      fontFamily:
                        "var(--font-geist-sans), system-ui, sans-serif",
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

              {/* Great-circle arcs */}
              {arcSegments.map((segment, i) => (
                <FlatArc
                  key={`arc-${shift}-${i}-${origin?.iata}-${destination?.iata}`}
                  points={segment}
                  accent={accent}
                  reducedMotion={isReducedMotion}
                  supersonicMs={2400}
                  subsonicMs={
                    route
                      ? 2400 * (route.subsonicHours / route.supersonicHours)
                      : 4800
                  }
                />
              ))}

              {/* Airports */}
              {airports.map((a) => (
                <AirportMarker
                  key={`${shift}-${a.iata}`}
                  airport={a}
                  isSelected={
                    origin?.iata === a.iata || destination?.iata === a.iata
                  }
                  accent={accent}
                  onClick={() => selectAirport(a)}
                />
              ))}
            </g>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

function FlatArc({
  points,
  accent,
  reducedMotion,
  supersonicMs,
  subsonicMs,
}: {
  points: LngLat[];
  accent: string;
  reducedMotion: boolean;
  supersonicMs: number;
  subsonicMs: number;
}) {
  // Render the segment as a chain of small <Line> from-to pairs.
  // react-simple-maps' <Line> projects its endpoints internally.
  return (
    <g>
      {/* Subsonic line: gray, dashed */}
      {points.slice(0, -1).map((p, i) => (
        <ArcSegment
          key={i}
          from={p}
          to={points[i + 1]}
          color="rgba(255,255,255,0.55)"
          strokeWidth={1}
          dashArray="3 4"
          reducedMotion={reducedMotion}
        />
      ))}
      {/* Supersonic line: accent, solid */}
      {points.slice(0, -1).map((p, i) => (
        <ArcSegment
          key={`s-${i}`}
          from={p}
          to={points[i + 1]}
          color={accent}
          strokeWidth={1.6}
          reducedMotion={reducedMotion}
        />
      ))}
      {/* Subsonic dot — slower, gray */}
      <ArcDot
        points={points}
        color="rgba(255,255,255,0.85)"
        radius={2}
        durationMs={subsonicMs}
        reducedMotion={reducedMotion}
      />
      {/* Supersonic dot — faster, accent (bigger so it reads as the "fast" one) */}
      <ArcDot
        points={points}
        color={accent}
        radius={3.5}
        durationMs={supersonicMs}
        reducedMotion={reducedMotion}
        glow
      />
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
  radius = 2.5,
  glow = false,
}: {
  points: LngLat[];
  color: string;
  durationMs: number;
  reducedMotion: boolean;
  radius?: number;
  glow?: boolean;
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
      {glow && (
        <circle r={radius * 2.6} fill={color} opacity={0.22} />
      )}
      <motion.circle
        r={radius}
        fill={color}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={glow ? 0.6 : 0}
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
