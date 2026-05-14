import type { StyleSpecification } from "maplibre-gl";

export type MapTheme = "light" | "dark";

type ThemeColors = {
  background: string;
  countriesFill: string;
  countriesStroke: string;
  airportBase: string;
};

const dark: ThemeColors = {
  background: "#09090b",
  countriesFill: "#18181b",
  countriesStroke: "#3f3f46",
  airportBase: "#52525b",
};

const light: ThemeColors = {
  background: "#fafafa",
  countriesFill: "#e4e4e7",
  countriesStroke: "#a1a1aa",
  airportBase: "#71717a",
};

export const arcColors = {
  subsonic: "#a1a1aa",
  supersonic: "#22d3ee",
  highlight: "#22d3ee",
  highlightRing: { light: "#0a0a0a", dark: "#fafafa" },
};

export function getThemeColors(theme: MapTheme): ThemeColors {
  return theme === "dark" ? dark : light;
}

export function buildMapStyle(
  theme: MapTheme,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countriesData: any,
): StyleSpecification {
  const c = getThemeColors(theme);
  return {
    version: 8,
    sources: {
      countries: {
        type: "geojson",
        data: countriesData,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": c.background },
      },
      {
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: { "fill-color": c.countriesFill, "fill-opacity": 0.92 },
      },
      {
        id: "countries-stroke",
        type: "line",
        source: "countries",
        paint: {
          "line-color": c.countriesStroke,
          "line-width": 0.4,
          "line-opacity": 0.65,
        },
      },
    ],
  };
}
