"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";

import { airports, type Airport } from "@/lib/airports";
import { useSelection } from "@/lib/selection-context";
import { buildRouteForPair } from "@/lib/flight-time";
import { routes } from "@/data/routes";
import { formatHours } from "@/lib/format";

import { MapPlaceholder } from "./placeholder";

// react-globe.gl reads `window` on import, so we MUST ssr:false it.
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

type GlobeCanvasProps = { theme: "light" | "dark" };

type AirportPoint = Airport & { isOrigin: boolean; isDest: boolean };

type ArcDatum = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  stroke: number;
  dashLength: number;
  dashGap: number;
  dashAnimateTime: number;
};

type LabelStage = "supersonic" | "final";

type LabelDatum = {
  lat: number;
  lng: number;
  supersonicHours: number;
  subsonicHours: number;
  stage: LabelStage;
  accent: string;
  fg: string;
  bg: string;
};

const SUPERSONIC_MS = 2400;

export function GlobeCanvas({ theme }: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { origin, destination, selectAirport } = useSelection();

  // react-globe.gl needs explicit pixel width/height (no auto-fill).
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({
        w: Math.round(entry.contentRect.width),
        h: Math.round(entry.contentRect.height),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const route = useMemo(() => {
    if (!origin || !destination) return null;
    return buildRouteForPair(origin, destination, routes);
  }, [origin, destination]);

  const isReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme tokens — matched to our CSS variables.
  const accent = theme === "dark" ? "#22d3ee" : "#06b6d4";
  const dim = theme === "dark" ? "#71717a" : "#a1a1aa";
  const bg = theme === "dark" ? "#09090b" : "#fafafa";
  const fg = theme === "dark" ? "#fafafa" : "#0a0a0a";

  const points = useMemo<AirportPoint[]>(
    () =>
      airports.map((a) => ({
        ...a,
        isOrigin: origin?.iata === a.iata,
        isDest: destination?.iata === a.iata,
      })),
    [origin, destination],
  );

  const arcs = useMemo<ArcDatum[]>(() => {
    if (!origin || !destination || !route) return [];
    const ratio = route.subsonicHours / route.supersonicHours;
    return [
      {
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        color: accent,
        stroke: 0.65,
        dashLength: 1,
        dashGap: 0,
        dashAnimateTime: isReducedMotion ? 0 : SUPERSONIC_MS,
      },
      {
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        color: dim,
        stroke: 0.4,
        dashLength: 0.3,
        dashGap: 0.15,
        dashAnimateTime: isReducedMotion ? 0 : SUPERSONIC_MS * ratio,
      },
    ];
  }, [origin, destination, route, accent, dim, isReducedMotion]);

  // Two-stage label reveal: supersonic chip first, then subsonic + saved.
  const [stage, setStage] = useState<LabelStage | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStage(null);
    if (!origin || !destination || !route) return;
    if (isReducedMotion) {
      setStage("final");
      return;
    }
    const ratio = route.subsonicHours / route.supersonicHours;
    const t1 = setTimeout(() => setStage("supersonic"), SUPERSONIC_MS);
    const t2 = setTimeout(() => setStage("final"), SUPERSONIC_MS * ratio);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [origin, destination, route, isReducedMotion]);

  const htmlData = useMemo<LabelDatum[]>(() => {
    if (!destination || !route || !stage) return [];
    return [
      {
        lat: destination.lat,
        lng: destination.lng,
        supersonicHours: route.supersonicHours,
        subsonicHours: route.subsonicHours,
        stage,
        accent,
        fg,
        bg,
      },
    ];
  }, [destination, route, stage, accent, fg, bg]);

  // Camera frames the route midpoint when both endpoints are set.
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !origin || !destination) return;
    const lat = (origin.lat + destination.lat) / 2;
    let lng = (origin.lng + destination.lng) / 2;
    // Avoid the long-way-around for transpacific midpoints.
    if (Math.abs(origin.lng - destination.lng) > 180) {
      lng = lng > 0 ? lng - 180 : lng + 180;
    }
    g.pointOfView({ lat, lng, altitude: 2.3 }, 1200);
  }, [origin, destination]);

  // Idle auto-rotate.
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls() as {
      autoRotate: boolean;
      autoRotateSpeed: number;
    };
    if (!controls) return;
    controls.autoRotate = !isReducedMotion;
    controls.autoRotateSpeed = 0.4;
  }, [isReducedMotion, size.w]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {size.w > 0 && size.h > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor={accent}
          atmosphereAltitude={0.18}
          globeImageUrl={
            theme === "dark"
              ? "//unpkg.com/three-globe/example/img/earth-dark.jpg"
              : "//unpkg.com/three-globe/example/img/earth-day.jpg"
          }
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          // Airport markers
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={(d: object) => {
            const p = d as AirportPoint;
            return p.isOrigin || p.isDest ? 0.025 : 0.005;
          }}
          pointRadius={(d: object) => {
            const p = d as AirportPoint;
            return p.isOrigin || p.isDest ? 0.55 : 0.22;
          }}
          pointColor={(d: object) => {
            const p = d as AirportPoint;
            return p.isOrigin || p.isDest ? accent : "rgba(160,160,170,0.7)";
          }}
          pointLabel={(d: object) => {
            const p = d as AirportPoint;
            return `${p.flag} ${p.city} (${p.iata})`;
          }}
          pointsMerge={false}
          onPointClick={(d: object) => {
            selectAirport(d as Airport);
          }}
          onPointHover={(d: object | null) => {
            if (containerRef.current) {
              containerRef.current.style.cursor = d ? "pointer" : "";
            }
          }}
          // Arcs
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcStroke="stroke"
          arcAltitudeAutoScale={0.45}
          arcDashLength="dashLength"
          arcDashGap="dashGap"
          arcDashInitialGap={1}
          arcDashAnimateTime="dashAnimateTime"
          arcsTransitionDuration={0}
          // Time labels at the destination point
          htmlElementsData={htmlData}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.08}
          htmlElement={(d: object) => {
            const data = d as LabelDatum;
            return buildLabelElement(data);
          }}
        />
      )}
    </div>
  );
}

function buildLabelElement(d: LabelDatum): HTMLElement {
  const hoursSaved = d.subsonicHours - d.supersonicHours;
  const el = document.createElement("div");
  el.style.pointerEvents = "none";
  el.style.transform = "translate(14px, -50%)";
  el.style.fontFamily = "var(--font-geist-sans), system-ui, sans-serif";

  const chips: string[] = [];

  chips.push(`
    <div style="display:inline-flex;align-items:center;gap:6px;background:${d.accent}26;color:${d.accent};padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:500;font-variant-numeric:tabular-nums;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);">
      <span style="height:6px;width:6px;border-radius:9999px;background:${d.accent};"></span>
      Supersonic · ${formatHours(d.supersonicHours)}
    </div>
  `);

  if (d.stage === "final") {
    chips.push(`
      <div style="display:inline-flex;align-items:center;gap:6px;background:${d.fg}1a;color:${d.fg}cc;padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:500;font-variant-numeric:tabular-nums;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);">
        <span style="height:6px;width:6px;border-radius:9999px;background:${d.fg}66;"></span>
        Subsonic · ${formatHours(d.subsonicHours)}
      </div>
    `);
    chips.push(`
      <div style="display:inline-flex;align-items:center;background:${d.accent};color:${d.bg};padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;box-shadow:0 6px 18px ${d.accent}55;">
        Saved ${formatHours(hoursSaved)}
      </div>
    `);
  }

  el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px;">${chips.join("")}</div>`;
  return el;
}
