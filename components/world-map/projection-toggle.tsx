"use client";

import { Globe, Map as MapIcon } from "lucide-react";

export type Projection = "globe" | "mercator";

type ProjectionToggleProps = {
  value: Projection;
  onChange: (next: Projection) => void;
  compact?: boolean;
};

export function ProjectionToggle({
  value,
  onChange,
  compact = false,
}: ProjectionToggleProps) {
  if (compact) {
    const next: Projection = value === "globe" ? "mercator" : "globe";
    const isGlobe = value === "globe";
    return (
      <button
        type="button"
        onClick={() => onChange(next)}
        aria-label={isGlobe ? "Switch to flat map" : "Switch to globe"}
        title={isGlobe ? "Switch to flat map" : "Switch to globe"}
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

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-foreground/10 bg-foreground/[0.03] p-0.5">
      <ToggleButton
        active={value === "globe"}
        onClick={() => onChange("globe")}
        icon={<Globe className="h-3.5 w-3.5" aria-hidden="true" />}
        label="Globe"
      />
      <ToggleButton
        active={value === "mercator"}
        onClick={() => onChange("mercator")}
        icon={<MapIcon className="h-3.5 w-3.5" aria-hidden="true" />}
        label="Flat"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-accent/15 text-accent"
          : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
