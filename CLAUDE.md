# CLAUDE.md

Context for Claude Code sessions working on **supersonicimpact.com**.

## Mission

An interactive website that translates the abstract value of supersonic commercial flight (starting with Boom Supersonic's Overture) into intuitive, visual tools — route comparisons, time-value calculators, and economic-impact simulators. The audience is students, business travelers, and recruiters reviewing a portfolio piece. The site must feel **premium, fast, and educational** — never gimmicky.

## Status

**Pre-scaffold.** This directory currently contains documentation only. No `package.json`, no dependencies, no source files. Do not attempt to run `pnpm` commands until the scaffold session has completed.

## Stack (planned)

- **Next.js 15** — App Router, for SSR/SEO and the React Server Components story
- **TypeScript** — strict mode
- **Tailwind CSS** — utility-first, mobile-first
- **Framer Motion** — animated clocks, route arcs, and the "premium" feel
- **Recharts** (or Chart.js + react-chartjs-2 — TBD at scaffold time) — bars, gauges
- **lucide-react** — icon system; mach-wave/sound-wave motifs where applicable

## Package manager

**Use `pnpm`**, not `npm` or `yarn`. Commands will be `pnpm install`, `pnpm dev`, `pnpm build`, etc. — do not reach for `npm install`.

## Anticipated directory layout

```
/
├── app/              Next.js App Router routes
├── components/       Reusable UI (cards, charts, controls)
├── lib/              Calculation utilities (time value, GDP multipliers, great-circle)
├── data/             Route data, aircraft specs, economic constants
├── docs/             Methodology, design notes, decision logs
├── public/           Static assets
├── CLAUDE.md
├── README.md
└── ROADMAP.md
```

## Conventions

- **TypeScript strict**. No `any` without justification.
- **Mobile-first Tailwind**. Test layouts at 360px before scaling up.
- **Accessibility is a requirement, not a polish step**. Semantic HTML, keyboard navigation, ARIA where needed, `prefers-reduced-motion` respected for all Framer Motion animations.
- **Light & dark mode** are both first-class.
- **Minimal color palette** — neutral grays with one accent for mach-wave references. See `docs/design.md`.

## Data hygiene rule

Every user-facing number (flight time, hours saved, dollar value, GDP figure) must:

1. Be traceable to a formula or source in [`docs/methodology.md`](docs/methodology.md), and
2. Be accompanied by an "Illustrative — based on Boom's public claims and public reports; actuals depend on final specs and regulations" disclaimer in the UI.

Boom Overture is a forward-looking aircraft. Do not present projected figures as guaranteed.

## Pointers

- [`README.md`](README.md) — public/portfolio overview
- [`ROADMAP.md`](ROADMAP.md) — phased feature plan
- [`docs/methodology.md`](docs/methodology.md) — data, assumptions, formulas
- [`docs/design.md`](docs/design.md) — visual & UX direction
