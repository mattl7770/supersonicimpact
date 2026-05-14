"use client";

import { Globe, Map as MapIcon } from "lucide-react";
import type { Projection } from "@/lib/use-projection-pref";

type Props = {
  value: Projection;
  onChange: (next: Projection) => void;
};

export function ProjectionToggle({ value, onChange }: Props) {
  const isGlobe = value === "globe";
  const next: Projection = isGlobe ? "flat" : "globe";
  const label = isGlobe ? "Switch to flat map" : "Switch to globe";

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-background/70 text-foreground/80 backdrop-blur-md transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {isGlobe ? (
        <Globe className="h-4 w-4" aria-hidden="true" />
      ) : (
        <MapIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
