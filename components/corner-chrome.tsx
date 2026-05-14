"use client";

import Link from "next/link";
import { MachWave } from "./mach-wave";
import { ThemeToggle } from "./theme-toggle";
import {
  ProjectionToggle,
  type Projection,
} from "./world-map/projection-toggle";

type CornerChromeProps = {
  projection: Projection;
  onProjectionChange: (next: Projection) => void;
};

export function CornerChrome({
  projection,
  onProjectionChange,
}: CornerChromeProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-4 pt-4 sm:px-6 sm:pt-6">
      <Link
        href="/"
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-3 py-1.5 text-sm font-semibold tracking-tight backdrop-blur-md transition-colors hover:bg-background/85"
      >
        <MachWave className="h-3.5 w-7 text-accent" />
        <span>
          supersonic<span className="text-accent">·</span>impact
        </span>
      </Link>

      <div className="pointer-events-auto flex items-center gap-2">
        <ProjectionToggle
          value={projection}
          onChange={onProjectionChange}
          compact
        />
        <ThemeToggle />
      </div>
    </div>
  );
}
