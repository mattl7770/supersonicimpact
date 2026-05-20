import { ExternalLink } from "lucide-react";
import { HeroGlobe } from "@/components/hero-globe";
import { RouteComparator } from "@/components/route-comparator";
import { EconomicImpact } from "@/components/economic-impact";
import { AboutSection } from "@/components/about-section";
import { SectionNav } from "@/components/section-nav";
import { AircraftProvider } from "@/lib/aircraft-context";
import { SelectionProvider } from "@/lib/selection-context";
import { ValueProvider } from "@/lib/value-context";

export default function Home() {
  return (
    <SelectionProvider>
      <AircraftProvider>
        <ValueProvider>
          <HeroGlobe />
          <main>
            <RouteComparator />
            <EconomicImpact />
            <AboutSection />
          </main>
          <SectionNav />
          <footer className="border-t border-foreground/5 px-6 py-10 text-center text-xs text-foreground/50 sm:px-10">
            <span>
              Illustrative — based on Boom Supersonic&rsquo;s public claims
              and published aviation data.
            </span>
            <span className="mx-2">·</span>
            <a
              href="https://github.com/mattl7770/supersonicimpact"
              className="inline-flex items-center gap-1 hover:text-foreground/80"
            >
              View on GitHub
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </footer>
        </ValueProvider>
      </AircraftProvider>
    </SelectionProvider>
  );
}
