# supersonicimpact.com

> Explore the real-world impact of supersonic commercial flight.

**Status:** 🚧 Scaffold landed — feature work in progress

An interactive website that turns abstract claims about supersonic flight ("Mach 1.7", "half the flight time") into intuitive, visual experiences: side-by-side route comparisons, personal time-value calculators, and an economic-impact simulator. The first aircraft modeled is **Boom Supersonic's Overture**; more will follow.

## Why this exists

Supersonic commercial aviation is making a comeback after a 20-year hiatus, and the public conversation tends to stay abstract: cruise speed, Mach numbers, range. Those numbers don't tell you what supersonic flight actually changes — a half-day reclaimed on a transatlantic trip, the dollar value of those hours for a business traveler, or what happens to global productivity if a meaningful share of long-haul flights gets faster.

This site translates the specs into intuition. Three core tools let you:

1. Compare a chosen route on a subsonic jet vs. Boom Overture side by side.
2. Plug in your own hourly value to see what the time saved is worth.
3. Run scenarios — passengers, routes, adoption rates — and watch the productivity and GDP implications move.

The project is also a portfolio piece: a demonstration of translating econ/finance reasoning into a polished, interactive product.

## Planned features

**MVP (Phase 1)**
- **Route Comparator** — 10–20 popular routes, side-by-side subsonic vs. supersonic cards with flight time, hours saved, distance, and animated visuals.
- **Time Value Calculator** — input hourly rate, output dollar value of time saved (one-way and round-trip) plus a "productivity day" equivalence.
- **Economic Impact Simulator** — sliders for passengers per flight, daily routes, and adoption rate; outputs annual productivity boost and estimated GDP contribution.

**Phase 2** — Sustainability tab (CO₂ comparison, SAF assumptions), interactive world map with animated great-circle arcs, blog-style insights section.

**Phase 3** — Sensitivity analysis toggles, shareable PNG/PDF reports, optional user accounts for saved scenarios.

See [`ROADMAP.md`](ROADMAP.md) for full detail.

## Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | lucide-react |
| Package manager | pnpm |
| Deployment | GitHub → Vercel (planned), custom domain `supersonicimpact.com` |

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm lint
```

Requires Node 18.18+ (Node 20+ recommended) and pnpm.

## Methodology & data sources

All numbers in the app are illustrative, traceable to public sources, and clearly disclaimed. See [`docs/methodology.md`](docs/methodology.md) for:

- Boom Overture spec sheet and source links
- How subsonic vs. supersonic flight times are derived (great-circle distance + cruise/climb assumptions)
- Time-value formula
- Economic multipliers (ATAG global aviation figures, US civil aviation share of GDP)
- Disclaimer template

## Limitations & disclaimers

- Boom Overture is in development. Public specs (Mach 1.7, 60–80 pax, 4,250 NM range, 100% SAF capable) are **forward-looking** and may change before service entry.
- Flight times are simplified — they assume nominal routing, no holding patterns, no over-water vs. over-land Mach restrictions beyond what's publicly disclosed.
- Sustainability claims assume 100% SAF availability and a net-zero lifecycle — neither is currently true at scale.
- Economic-multiplier outputs are scenario estimates, not forecasts. They use illustrative inputs and published aviation multipliers; they are not a substitute for formal economic modeling.

## Design direction

Premium, fast, modern. Minimal color, clean cards, mobile-first, light & dark mode. See [`docs/design.md`](docs/design.md).

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for phase-by-phase plans, feature specs, and success criteria.

## License

MIT — see [LICENSE](LICENSE).

---

Built by Matt as a portfolio project demonstrating interactive economic modeling.
