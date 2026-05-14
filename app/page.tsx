import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { MachWave } from "@/components/mach-wave";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-sm font-medium tracking-tight text-foreground/80">
          supersonicimpact<span className="text-accent">.com</span>
        </span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center sm:px-10">
        <MachWave className="mb-8 h-16 w-40 text-accent" />

        <h1 className="max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl sm:leading-[1.05]">
          Explore the real-world impact of supersonic commercial flight.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-foreground/70 sm:text-lg">
          Route Comparator · Time Value Calculator · Economic Impact Simulator.
          Coming soon.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="https://github.com/mattl7770/supersonicimpact"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            View on GitHub
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </main>

      <footer className="px-6 pb-8 text-center text-xs text-foreground/50 sm:px-10">
        Illustrative — based on Boom Supersonic&rsquo;s public claims and
        published aviation data.
      </footer>
    </div>
  );
}
