import { ChevronDown } from "lucide-react";
import {
  AVG_HOURS_SAVED_PER_ONE_WAY,
  AVG_SUBSONIC_HOURS_PER_ONE_WAY,
  GDP_MULTIPLIER,
  GLOBAL_AVIATION_GDP_USD,
  GLOBAL_AVIATION_JOBS,
} from "@/lib/economic-impact";

export function Assumptions() {
  return (
    <details className="group rounded-3xl border border-foreground/10 bg-foreground/[0.02] [&[open]>summary>svg]:rotate-180">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-medium text-foreground/85 sm:px-8 [&::-webkit-details-marker]:hidden">
        <span>Assumptions &amp; sources</span>
        <ChevronDown
          className="h-4 w-4 text-foreground/55 transition-transform"
          aria-hidden="true"
        />
      </summary>
      <div className="space-y-4 border-t border-foreground/10 px-6 py-5 text-xs leading-relaxed text-foreground/65 sm:px-8 sm:py-6">
        <Row
          term={`Average hours saved per one-way: ${AVG_HOURS_SAVED_PER_ONE_WAY.toFixed(1)} h`}
          definition="Mean over the 12 curated routes in this app (transatlantic, transpacific, trans-Indian). Derived from Boom Supersonic's stated Mach 1.7 / Mach 1.3 cruise speeds and today's scheduled subsonic block times."
        />
        <Row
          term={`Average subsonic block time per one-way: ${AVG_SUBSONIC_HOURS_PER_ONE_WAY.toFixed(1)} h`}
          definition="Mean of scheduled widebody block times across the curated routes, sourced from airline schedules and Great Circle Mapper."
        />
        <Row
          term={`Catalytic GDP multiplier: ${GDP_MULTIPLIER.toFixed(1)}×`}
          definition="Aviation's catalytic multiplier: the second-order effect on jobs, supply chains, and tourism beyond direct productivity. Typical literature range is 2.5–3.5; this site uses the upper bound as an illustrative scenario, not a forecast (IATA / ATAG, World Bank)."
        />
        <Row
          term={`Global aviation total economic impact: $${(GLOBAL_AVIATION_GDP_USD / 1e12).toFixed(1)}T`}
          definition="≈3.9% of global GDP. Source: ATAG, Aviation: Benefits Beyond Borders."
        />
        <Row
          term={`Global aviation jobs supported: ${(GLOBAL_AVIATION_JOBS / 1e6).toFixed(1)}M`}
          definition="Direct + induced + catalytic. We apply this jobs-per-dollar ratio to the multiplied GDP figure. Source: ATAG."
        />
        <Row
          term="Annual hours saved formula"
          definition="passengers × round-trips × 2 × avg hours saved per one-way. Routes is a network-scale context input (it drives the passengers-per-route stat); it does not double-count volume."
        />
        <p className="border-t border-foreground/10 pt-4 text-[11px] text-foreground/50">
          Illustrative, based on Boom Supersonic&rsquo;s public claims and
          published aviation economic data. Real outcomes depend on final
          aircraft specs, regulations, fuel availability, and route economics.
          Full derivations:{" "}
          <a
            href="https://github.com/mattl7770/supersonicimpact/blob/main/docs/methodology.md"
            className="underline underline-offset-2 hover:text-foreground/75"
          >
            docs/methodology.md
          </a>
          .
        </p>
      </div>
    </details>
  );
}

function Row({ term, definition }: { term: string; definition: string }) {
  return (
    <div>
      <div className="font-semibold text-foreground/85">{term}</div>
      <div className="mt-0.5">{definition}</div>
    </div>
  );
}
