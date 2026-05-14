import { ExternalLink } from "lucide-react";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { RouteComparator } from "@/components/route-comparator";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <RouteComparator />
      </main>
      <footer className="border-t border-foreground/5 px-6 py-10 text-center text-xs text-foreground/50 sm:px-10">
        <span>
          Illustrative — based on Boom Supersonic&rsquo;s public claims and
          published aviation data.
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
    </>
  );
}
