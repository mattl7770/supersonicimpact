"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

import { airports } from "@/lib/airports";
import { greatCircleArc, splitAtAntimeridian, type LngLat } from "@/lib/geo";
import { useSelection } from "@/lib/selection-context";
import { buildRouteForPair } from "@/lib/flight-time";
import { routes } from "@/data/routes";
import { formatHours } from "@/lib/format";

import { arcColors, buildMapStyle, getThemeColors, type MapTheme } from "./map-style";
import type { Projection } from "./projection-toggle";

type MapCanvasProps = {
  projection: Projection;
  theme: MapTheme;
};

type EmptyFC = { type: "FeatureCollection"; features: [] };
const emptyFC: EmptyFC = { type: "FeatureCollection", features: [] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topology = worldAtlas as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countriesGeoJSON = feature(topology, topology.objects.countries) as any;

function airportsFC() {
  return {
    type: "FeatureCollection" as const,
    features: airports.map((a) => ({
      type: "Feature" as const,
      properties: { iata: a.iata, city: a.city },
      geometry: { type: "Point" as const, coordinates: [a.lng, a.lat] as [number, number] },
    })),
  };
}

function arcToFC(segments: LngLat[][]) {
  return {
    type: "FeatureCollection" as const,
    features: segments
      .filter((s) => s.length >= 2)
      .map((coords) => ({
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: coords },
      })),
  };
}

function highlightFC(points: LngLat[]) {
  return {
    type: "FeatureCollection" as const,
    features: points.map((coords) => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "Point" as const, coordinates: coords },
    })),
  };
}

const ARC_SEGMENTS = 96;
const SUPERSONIC_DRAW_MS = 2400;

