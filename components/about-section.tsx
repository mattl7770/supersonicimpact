"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Plane, Clock, Building2 } from "lucide-react";

import { MachWave } from "./mach-wave";

const GITHUB_URL = "https://github.com/mattl7770/supersonicimpact";

const ENTRY = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 } as const,
};

const TRANSITION = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function AboutSection() {
  const reduced = useReducedMotion();
  const initial = reduced ? false : ENTRY.initial;

  return (
    <section
      id="about"
      className="relative scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          About
        </p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          What this is, and how the numbers are derived.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-foreground/70">
          <strong className="font-semibold text-foreground/90">
            supersonicimpact
          </strong>{" "}
          is a portfolio project I built to make supersonic commercial flight
          feel concrete. Route comparisons, a time-value calculator, and a
          fleet-scale economic simulator, all running off Boom
          Supersonic&rsquo;s publicly stated specs.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground/70">
          <span>Built by Matt</span>
          <span className="text-foreground/30">·</span>
          <a
            href={GITHUB_URL}
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            View source on GitHub
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <motion.div
          initial={initial}
          whileInView={ENTRY.whileInView}
          viewport={ENTRY.viewport}
          transition={TRANSITION}
          className="mt-10 rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <MachWave className="h-5 w-9 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              Methodology
            </h3>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <MethodCard
              icon={<Plane className="h-4 w-4" />}
              title="Aircraft data"
              body="Boom Overture is Mach 1.7 over water, 4,250 NM range, with a claimed Mach 1.3 Boomless Cruise over land. The other six presets (Concorde, Tu-144, X-59, XB-1, AS2, S-512) use each manufacturer's published specs."
            />
            <MethodCard
              icon={<Clock className="h-4 w-4" />}
              title="Flight times"
              body="Block time = 0.4 h ground + 0.5 h climb/descent + (distance − 250 NM) / (Mach × 576 kt). Subsonic baseline uses scheduled airline block times (~480 kt effective). Slider edits recompute live."
            />
            <MethodCard
              icon={<Building2 className="h-4 w-4" />}
              title="Economic impact"
              body="Hours saved × hourly value gives direct productivity. A 3.5× catalytic multiplier (per ATAG's Aviation: Benefits Beyond Borders) projects that into GDP and jobs supported."
            />
          </div>

          <div className="mt-6 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 text-xs leading-relaxed text-foreground/60">
            <strong className="font-semibold text-foreground/75">
              Illustrative, not financial advice.
            </strong>{" "}
            Figures come from Boom Supersonic&rsquo;s public claims and
            published aviation data. Real outcomes will depend on final
            aircraft specs, regulatory approvals, fuel availability, and route
            economics.
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/45">
              Sources
            </p>
            <ul className="mt-2 grid gap-1 text-xs text-foreground/65 sm:grid-cols-2">
              <li>Boom Supersonic, public specs and press materials</li>
              <li>ATAG, Aviation: Benefits Beyond Borders</li>
              <li>Great Circle Mapper for distances</li>
              <li>Airline schedules (BA, UA, DL, QF) for subsonic baselines</li>
              <li>FAA / ICAO for climb and descent profiles</li>
              <li>
                <a
                  href="https://github.com/mattl7770/supersonicimpact/blob/main/docs/methodology.md"
                  className="underline underline-offset-2 hover:text-foreground"
                  target="_blank"
                  rel="noreferrer"
                >
                  Full methodology (GitHub)
                </a>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MethodCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-foreground/80">
        <span className="text-accent" aria-hidden="true">
          {icon}
        </span>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-foreground/65">{body}</p>
    </div>
  );
}
