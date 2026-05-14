"use client";

import { Globe, Map as MapIcon } from "lucide-react";
import type { Projection } from "@/lib/use-projection-pref";

type Props = {
  value: Projection;
  onChange: (next: Projection) => void;
};

export function ProjectionToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-foreground/10 bg-background/70 p-0.5 backdrop-blur-md">
      <Button
        active={value === "globe"}
        onClick={() => onChange("globe")}
        label="Globe"
        icon={<Globe className="h-3.5 w-3.5" aria-hidden="true" />}
      />
      <Button
        active={value === "flat"}
        onClick={() => onChange("flat")}
        label="Flat"
        icon={<MapIcon className="h-3.5 w-3.5" aria-hidden="true" />}
      />
    </div>
  );
}

function Button({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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