export function MapCanvas({ projection, theme }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const styleLoadedRef = useRef(false);
  const animationFramesRef = useRef<number[]>([]);

  const { origin, destination, selectAirport } = useSelection();

  const [labelData, setLabelData] = useState<{
    destination: LngLat;
    supersonicHours: number;
    subsonicHours: number;
    showSupersonic: boolean;
    showSubsonic: boolean;
  } | null>(null);

  const [destPx, setDestPx] = useState<{ x: number; y: number } | null>(null);

  // Selected route (derived) so we know the hours to label
  const route = useMemo(() => {
    if (!origin || !destination) return null;
    return buildRouteForPair(origin, destination, routes);
  }, [origin, destination]);

  // Always-current ref to the desired projection so the load handler can
  // apply it without re-creating the map.
  const projectionRef = useRef<Projection>(projection);
  useEffect(() => {
    projectionRef.current = projection;
  }, [projection]);

  // ---------- Init map once ----------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildMapStyle(theme, countriesGeoJSON),
      center: [0, 25],
      zoom: 1.4,
      attributionControl: false,
      dragRotate: true,
      pitchWithRotate: false,
      touchZoomRotate: true,
      maxZoom: 6,
      minZoom: 0.8,
    });

    mapRef.current = map;

    map.on("load", () => {
      styleLoadedRef.current = true;
      try {
        map.setProjection({ type: projectionRef.current });
      } catch {
        // ignore — some browsers/contexts may not support globe yet
      }

      map.addSource("airports", { type: "geojson", data: airportsFC() });
      map.addSource("arc-subsonic", { type: "geojson", data: emptyFC });
      map.addSource("arc-supersonic", { type: "geojson", data: emptyFC });
      map.addSource("highlights", { type: "geojson", data: emptyFC });

      const colors = getThemeColors(theme);

      map.addLayer({
        id: "airports-base",
        type: "circle",
        source: "airports",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            1, 2,
            3, 3,
            6, 4.5,
          ],
          "circle-color": colors.airportBase,
          "circle-opacity": 0.65,
          "circle-stroke-color": colors.background,
          "circle-stroke-width": 0.5,
        },
      });

      map.addLayer({
        id: "arc-subsonic",
        type: "line",
        source: "arc-subsonic",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": arcColors.subsonic,
          "line-width": 1.6,
          "line-opacity": 0.75,
          "line-dasharray": [2, 1.5],
        },
      });

      map.addLayer({
        id: "arc-supersonic-glow",
        type: "line",
        source: "arc-supersonic",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": arcColors.supersonic,
          "line-width": 8,
          "line-opacity": 0.18,
          "line-blur": 6,
        },
      });

      map.addLayer({
        id: "arc-supersonic",
        type: "line",
        source: "arc-supersonic",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": arcColors.supersonic,
          "line-width": 2.2,
          "line-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "highlights-glow",
        type: "circle",
        source: "highlights",
        paint: {
          "circle-radius": 18,
          "circle-color": arcColors.highlight,
          "circle-opacity": 0.18,
          "circle-blur": 0.7,
        },
      });

      map.addLayer({
        id: "highlights-core",
        type: "circle",
        source: "highlights",
        paint: {
          "circle-radius": 5,
          "circle-color": arcColors.highlight,
          "circle-stroke-color":
            theme === "dark"
              ? arcColors.highlightRing.dark
              : arcColors.highlightRing.light,
          "circle-stroke-width": 1.5,
        },
      });

      map.on("click", "airports-base", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const iata = f.properties?.iata as string | undefined;
        if (!iata) return;
        const a = airports.find((x) => x.iata === iata);
        if (a) selectAirportRef.current(a);
      });

      map.on("mouseenter", "airports-base", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "airports-base", () => {
        map.getCanvas().style.cursor = "";
      });

      // Trigger initial render of arcs if origin/destination already set
      pendingDrawRef.current = true;
      maybeDraw();
    });

    // Idle auto-rotate in globe mode — premium touch.
    let lastInteractionAt = performance.now();
    let rotateFrameId: number | null = null;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function noteInteraction() {
      lastInteractionAt = performance.now();
    }
    map.on("mousedown", noteInteraction);
    map.on("touchstart", noteInteraction);
    map.on("wheel", noteInteraction);
    map.on("dragstart", noteInteraction);

    function rotateTick() {
      if (
        !reduceMotion &&
        projectionRef.current === "globe" &&
        styleLoadedRef.current &&
        performance.now() - lastInteractionAt > 1800
      ) {
        const c = map.getCenter();
        map.setCenter([c.lng + 0.12, c.lat]);
      }
      rotateFrameId = requestAnimationFrame(rotateTick);
    }
    rotateFrameId = requestAnimationFrame(rotateTick);

    return () => {
      if (rotateFrameId !== null) cancelAnimationFrame(rotateFrameId);
      cancelFrames();
      map.remove();
      mapRef.current = null;
      styleLoadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always-current ref to selectAirport so we don't recreate the click handler
  const selectAirportRef = useRef(selectAirport);
  useEffect(() => {
    selectAirportRef.current = selectAirport;
  }, [selectAirport]);

  // ---------- Projection toggle ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoadedRef.current) return;
    try {
      map.setProjection({ type: projection });
    } catch {
      // ignore
    }
  }, [projection]);

  // ---------- Theme swap (update paint props in place) ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoadedRef.current) return;
    const colors = getThemeColors(theme);
    map.setPaintProperty("background", "background-color", colors.background);
    map.setPaintProperty("countries-fill", "fill-color", colors.countriesFill);
    map.setPaintProperty("countries-stroke", "line-color", colors.countriesStroke);
    map.setPaintProperty("airports-base", "circle-color", colors.airportBase);
    map.setPaintProperty("airports-base", "circle-stroke-color", colors.background);
    map.setPaintProperty(
      "highlights-core",
      "circle-stroke-color",
      theme === "dark"
        ? arcColors.highlightRing.dark
        : arcColors.highlightRing.light,
    );
  }, [theme]);

  // ---------- Draw arcs when selection changes ----------
  const pendingDrawRef = useRef(false);

  function cancelFrames() {
    for (const id of animationFramesRef.current) cancelAnimationFrame(id);
    animationFramesRef.current = [];
  }

  function maybeDraw() {
    const map = mapRef.current;
    if (!map || !styleLoadedRef.current) {
      pendingDrawRef.current = true;
      return;
    }
    pendingDrawRef.current = false;

    cancelFrames();

    const subSrc = map.getSource("arc-subsonic") as GeoJSONSource | undefined;
    const supSrc = map.getSource("arc-supersonic") as GeoJSONSource | undefined;
    const hlSrc = map.getSource("highlights") as GeoJSONSource | undefined;
    if (!subSrc || !supSrc || !hlSrc) return;

    if (!origin || !destination) {
      subSrc.setData(emptyFC);
      supSrc.setData(emptyFC);
      hlSrc.setData(emptyFC);
      setLabelData(null);
      return;
    }

    const a: LngLat = [origin.lng, origin.lat];
    const b: LngLat = [destination.lng, destination.lat];
    const arc = greatCircleArc(a, b, ARC_SEGMENTS);

    hlSrc.setData(highlightFC([a, b]));

    // Fit the map to show both endpoints with padding
    try {
      const bounds = new maplibregl.LngLatBounds();
      arc.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, {
        padding: { top: 80, right: 80, bottom: 80, left: 80 },
        duration: 900,
        maxZoom: 4,
      });
    } catch {
      // ignore bound errors on tiny segments
    }

    const ratio = route ? route.subsonicHours / route.supersonicHours : 2;
    const supersonicMs = SUPERSONIC_DRAW_MS;
    const subsonicMs = supersonicMs * ratio;

    setLabelData({
      destination: b,
      supersonicHours: route?.supersonicHours ?? 0,
      subsonicHours: route?.subsonicHours ?? 0,
      showSupersonic: false,
      showSubsonic: false,
    });

    // Respect reduced motion
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const segs = splitAtAntimeridian(arc);
      subSrc.setData(arcToFC(segs));
      supSrc.setData(arcToFC(segs));
      setLabelData((d) =>
        d ? { ...d, showSupersonic: true, showSubsonic: true } : d,
      );
      return;
    }

    const startTime = performance.now();

    function animateArc(
      src: GeoJSONSource,
      durationMs: number,
      onDone: () => void,
    ) {
      function frame(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const points = Math.max(2, Math.ceil(progress * arc.length));
        const slice = arc.slice(0, points);
        const segs = splitAtAntimeridian(slice);
        src.setData(arcToFC(segs));
        if (progress < 1) {
          animationFramesRef.current.push(requestAnimationFrame(frame));
        } else {
          onDone();
        }
      }
      animationFramesRef.current.push(requestAnimationFrame(frame));
    }

    animateArc(supSrc, supersonicMs, () => {
      setLabelData((d) => (d ? { ...d, showSupersonic: true } : d));
    });
    animateArc(subSrc, subsonicMs, () => {
      setLabelData((d) => (d ? { ...d, showSubsonic: true } : d));
    });
  }

  useEffect(() => {
    maybeDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, route]);

  // ---------- Re-project label position on map move ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !labelData) {
      setDestPx(null);
      return;
    }
    function update() {
      if (!map || !labelData) return;
      const p = map.project(labelData.destination);
      setDestPx({ x: p.x, y: p.y });
    }
    update();
    map.on("move", update);
    map.on("zoom", update);
    return () => {
      map.off("move", update);
      map.off("zoom", update);
    };
  }, [labelData]);

  const hoursSaved = labelData
    ? labelData.subsonicHours - labelData.supersonicHours
    : 0;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Overlay labels */}
      {labelData && destPx && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: destPx.x,
            top: destPx.y,
            transform: "translate(12px, -50%)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            {labelData.showSupersonic && (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium tabular-nums text-accent backdrop-blur-sm transition-opacity duration-300">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Supersonic · {formatHours(labelData.supersonicHours)}
              </span>
            )}
            {labelData.showSubsonic && (
              <span className="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-2.5 py-1 text-[11px] font-medium tabular-nums text-foreground/80 backdrop-blur-sm transition-opacity duration-300">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/50" />
                Subsonic · {formatHours(labelData.subsonicHours)}
              </span>
            )}
            {labelData.showSubsonic && hoursSaved > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold tabular-nums text-background shadow-lg shadow-accent/30 backdrop-blur-sm">
                Saved {formatHours(hoursSaved)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
