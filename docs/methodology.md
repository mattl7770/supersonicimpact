# Methodology

How every user-facing number on **supersonicimpact.com** is derived. This file is the canonical reference for the app's `/methodology` page and is linked from each calculation's "How is this calculated?" tooltip.

> **Standing disclaimer:** All figures are **illustrative**, based on Boom Supersonic's publicly stated claims and published aviation economic data. Real-world performance depends on final aircraft specs, regulatory approvals, fuel availability, and route economics. Do not use these numbers for financial or operational decisions.

---

## 1. Boom Overture — spec sheet

| Spec | Value | Source |
|------|-------|--------|
| Cruise speed | Mach 1.7 (~1,300 mph / ~2,100 km/h over water) | Boom Supersonic public materials |
| Boomless Cruise (over land) | Mach 1.3 (claimed, no audible boom at the ground) | Boom Supersonic |
| Passengers | 60–80 | Boom Supersonic |
| Range | 4,250 NM | Boom Supersonic |
| Fuel | 100% SAF capable | Boom Supersonic |
| Service entry (target) | Late 2020s | Boom Supersonic |

**Assumption for this site:** unless a route-specific override exists, supersonic cruise is **Mach 1.7 over water** and **Mach 1.3 over predominantly-overland legs** (the "Boomless Cruise" claim).

**Open questions** (resolve before locking in calculations):
- What's the exact Mach number Boom uses for its over-land "Boomless Cruise" performance modeling?
- Climb/descent time assumption — Boom's public materials imply gate-to-gate savings approaching 50% on transatlantic; we need to back-fit a climb/descent allowance.

---

## 2. Subsonic baselines

Subsonic flight times reflect typical scheduled block times on widebody twinjets (777, 787, A350, A380) for each route — the experience a passenger actually books today. Sources: airline schedules (United, BA, Delta, Qantas) and Great Circle Mapper.

These are **block times** (gate-to-gate), not air time. We use scheduled averages rather than great-circle + cruise-speed math because scheduled times already absorb climb, descent, taxi, and prevailing winds.

---

## 3. Route flight-time derivation

For each seed route we record three numbers:

1. `distance_nm` — great-circle distance (computed once; nautical miles)
2. `subsonic_block_h` — typical scheduled block time today (hours)
3. `supersonic_block_h` — modeled Overture block time (hours)

`supersonic_block_h` is derived as:

```
supersonic_block_h = ground_overhead_h
                   + climb_descent_h
                   + cruise_distance_nm / cruise_speed_kts
```

Where:
- `ground_overhead_h` = 0.4 h (taxi out + taxi in, average)
- `climb_descent_h` = 0.5 h (one climb to FL510+, one descent)
- `cruise_distance_nm` = `distance_nm − climb_descent_distance_nm` (climb/descent distance ≈ 250 NM total)
- `cruise_speed_kts` = 980 kts at Mach 1.7 over water; 750 kts at Mach 1.3 over land
- For mixed routes (e.g., NYC–LA), a blended cruise speed is used proportional to the over-land leg

> The five user-supplied "saved" figures (NYC–London 4 h, NYC–Paris 3.5 h, LA–Sydney 6 h, Tokyo–Seattle 4 h, NYC–LA 1.5 h) are treated as authoritative targets; the formula is calibrated to land within ±15 minutes of those, then applied to additional routes.

### Seed route table

| Route | Distance (NM) | Subsonic (h) | Supersonic (h) | Saved (h) |
|------|---------------|--------------|----------------|-----------|
| JFK – LHR | ~3,000 | 7.5 | 3.5 | 4.0 |
| JFK – CDG | ~3,150 | 7.0 | 3.5 | 3.5 |
| LAX – SYD | ~6,500 | 14.5 | 8.5 | 6.0 |
| HND – SEA | ~4,150 | 8.5 | 4.5 | 4.0 |
| JFK – LAX | ~2,150 | 6.0 | 4.5 | 1.5 |
| LHR – DXB | ~2,950 | TBD | TBD | TBD |
| SIN – SYD | ~3,400 | TBD | TBD | TBD |

