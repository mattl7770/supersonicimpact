import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { SpeedLines } from "./speed-lines";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <SpeedLines />

      <div className="mx-auto w-full max-w-5xl px-6 py-32 sm:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-xs font-medium text-foreground/70">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Boom Supersonic Overture · Mach 1.7
        </div>

        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl sm:leading-[1.05]">
          How much time and money will supersonic flight save you?
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-foreground/70 sm:text-lg">
          Explore real routes. See hours saved. Calculate real value.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="#comparator"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Explore Routes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="#time-value"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.03] px-5 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-foreground/[0.06]"
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            Calculate Your Time Value
          </Link>
        </div>
      </div>
    </section>
  );
}
