# Roadmap

Phase-by-phase feature plan for **supersonicimpact.com**. Source of truth for what to build, in what order, and what "done" looks like for each feature. Calculation formulas and data sources live in [`docs/methodology.md`](docs/methodology.md).

---

## Phase 0 — Foundation (current)

**Goal:** Reliable docs and a runnable scaffold.

- [x] `CLAUDE.md`, `README.md`, `ROADMAP.md`, `docs/methodology.md`, `docs/design.md`
- [ ] `pnpm create next-app` (TypeScript, Tailwind, App Router, ESLint)
- [ ] Add `framer-motion`, `lucide-react`, chart library
- [ ] Theme provider (light/dark)
- [ ] Base layout, navigation skeleton, footer with disclaimer
- [ ] `git init` + GitHub repo + Vercel deploy

---

## Phase 1 — MVP

Three core interactive tools. Every output has a visible source link or disclaimer.

### 1.1 Route Comparator

**What it does:** User picks a route; sees subsonic vs. Boom Overture side-by-side.

**Inputs**
- Searchable dropdown / list of 10–20 popular routes
- Optional toggle: one-way vs. round-trip

**Outputs (per side)**
- Flight time (hh:mm)
- Hours saved
- Great-circle distance (nm + km)
- Aircraft label & cruise speed

**Visuals**
- Animated clock/timer showing time compression (Framer Motion)
- Bar chart comparing block times
- Subtle mach-wave motif on the supersonic card

**Seed routes** (more in `data/routes.ts` at build time):

| Route | Subsonic | Supersonic (Overture) | Saved |
|------|----------|----------------------|-------|
| NYC – London (JFK–LHR) | ~7.5 h | ~3.5 h | ~4.0 h |
| NYC – Paris (JFK–CDG) | ~7.0 h | ~3.5 h | ~3.5 h |
| LA – Sydney (LAX–SYD) | ~14.5 h | ~8.5 h | ~6.0 h |
| Tokyo – Seattle (HND–SEA) | ~8.5 h | ~4.5 h | ~4.0 h |
| NYC – LA (JFK–LAX, Boomless Cruise) | ~6.0 h | ~4.5 h | ~1.5 h |
| London – Dubai (LHR–DXB) | TBD | TBD | TBD |
| Singapore – Sydney (SIN–SYD) | TBD | TBD | TBD |

> Times above are the user-supplied targets; `docs/methodology.md` documents how each is derived.

**Done when:** User can pick any seed route on mobile or desktop, sees both cards with animated visuals, and can click "How is this calculated?" to land on the methodology page.

---

### 1.2 Time Value Calculator

**What it does:** Converts hours saved into dollar value for a chosen route + hourly rate.

**Inputs**
- Hourly rate (default presets: $200 / $350 / $500, plus a custom input)
- Route (inherited from Route Comparator selection, or pickable here)
- Trip type: one-way / round-trip

**Outputs**
- Dollar value of time saved (one-way and round-trip)
- "Equivalent to ~X full workdays reclaimed" (using an 8-hour workday)
- Optional context line: "If you take this trip Y times a year, that's $Z annually"

**Visuals**
- Big-number hero figure with subtle count-up animation
- Tiny bar or pill showing one-way vs. round-trip
- Disclaimer chip below the number

**Done when:** Output updates live as inputs change; values match the formula in `docs/methodology.md`; the disclaimer chip is always present.

---

### 1.3 Economic Impact Simulator

**What it does:** Lets the user run "what if supersonic scales?" scenarios.

**Inputs (sliders)**
- Passengers per flight (default 65, range 60–80 — matches Overture)
- Daily flights (range 1–500)
- Adoption rate / share of premium long-haul (range 0–100%)
- Optional: average hourly value of a passenger (default = business-traveler proxy)

**Outputs**
- Estimated annual productivity boost ($ / year)
- Estimated GDP contribution range (using published aviation multipliers — see methodology)
- Equivalent jobs supported (using ATAG-derived ratio)

**Visuals**
- Three big-number cards
- A gauge or bar for "share of long-haul affected"
- Tooltip on each number linking to the formula and source

**Done when:** All three sliders are accessible (keyboard + screen reader), values animate smoothly between states, every output has a tooltip with source + formula.

---

## Phase 2

### 2.1 Sustainability tab

- CO₂ per passenger comparison: subsonic Jet A vs. supersonic on 100% SAF (net-zero claim) vs. supersonic on Jet A baseline
- Clear callout: "100% SAF availability is aspirational — current SAF supply is <1% of jet fuel demand"
- Source bibliography

### 2.2 Interactive world map

- Globe (likely D3 + react-globe.gl, TBD) with great-circle arcs for all seed routes
- Hover an arc → see the time-compression effect animate
- Filter by region / route family

### 2.3 Insights section

- Blog-style writeups: "What is the value of time, really?", "Why Concorde failed and Overture might not", "SAF, explained"
- MDX-based; lives under `app/insights/[slug]`

---

## Phase 3

### 3.1 Sensitivity analysis toggles

- For the Economic Impact Simulator: switch between optimistic / central / conservative assumption sets
- Display assumption deltas inline

### 3.2 Shareable results

- Generate a PNG (or PDF) summary card of a Route Comparator + Time Value result
- Pre-filled OG image for social sharing
- Direct shareable URL with state encoded in query params

### 3.3 User accounts (stretch)

- Save scenarios across sessions
- Auth via passkeys or magic link (no passwords)

---

## Success criteria

The project is "done enough" for portfolio purposes when:

1. **Intuitive UX** — a first-time visitor understands what the site does within 10 seconds of landing.
2. **Sourced calculations** — every user-facing number traces to a formula and a source.
3. **Screenshot-ready** — at least three "hero" views look polished enough to drop straight into a portfolio or pitch deck.
4. **Recruiter wow-factor** — the README + live site convey "this person can translate quantitative reasoning into product" without further explanation.
5. **Accessible** — Lighthouse a11y ≥ 95, keyboard-navigable end-to-end, `prefers-reduced-motion` honored.
6. **Fast** — Core Web Vitals all in the green on mobile.
