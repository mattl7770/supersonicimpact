"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import type { GlobeMethods } from "react-globe.gl";

import { MAJOR_HUBS, airports, type Airport } from "@/lib/airports";
import { useSelection } from "@/lib/selection-context";
import { useAircraft } from "@/lib/aircraft-context";
import { buildRouteForPair } from "@/lib/flight-time";
import { routes } from "@/data/routes";
import { formatHours } from "@/lib/format";
import { getSunDirection } from "@/lib/sun";

import { MapPlaceholder } from "./placeholder";

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
  altitude?: number;
  dashLength: number;
  dashGap: number;
  dashInitialGap: number;
  dashAnimateTime: number;
  routeLabel: string;
  savedLabel: string;
  layer: "halo" | "supersonic-main" | "supersonic-dot" | "subsonic-main" | "subsonic-dot";
};

type LabelDatum = {
  lat: number;
  lng: number;
  text: string;
};

const SUPERSONIC_DRAW_MS = 2400;

const CITY_LABELS: LabelDatum[] = airports
  .filter((a) => MAJOR_HUBS.has(a.iata))
  .map((a) => ({ lat: a.lat, lng: a.lng, text: a.city }));

function buildGlobeMaterial(): THREE.ShaderMaterial {
  const loader = new THREE.TextureLoader();
  const dayTexture = loader.load("/earth/earth-day.jpg");
  const nightTexture = loader.load("/earth/earth-night.jpg");
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform vec3 sunDirection;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      void main() {
        float intensity = dot(normalize(vWorldNormal), normalize(sunDirection));
        // Soft terminator transition over a ~0.3 dot-product band.
        float dayFactor = smoothstep(-0.08, 0.22, intensity);
        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = texture2D(nightTexture, vUv).rgb * 1.25;
        vec3 color = mix(nightColor, dayColor, dayFactor);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export function GlobeCanvas({ theme }: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { origin, destination, selectAirport } = useSelection();
  const { config } = useAircraft();

  // react-globe.gl needs explicit pixel width/height.
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
    return buildRouteForPair(origin, destination, routes, config);
  }, [origin, destination, config]);

  const isReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Globe material — single instance, sun-uniform updated over time.
  const globeMaterial = useMemo(() => buildGlobeMaterial(), []);

  // Keep sun direction up to date.
  useEffect(() => {
    function tick() {
      const [x, y, z] = getSunDirection(new Date());
      const v = globeMaterial.uniforms.sunDirection.value as THREE.Vector3;
      v.set(x, y, z);
    }
    tick();
    const interval = window.setInterval(tick, 60_000);
    return () => window.clearInterval(interval);
  }, [globeMaterial]);

  const accent = theme === "dark" ? "#22d3ee" : "#06b6d4";

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
    const dotSpeedSupersonic = isReducedMotion ? 0 : SUPERSONIC_DRAW_MS;
    const dotSpeedSubsonic = isReducedMotion ? 0 : SUPERSONIC_DRAW_MS * ratio;
    const routeLabel = `${origin.iata} → ${destination.iata}`;
    const savedLabel = `Saved ${formatHours(route.subsonicHours - route.supersonicHours)}`;
    const common = {
      startLat: origin.lat,
      startLng: origin.lng,
      endLat: destination.lat,
      endLng: destination.lng,
      routeLabel,
      savedLabel,
    };
    return [
      // Supersonic glow halo
      {
        ...common,
        color: "rgba(255,255,255,0.18)",
        stroke: 1.4,
        dashLength: 1,
        dashGap: 0,
        dashInitialGap: 0,
        dashAnimateTime: 0,
        layer: "halo",
      },
      // Supersonic main line
      {
        ...common,
        color: "rgba(255,255,255,0.95)",
        stroke: 0.6,
        dashLength: 1,
        dashGap: 0,
        dashInitialGap: 0,
        dashAnimateTime: 0,
        layer: "supersonic-main",
      },
      // Supersonic moving dot
      {
        ...common,
        color: "#ffffff",
        stroke: 0.85,
        altitude: 0.32,
        dashLength: 0.04,
        dashGap: 0.96,
        dashInitialGap: 1,
        dashAnimateTime: dotSpeedSupersonic,
        layer: "supersonic-dot",
      },
      // Subsonic main (dashed)
      {
        ...common,
        color: "rgba(255,255,255,0.55)",
        stroke: 0.4,
        dashLength: 0.22,
        dashGap: 0.14,
        dashInitialGap: 0,
        dashAnimateTime: 0,
        layer: "subsonic-main",
      },
      // Subsonic moving dot
      {
        ...common,
        color: "rgba(255,255,255,0.85)",
        stroke: 0.65,
        altitude: 0.18,
        dashLength: 0.035,
        dashGap: 0.965,
        dashInitialGap: 1,
        dashAnimateTime: dotSpeedSubsonic,
        layer: "subsonic-dot",
      },
    ];
  }, [origin, destination, route, isReducedMotion]);

  // Camera frames the route midpoint when both endpoints are set.
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !origin || !destination) return;
    const lat = (origin.lat + destination.lat) / 2;
    let lng = (origin.lng + destination.lng) / 2;
    if (Math.abs(origin.lng - destination.lng) > 180) {
      lng = lng > 0 ? lng - 180 : lng + 180;
    }
    g.pointOfView({ lat, lng, altitude: 2.1 }, 1200);
  }, [origin, destination]);

  // Idle auto-rotate when there's no active selection.
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls() as {
      autoRotate: boolean;
      autoRotateSpeed: number;
    };
    if (!controls) return;
    controls.autoRotate = !isReducedMotion && (!origin || !destination);
    controls.autoRotateSpeed = 0.35;
  }, [isReducedMotion, size.w, origin, destination]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {size.w > 0 && size.h > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#bcd5ea"
          atmosphereAltitude={0.14}
          globeMaterial={globeMaterial}
          // Airport markers
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={(d: object) => {
            const p = d as AirportPoint;
            if (p.isOrigin || p.isDest) return 0.04;
            return MAJOR_HUBS.has(p.iata) ? 0.02 : 0.012;
          }}
          pointRadius={(d: object) => {
            const p = d as AirportPoint;
            if (p.isOrigin || p.isDest) return 0.75;
            return MAJOR_HUBS.has(p.iata) ? 0.55 : 0.36;
          }}
          pointColor={(d: object) => {
            const p = d as AirportPoint;
            if (p.isOrigin || p.isDest) return accent;
            if (MAJOR_HUBS.has(p.iata)) return "rgba(230,238,248,0.95)";
            return "rgba(180,190,205,0.7)";
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
          // City labels
          labelsData={CITY_LABELS}
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelSize={0.4}
          labelDotRadius={0}
          labelColor={() => "rgba(255,255,255,0.65)"}
          labelResolution={2}
          labelAltitude={0.012}
          // Arcs
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcStroke="stroke"
          arcAltitude={(d: object) => {
            const a = d as ArcDatum;
            return a.altitude ?? null;
          }}
          arcAltitudeAutoScale={0.45}
          arcDashLength="dashLength"
          arcDashGap="dashGap"
          arcDashInitialGap="dashInitialGap"
          arcDashAnimateTime="dashAnimateTime"
          arcsTransitionDuration={0}
          arcLabel={(d: object) => {
            const a = d as ArcDatum;
            if (a.layer === "supersonic-main") {
              return `<div style="font:600 11px ui-sans-serif;background:rgba(9,9,11,0.85);color:white;padding:6px 10px;border-radius:9999px;border:1px solid rgba(255,255,255,0.15);">${a.routeLabel} · ${a.savedLabel}</div>`;
            }
            return "";
          }}
        />
      )}
    </div>
  );
}
