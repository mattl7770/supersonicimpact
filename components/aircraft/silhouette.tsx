"use client";

import { motion } from "framer-motion";
import { Plane } from "lucide-react";

import { useMediaQuery } from "@/lib/use-media-query";

type Props = {
  aircraftId: string;
  className?: string;
};

/**
 * Hand-drawn side-view silhouettes for the supersonic preset lineup.
 * All silhouettes use `currentColor` so they recolor with theme tokens
 * (e.g. `className="text-foreground/85"`).
 *
 * The viewBox is 160×60 with the nose pointing right. Aircraft are
 * roughly scaled relative to each other (X-59 is intentionally the
 * longest because its nose is the defining feature).
 */
export function AircraftSilhouette({ aircraftId, className }: Props) {
  if (aircraftId === "custom") return <CustomPlaneIcon className={className} />;

  const shape = SHAPES[aircraftId];
  if (!shape) return <CustomPlaneIcon className={className} />;

  return (
    <svg
      viewBox="0 0 160 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {shape}
    </svg>
  );
}

function CustomPlaneIcon({ className }: { className?: string }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <motion.div
      animate={reducedMotion ? undefined : { rotate: 360 }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 22, repeat: Infinity, ease: "linear" }
      }
      className={`aspect-square ${className ?? ""}`}
    >
      <Plane
        className="h-full w-full -rotate-45"
        strokeWidth={1.2}
        aria-hidden="true"
      />
    </motion.div>
  );
}

const SHAPES: Record<string, React.ReactNode> = {
  // Overture — sleek modern delta, gull-wing planform, twin engines, T-tail
  overture: (
    <g>
      <path d="M152,30 C144,27 110,25 80,25 L22,28 L20,30 L22,32 L80,35 C110,35 144,33 152,30 Z" />
      <path d="M30,28 L24,12 L38,28 Z" />
      <path d="M118,33 L60,33 L46,44 L104,44 Z" />
      <ellipse cx="86" cy="40" rx="3.5" ry="2" />
      <ellipse cx="74" cy="40" rx="3.5" ry="2" />
    </g>
  ),

  // Concorde — long fuselage with droop nose, ogival delta, paired engines
  concorde: (
    <g>
      <path d="M156,32 L150,29 L130,27 L70,25 L24,28 L20,30 L24,32 L70,35 L130,33 L150,32 Z" />
      <path d="M32,29 L26,13 L40,29 Z" />
      <path d="M128,33 Q90,33 56,44 L110,44 Q124,38 128,33 Z" />
      <rect x="78" y="42" width="22" height="3.5" rx="1" />
      <rect x="56" y="43" width="20" height="3" rx="1" />
    </g>
  ),

  // Tu-144 — Concorde-like with movable canards near cockpit + clustered engines
  "tu-144": (
    <g>
      <path d="M154,31 L148,29 L130,27 L70,25 L24,28 L20,30 L24,32 L70,35 L130,33 L148,32 Z" />
      <path d="M32,29 L26,14 L40,29 Z" />
      <path d="M138,27 L130,22 L124,27 Z" />
      <path d="M126,33 L52,33 L40,44 L108,44 Z" />
      <rect x="56" y="42" width="44" height="4" rx="1" />
    </g>
  ),

  // X-59 QueSST — extremely long needle nose, small mid-wing, top-mounted engine
  "x-59": (
    <g>
      <path d="M158,30 L154,29 L100,28 L40,29 L20,30 L40,31 L100,32 L154,31 Z" />
      <path d="M40,29 L30,16 L48,29 Z" />
      <rect x="36" y="22" width="20" height="3.5" rx="1.5" />
      <path d="M90,30 L70,30 L62,40 L82,40 Z" />
    </g>
  ),

  // XB-1 — compact demonstrator, three engines, delta wing
  "xb-1": (
    <g>
      <path d="M146,30 C138,27 110,26 80,26 L30,29 L24,30 L30,31 L80,34 C110,34 138,33 146,30 Z" />
      <path d="M38,29 L32,16 L46,29 Z" />
      <path d="M120,33 L66,33 L54,42 L106,42 Z" />
      <rect x="68" y="40" width="30" height="3.5" rx="1" />
      <ellipse cx="40" cy="27" rx="4" ry="1.6" />
    </g>
  ),

  // Aerion AS2 — business-jet proportions, T-tail, three engines (incl. tail), modest delta
  "aerion-as2": (
    <g>
      <path d="M148,30 C140,27 110,26 80,26 L30,29 L24,30 L30,31 L80,34 C110,34 140,33 148,30 Z" />
      <path d="M38,29 L32,12 L44,12 L42,29 Z" />
      <ellipse cx="34" cy="23" rx="6" ry="2.5" />
      <path d="M116,33 L66,33 L54,41 L102,41 Z" />
      <ellipse cx="84" cy="38" rx="3.2" ry="1.8" />
      <ellipse cx="72" cy="38" rx="3.2" ry="1.8" />
    </g>
  ),

  // Spike S-512 — business jet with twin rear-fuselage engines (no windows in real design)
  "spike-s512": (
    <g>
      <path d="M150,30 C142,27 110,26 80,26 L28,29 L22,30 L28,31 L80,34 C110,34 142,33 150,30 Z" />
      <path d="M34,29 L28,14 L42,29 Z" />
      <ellipse cx="40" cy="26" rx="10" ry="2.5" />
      <path d="M112,32 L62,32 L50,41 L100,41 Z" />
    </g>
  ),
};