---

## 4. Time Value Calculator

```
value_one_way_usd   = hours_saved_one_way * hourly_rate_usd
value_round_trip    = 2 * value_one_way_usd
productivity_days   = hours_saved_one_way / 8
```

**Default presets** for hourly rate: $200, $350, $500. These bracket published surveys of business-traveler value of time and average compensation for senior professionals on long-haul premium fares.

**Caveats**
- Hours saved are not directly fungible with productive work hours (jet lag, recovery, travel context). The "productivity day" figure is an upper-bound heuristic, not a forecast.
- Hourly rate is a personal input; the app does not assume a default.

---

## 5. Economic Impact Simulator

### 5.1 Productivity boost

The simulator exposes four inputs (annual passengers, network size, average business-traveler hourly value, round trips per passenger per year). It computes:

```
annual_passenger_one_way_legs = annual_passengers
                              * round_trips_per_pax_per_year
                              * 2

annual_passenger_hours_saved  = annual_passenger_one_way_legs
                              * avg_hours_saved_per_one_way

annual_productivity_value_usd = annual_passenger_hours_saved
                              * avg_passenger_hourly_value_usd
```

`avg_hours_saved_per_one_way` is the mean of the 12 curated route savings (≈3.9 h, recomputed at import time from `data/routes.ts`).
`avg_passenger_hourly_value_usd` defaults to **$350** in the simulator (a central business-traveler proxy); the slider exposes the $100–$800 range.

Number of routes drives a derived `passengers_per_route` display so the slider has a visible effect on the scenario without double-counting volume — `annual_passengers` is already the total passenger count per year regardless of how the network is split.

### 5.2 GDP contribution

Aviation has documented economic multipliers. We use ATAG's published figures as the basis:

- **Global aviation total economic impact**: ~$4.1 trillion (≈3.9% of global GDP) (ATAG, *Aviation: Benefits Beyond Borders*)
- **Jobs supported globally**: ~86.5 million
- **US civil aviation**: ~4–5% of US GDP

```
gdp_contribution_estimate_usd = annual_productivity_value_usd * multiplier
```

Where `multiplier` represents aviation's catalytic effect (jobs, supply-chain, tourism beyond direct productivity). Typical literature range is **2.5–3.0** (direct + indirect + induced) up to **3.5** when catalytic / tourism effects are included. The simulator uses **3.5** as an illustrative upper-bound scenario — surfaced as a static badge today, exposable as a sensitivity slider in a future phase.

```
jobs_supported_estimate = gdp_contribution_estimate_usd
                        * (86.5e6 / 4.1e12)
```

i.e., apply ATAG's global jobs-per-dollar ratio.

**Important caveats**
- These are **scenario estimates**, not forecasts. They assume the modeled productivity gains translate at the same rate as existing aviation activity, which is itself an averaged figure.
- Multipliers vary by region, sector, and time horizon. The site documents the multiplier in the in-app Assumptions panel and (future phase) in a sensitivity slider.

---

## 6. Sustainability (Phase 2 — placeholder)

Will model:
- CO₂ per pax-km on Boom Overture (Boom's public claim: net-zero with 100% SAF)
- vs. subsonic widebody (~75 g CO₂ / pax-km on long-haul, varies)
- vs. supersonic on Jet A baseline (for comparison)

With a prominent callout: **current global SAF supply is <1% of jet-fuel demand** — the "net-zero" claim depends on SAF supply scaling dramatically.

---

## 7. Disclaimer template

Copy-paste this string into any new component that surfaces a calculated number:

> Illustrative — based on Boom Supersonic's public claims and published aviation economic data. Actuals depend on final aircraft specs, regulations, fuel availability, and route economics.

---

## 8. Sources

- Boom Supersonic — official site, press releases, technical fact sheets
- Air Transport Action Group (ATAG) — *Aviation: Benefits Beyond Borders*
- Great Circle Mapper — distance calculations
- Airline published schedules — subsonic baseline block times
- FAA / ICAO — climb / descent profiling assumptions

Full URLs to be added when those references are first cited in code or UI.
