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
import { greatCircleArc } from "@/lib/geo";
import { computeRouteSegments } from "@/lib/route-terrain";

import { MapPlaceholder } from "./placeholder";

const BOOMLESS_COLOR = "#fbbf24"; // amber-400
const SUBSONIC_LAND_COLOR = "#9ca3af"; // gray-400

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

type GlobeCanvasProps = { theme: "light" | "dark" };

type AirportPoint = Airport & { isOrigin: boolean; isDest: boolean };

/** A path is a sampled great-circle line with per-point altitude. */
type PathPoint = [number, number, number]; // [lat, lng, alt]

type PathDatum = {
  points: PathPoint[];
  color: string;
  stroke: number;
  dashLength: number;
  dashGap: number;
  dashInitialGap: number;
  dashAnimateTime: number;
  layer: "halo" | "supersonic-main" | "supersonic-dot" | "subsonic-main" | "subsonic-dot";
  routeLabel: string;
  savedLabel: string;
};

const ARC_SEGMENTS = 256;
const GLOBE_RADIUS = 100; // three-globe's GLOBE_RADIUS

/**
 * Smooth sinusoidal altitude profile: 0 at the endpoints, peak at the
 * midpoint, with a long gradual rise and fall. Because each point along
 * the great circle gets its own altitude, the curve never interpolates
 * THROUGH the planet — so the same peak works for short and antipodal
 * routes alike.
 */
function altitudeAt(t: number, peak: number): number {
  if (t <= 0 || t >= 1) return 0;
  return peak * Math.sin(t * Math.PI);
}

function buildPathPoints(
  origin: Airport,
  destination: Airport,
  peakAltitude: number,
): PathPoint[] {
  const arc = greatCircleArc(
    [origin.lng, origin.lat],
    [destination.lng, destination.lat],
    ARC_SEGMENTS,
  );
  return arc.map(([lng, lat], i) => {
    const t = i / (arc.length - 1);
    return [lat, lng, altitudeAt(t, peakAltitude)];
  });
}

// Match three-globe's polar2Cartesian convention exactly so the custom
// TubeGeometry aligns with airport markers / labels rendered by three-globe.
function polarToVec3(lat: number, lng: number, altitude: number, target: THREE.Vector3): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (90 - lng) * Math.PI / 180;
  const r = GLOBE_RADIUS * (1 + altitude);
  const phiSin = Math.sin(phi);
  return target.set(
    r * phiSin * Math.cos(theta),
    r * Math.cos(phi),
    r * phiSin * Math.sin(theta),
  );
}

/**
 * A three.js Curve that follows the great-circle path between two
 * lat/lng points with a sine altitude profile. Plugged into
 * TubeGeometry to get a single smooth mesh instead of fat-line quads.
 */
class GreatCircleAltCurve extends THREE.Curve<THREE.Vector3> {
  private p0 = new THREE.Vector3();
  private p1 = new THREE.Vector3();
  private angle: number;
  private sinAngle: number;
  private peakAltitude: number;

  constructor(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    peakAltitude: number,
  ) {
    super();
    polarToVec3(startLat, startLng, 0, this.p0).divideScalar(GLOBE_RADIUS);
    polarToVec3(endLat, endLng, 0, this.p1).divideScalar(GLOBE_RADIUS);
    const dot = Math.max(-1, Math.min(1, this.p0.dot(this.p1)));
    this.angle = Math.acos(dot);
    this.sinAngle = Math.sin(this.angle);
    this.peakAltitude = peakAltitude;
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const clamped = Math.max(0, Math.min(1, t));
    const dir = new THREE.Vector3();
    if (this.sinAngle < 1e-6) {
      dir.copy(this.p0).lerp(this.p1, clamped);
    } else {
      const s0 = Math.sin((1 - clamped) * this.angle) / this.sinAngle;
      const s1 = Math.sin(clamped * this.angle) / this.sinAngle;
      dir.copy(this.p0).multiplyScalar(s0).addScaledVector(this.p1, s1);
    }
    dir.normalize();
    const altFactor = Math.sin(clamped * Math.PI);
    const r = GLOBE_RADIUS * (1 + altFactor * this.peakAltitude);
    return target.copy(dir).multiplyScalar(r);
  }
}

type TerrainBand = {
  startProgress: number;
  endProgress: number;
  isLand: boolean;
};

type CustomArcDatum = {
  id: string;
  kind: "halo" | "supersonic-main" | "subsonic-main";
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  peakAltitude: number;
  color: string;
  opacity: number;
  radius: number;
  /**
   * Optional per-segment terrain bands for the supersonic line. When
   * supplied, vertices along the tube are colored by which band their
   * `u` parameter falls into — over-water uses `color`, over-land uses
   * `overLandColor`.
   */
  segments?: TerrainBand[];
  overLandColor?: string;
};

function colorAtProgress(
  u: number,
  bands: TerrainBand[],
  waterColor: string,
  landColor: string,
): string {
  for (const b of bands) {
    if (u >= b.startProgress && u <= b.endProgress) {
      return b.isLand ? landColor : waterColor;
    }
  }
  return waterColor;
}

