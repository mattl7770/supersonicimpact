"use client";

import { Globe, Map as MapIcon } from "lucide-react";

export type Projection = "globe" | "mercator";

type ProjectionToggleProps = {
  value: Projection;
  onChange: (next: Projection) => void;
};

export function ProjectionToggle({ value, onChange }: ProjectionToggleProps) {
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
