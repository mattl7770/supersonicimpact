# Design

Visual & UX direction for **supersonicimpact.com**. Lock these decisions in early so the look stays consistent across sessions.

## Tone

- **Premium** — feels like a product, not a school project
- **Fast** — instant interactions, no jank, perceptible motion only when it carries meaning
- **Educational, not gimmicky** — animations explain something (time compression, scale), they don't decorate
- **Confident, sourced** — every number is paired with a discoverable source; this is part of the visual language

## Color

Minimal palette, neutral-first.

- **Base** — neutral grays (Tailwind `zinc` or `neutral` scale). Dark mode is a true dark (`zinc-950` base), not a muddy gray.
- **Accent** — one accent color used sparingly for mach-wave references, supersonic-side highlights, and key CTAs. Likely a cool electric blue or a clean cyan; finalize when first hero component is built.
- **Semantic** — green for "time saved", muted red/orange for "subsonic baseline". Always paired with text/icon, never color alone (a11y).

Both **light and dark mode** are first-class — every component must be designed in both. Default to dark on first visit; respect `prefers-color-scheme`.

## Typography

- **Sans-serif system**. Top candidates: **Inter** (workhorse) or **Geist** (more "premium" feel, pairs well with the Vercel/Next aesthetic).
- Tabular numerals (`font-feature-settings: 'tnum'`) on every metric so digits line up when they animate.
- Type scale: one hero size, one section size, one body size, one caption. Resist the urge to add intermediates.

## Iconography

- **lucide-react** as the base set.
- Recurring motif: **mach-wave / sound-wave** — a curved arc or chevron pair that shows up subtly on supersonic-side cards, the favicon, and the primary CTA.
- Icons are decorative-only by default; always pair with text labels for a11y.

## Animation

Framer Motion, but disciplined.

- **Clocks** for the Route Comparator — two analog faces that "race", with the supersonic clock finishing first.
- **Arcs** for the world map (Phase 2) — great-circle paths that draw, then a streak compresses along them to show speed.
- **Count-up** for big-number outputs in the Time Value Calculator and Economic Impact Simulator.
- **No** parallax, no bouncing emoji, no animated gradients.
- **`prefers-reduced-motion`** is honored everywhere. Reduced-motion users get instant state transitions, not removed information.

## Layout

- **Mobile-first.** Design every component at 360 px first, then scale up.
- Generous whitespace. Card-based layouts, no edge-to-edge dense info.
- One primary action per screen. Secondary actions are visible but de-emphasized.

## Accessibility

- Lighthouse a11y target ≥ 95.
- Semantic HTML — `<button>` for buttons, `<a>` for links, headings in order.
- All interactive elements keyboard-reachable in a logical tab order.
- Focus rings visible and on-brand (don't strip them).
- ARIA only where semantic HTML can't carry the meaning (sliders, live-updating regions).
- Color contrast ≥ 4.5:1 for body text in both themes.

## Performance

- Core Web Vitals all green on mobile.
- Charts/animations lazy-load; the hero card is server-rendered text + a static SVG.
- Images via `next/image`. No oversized hero photos.