function buildCustomArcObject(item: CustomArcDatum): THREE.Object3D {
  const curve = new GreatCircleAltCurve(
    item.startLat,
    item.startLng,
    item.endLat,
    item.endLng,
    item.peakAltitude,
  );
  const tubularSegments = 128;
  const radialSegments = 8;
  const geometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    item.radius,
    radialSegments,
    false,
  );

  const useVertexColors =
    item.segments !== undefined && item.overLandColor !== undefined;
  if (useVertexColors) {
    const segments = item.segments!;
    const overLand = item.overLandColor!;
    const overWater = item.color;
    const ringCount = tubularSegments + 1;
    const verticesPerRing = radialSegments + 1;
    const colors = new Float32Array(ringCount * verticesPerRing * 3);
    const c = new THREE.Color();
    for (let i = 0; i < ringCount; i++) {
      const u = i / tubularSegments;
      const hex = colorAtProgress(u, segments, overWater, overLand);
      c.set(hex);
      for (let j = 0; j < verticesPerRing; j++) {
        const idx = (i * verticesPerRing + j) * 3;
        colors[idx] = c.r;
        colors[idx + 1] = c.g;
        colors[idx + 2] = c.b;
      }
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }

  const material = new THREE.MeshBasicMaterial({
    color: useVertexColors ? 0xffffff : item.color,
    vertexColors: useVertexColors,
    transparent: item.opacity < 1,
    opacity: item.opacity,
    depthWrite: item.opacity >= 0.95,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = item.kind === "halo" ? 1 : 2;
  return mesh;
}

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

  const paths = useMemo<PathDatum[]>(() => {
    if (!origin || !destination || !route) return [];
    const ratio = route.subsonicHours / route.supersonicHours;
    const dotSpeedSupersonic = isReducedMotion ? 0 : SUPERSONIC_DRAW_MS;
    const dotSpeedSubsonic = isReducedMotion ? 0 : SUPERSONIC_DRAW_MS * ratio;
    const routeLabel = `${origin.iata} → ${destination.iata}`;
    const savedLabel = `Saved ${formatHours(route.subsonicHours - route.supersonicHours)}`;

    // Peak altitudes (in globe-radii). Same for any route length.
    const SUPERSONIC_ALT = 0.14;
    const SUBSONIC_ALT = 0.09;

    const supersonicPath = buildPathPoints(origin, destination, SUPERSONIC_ALT);
    const subsonicPath = buildPathPoints(origin, destination, SUBSONIC_ALT);

    // Only the moving dots stay on pathsData — dashed fat-line is fine
    // for small dots since only one quad is visible at a time.
    return [
      // Supersonic moving dot (accent blue — sized clearly above the
      // supersonic-main tube so it pops out rather than being obscured)
      {
        points: supersonicPath,
        color: accent,
        stroke: 10,
        dashLength: 0.04,
        dashGap: 0.96,
        dashInitialGap: 1,
        dashAnimateTime: dotSpeedSupersonic,
        layer: "supersonic-dot",
        routeLabel,
        savedLabel,
      },
      // Subsonic moving dot
      {
        points: subsonicPath,
        color: "rgba(255,255,255,0.95)",
        stroke: 7,
        dashLength: 0.035,
        dashGap: 0.965,
        dashInitialGap: 1,
        dashAnimateTime: dotSpeedSubsonic,
        layer: "subsonic-dot",
        routeLabel,
        savedLabel,
      },
    ];
  }, [origin, destination, route, isReducedMotion, accent]);

  // Custom-layer entries render the static line layers as a single smooth
  // TubeGeometry mesh per layer (no Line2 quad seams).
  const customArcs = useMemo<CustomArcDatum[]>(() => {
    if (!origin || !destination || !route) return [];
    const SUPERSONIC_ALT = 0.14;
    const SUBSONIC_ALT = 0.09;
    const terrainBands = computeRouteSegments(
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    );
    const overLandColor = config.hasBoomlessCruise
      ? BOOMLESS_COLOR
      : SUBSONIC_LAND_COLOR;
    return [
      {
        id: `halo-${origin.iata}-${destination.iata}`,
        kind: "halo",
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        peakAltitude: SUPERSONIC_ALT,
        color: "#ffffff",
        opacity: 0.18,
        radius: 1.0,
      },
      {
        id: `supersonic-${origin.iata}-${destination.iata}-${config.hasBoomlessCruise ? "b" : "s"}`,
        kind: "supersonic-main",
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        peakAltitude: SUPERSONIC_ALT,
        // Over-water color for the supersonic tube. Over-land vertices use
        // `overLandColor`. We keep over-water "bright white" so the line
        // still reads cleanly against the dark globe; the colored stretches
        // mark where the aircraft has to slow down.
        color: "#ffffff",
        opacity: 0.95,
        radius: 0.4,
        segments: terrainBands,
        overLandColor,
      },
      {
        id: `subsonic-${origin.iata}-${destination.iata}`,
        kind: "subsonic-main",
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        peakAltitude: SUBSONIC_ALT,
        color: "#ffffff",
        opacity: 0.55,
        radius: 0.3,
      },
    ];
  }, [origin, destination, route, config.hasBoomlessCruise]);

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
          // Static arc lines: rendered as smooth TubeGeometry meshes
          // via the customLayer (Line2 fat-line had visible quad seams).
          customLayerData={customArcs}
          customThreeObject={(d: object) =>
            buildCustomArcObject(d as CustomArcDatum)
          }
          // Moving dots stay on pathsData — Line2 dash artifacts aren't
          // visible at the small per-frame dot size.
          pathsData={paths}
          pathPoints="points"
          pathPointLat={(p: object) => (p as PathPoint)[0]}
          pathPointLng={(p: object) => (p as PathPoint)[1]}
          pathPointAlt={(p: object) => (p as PathPoint)[2]}
          pathColor="color"
          pathStroke="stroke"
          pathResolution={0.5}
          pathDashLength="dashLength"
          pathDashGap="dashGap"
          pathDashInitialGap="dashInitialGap"
          pathDashAnimateTime="dashAnimateTime"
          pathTransitionDuration={0}
        />
      )}
    </div>
  );
}
