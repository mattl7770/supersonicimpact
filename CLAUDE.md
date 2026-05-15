# CLAUDE.md

Context for Claude Code sessions working on **supersonicimpact.com**.

## Mission

An interactive website that translates the abstract value of supersonic commercial flight (starting with Boom Supersonic's Overture) into intuitive, visual tools — route comparisons, time-value calculators, and economic-impact simulators. The audience is students, business travelers, and recruiters reviewing a portfolio piece. The site must feel **premium, fast, and educational** — never gimmicky.

## Status (current)

- **Live**: https://supersonicimpact.vercel.app
- **Repo**: https://github.com/mattl7770/supersonicimpact (user: `mattl7770`)
- **Vercel project**: `matt-7-projects/supersonicimpact`
- Auto-deploys on push to `main`.

What's built:
- **Globe-first hero** (full viewport `h-[100svh]`). 3D Earth with day/night terminator via custom shader (sun position recomputed every 60s). City labels for ~30 major hubs. ~100 clickable airport markers.
- **Globe ⇄ Flat projection toggle** (single icon button in corner chrome, persisted in `localStorage`).
- **Flat map** via `react-simple-maps` + Natural Earth countries-110m. Renders 3× horizontally so it wraps when dragged. Continent + ocean labels.
- **Animated arcs** between selected origin/destination on both views, with a moving "supersonic" dot (cyan, fast) and "subsonic" dot (white, slower). Loops continuously.
- **Two liquid-glass panels** flanking the globe (only when both endpoints selected):
  - Left: route distance, subsonic vs supersonic time, hours saved, round-trip dollar value with inline-editable `$/hr` input, "select another route" mini picker.
  - Right: aircraft preset dropdown (Overture, Concorde, Tu-144, X-59 QueSST, XB-1, Aerion AS2, Spike S-512, 787-9, 777-300ER, A350-900, A380-800), 4 live-recalc sliders (top Mach, range, boomless cruise, passenger capacity).
- **Route Comparator section** below the globe — RouteCard pair + horizontal bar chart + round-trip toggle. Driven by the same selection context.
- **SectionNav** floating bottom pill that reveals on scroll past the hero (Comparator + Soon items: Time Value, Sustainability, About).

## Stack

- **Next.js 16.2** (App Router) — build script is `next build --webpack` (NOT Turbopack; Turbopack dropped MapLibre's worker in earlier iterations, kept `--webpack` since)
- **React 19.2**, TypeScript strict
- **Tailwind v4** (CSS-first config; `@custom-variant dark` in `app/globals.css`)
- **next-themes** for dark/light (default dark)
- **react-globe.gl + three.js** for the 3D globe (`three-globe` underneath)
- **react-simple-maps + world-atlas + topojson-client + d3-geo** for the 2D flat map AND for procedurally drawing country outlines into the cartographic texture
- **Framer Motion** for panel + hint animations
- **lucide-react** icons
- **Recharts** for the comparator bar chart
- **Geist Sans** via `next/font/google`
- **pnpm** package manager. Use `pnpm`, not `npm`/`yarn`.

## Directory layout

```
app/
  layout.tsx          theme + Geist font
  page.tsx            provider stack + section composition
  globals.css         Tailwind v4 + theme tokens

components/
  hero-globe.tsx              the hero section (chooses Globe/Flat canvas)
  corner-chrome.tsx           wordmark TL + projection + theme toggles TR
  hero-picker-bar.tsx         floating bottom FROM/TO pill
  scroll-hint.tsx             animated chevron
  section-nav.tsx             scroll-revealed bottom pill nav
  count-up.tsx                framer-motion animated number
  mach-wave.tsx               logo SVG
  theme-provider.tsx          next-themes wrapper
  theme-toggle.tsx            sun/moon button
  panels/
    glass-panel.tsx           shared liquid-glass wrapper (entry animation)
    slider.tsx                custom range slider
    route-details-panel.tsx   left panel
    aircraft-panel.tsx        right panel
  world-map/
    globe-canvas.tsx          react-globe.gl + custom TubeGeometry arcs
    flat-canvas.tsx           react-simple-maps + 3× wrap-around
    airport-picker.tsx        searchable airport combobox
    projection-toggle.tsx     single circular Globe/Flat button
    star-field.tsx            procedural canvas starfield
    error-boundary.tsx        with resetKey to recover on toggle
    placeholder.tsx           loading skeleton
  route-comparator/
    index.tsx                 cards + chart + round-trip toggle
    route-card.tsx            subsonic/supersonic card pair
    route-chart.tsx           Recharts horizontal bar (dynamic-imported, ssr:false)

lib/
  aircraft.ts                 Aircraft type + 11 preset list, KTS_PER_MACH
  aircraft-context.tsx        useAircraft() — live config
  airports.ts                 Airport type + ~100 airport list + MAJOR_HUBS set
  flight-time.ts              computeSupersonicHours/SubsonicHours, buildRouteForPair
  format.ts                   formatHours, formatDistance, compressionRatio
  geo.ts                      haversineNm, greatCircleArc (SLERP), splitAtAntimeridian, bearing
  selection-context.tsx       useSelection() — origin + destination, defaults null
  sun.ts                      getSubsolarPoint (Spencer formula), getSunDirection vec3
  types.ts                    Route, City types
  use-media-query.ts          useSyncExternalStore wrapper
  use-projection-pref.ts      localStorage-backed projection toggle
  use-scroll.ts               useIsScrolled, useScrolledPastHero
  value-context.tsx           useHourlyRate() — persisted $/hr

data/
  routes.ts                   12 curated route pairs + getCuratedRouteByAirports

public/earth/
  earth-night.jpg             city-lights texture (~715 KB)
  (day texture is procedurally drawn — no day jpg needed currently;
   if you switch to satellite imagery, re-fetch earth-day.jpg from
   https://unpkg.com/three-globe/example/img/earth-day.jpg)

docs/
  methodology.md              flight-time formulas, data sources, disclaimer template
  design.md                   tone, color palette, animation principles
```

## Provider stack (in `app/page.tsx`)

```
SelectionProvider     (origin/destination, defaults null → panels hidden)
  AircraftProvider    (active aircraft preset + slider config)
    ValueProvider     ($/hr, localStorage-persisted, default $300)
      <HeroGlobe />
      <main><RouteComparator /></main>
      <SectionNav />
      <footer />
```

## Globe-arc rendering — the part with the most history

Three layers per route on the globe. The static lines render as **smooth TubeGeometry meshes via `customLayerData`**, the moving dots stay on `pathsData`. Why:

- `arcsData` (built-in): uses `CubicBezierCurve3` with control points at 1/4 and 3/4 of the great-circle. Per-arc altitude only — no per-point — so long routes (>~120°) clip THROUGH the planet at any reasonable peak altitude.
- `pathsData` (next attempt): supports per-point altitude (problem solved) but renders as `Line2` fat-lines whose quad joints produce visible seams at heavy stroke widths.
- **Current solution**: `GreatCircleAltCurve` subclass of `THREE.Curve` does SLERP between unit vectors + radial lift via `peakAltitude × sin(πt)`. Fed into `TubeGeometry(curve, 128, radius, 8, false)`. Single continuous mesh per layer, no seams, never clips because every point is at a fixed altitude *above* the great-circle surface.

Current parameters (in `components/world-map/globe-canvas.tsx`):
- Peak altitudes: supersonic **0.14**, subsonic **0.09** globe-radii
- Tube radii: halo **1.0**, supersonic-main **0.4**, subsonic-main **0.3**
- Dot strokes (pathsData): supersonic **10**, subsonic **7** (≈ 2× the corresponding tube)

Coordinate frame matches three-globe's `polar2Cartesian` (φ = (90-lat)°, θ = (90-lng)°, GLOBE_RADIUS = 100) so the custom tubes align with airport markers + labels.

## Conventions

- **TypeScript strict**. No `any` without an `eslint-disable` + reason.
- **Mobile-first Tailwind**. Test at 360 px first.
- **Accessibility is a requirement** — semantic HTML, keyboard nav, `prefers-reduced-motion` respected for every animation (`useMediaQuery("(prefers-reduced-motion: reduce)")`).
- **Light + dark mode** both first-class. The procedural starfield only renders in dark mode on the globe view.
- **Data hygiene**: every user-facing number traces to `docs/methodology.md` and carries an "Illustrative — based on Boom Supersonic's public claims" disclaimer (the comparator footer + arc tooltips do this).

## Gotchas / things to know

- **Build script is `next build --webpack`** — Turbopack hit a MapLibre worker-drop bug early on (back when we tried MapLibre before swapping to react-globe.gl). MapLibre is gone now but the flag stays for safety until we reverify.
- **`pnpm-workspace.yaml`** allow-lists `sharp` + `unrs-resolver` build scripts (pnpm 11 is strict about ignored build scripts).
- **`SelectionProvider` defaults to null/null** so panels start hidden. Initial paint shows just the globe + bottom picker bar.
- **`useEffect` + `setState`**: React 19's `react-hooks/set-state-in-effect` rule fires on synchronous setState in effects. We use `useSyncExternalStore` (in `use-media-query.ts`, `use-scroll.ts`, `use-projection-pref.ts`) to satisfy it. A few places use a targeted `// eslint-disable-next-line` comment when the rule is wrong for the use case (e.g. localStorage hydration, animation reset).
- **`MapErrorBoundary` takes a `resetKey` prop** — pass `projection` so toggling between Globe/Flat clears any stuck error.
- **Flat canvas renders content 3× horizontally** (shifts -1, 0, +1) for wrap-around. All clickable Markers and arcs duplicate in each copy.
- **No `Github` icon in lucide-react v1** (brand icons were removed). Use `ExternalLink` for the GitHub link, or import an inline SVG.
- **Stars are procedural** (`star-field.tsx`) — no `stars.png` asset anymore.
- **`world-atlas` JSON is imported with `// @ts-ignore`** because it ships without types.
- **The supersonic vs subsonic distinction** is carried by: color (cyan dot vs white dot), tube opacity (0.95 vs 0.55), peak altitude (0.14 vs 0.09), and dash animation speed (`2400ms` vs `2400 × subsonic/supersonic ratio`).

## What's NOT built (next likely tasks, per `ROADMAP.md`)

- **Time Value Calculator** section (own page section; for now the rate is just an inline edit in the left panel)
- **Sustainability** section (CO₂ comparison, SAF assumptions)
- **About / methodology** page surfaced from `docs/methodology.md`
- Moving plane icons (real plane sprite) instead of dots
- Hover tooltip on airports with city/country detail
- URL deep-linking (`?from=JFK&to=LHR`)
- Custom domain `supersonicimpact.com` DNS

## Pointers

- [`README.md`](README.md) — public/portfolio overview
- [`ROADMAP.md`](ROADMAP.md) — phased feature plan
- [`docs/methodology.md`](docs/methodology.md) — flight-time formulas, data sources
- [`docs/design.md`](docs/design.md) — visual & UX direction
- [`AGENTS.md`](AGENTS.md) — Next.js 16 breaking-change notice from create-next-app

@AGENTS.md
