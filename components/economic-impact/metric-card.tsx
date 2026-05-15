"use client";

import type { ReactNode } from "react";
import { CountUp } from "@/components/count-up";

type MetricCardProps = {
  label: string;
  value: number;
  format: (value: number) => string;
  caption?: string;
  icon?: ReactNode;
  accent?: "neutral" | "supersonic";
};

export function MetricCard({
  label,
  value,
  format,
  caption,
  icon,
  accent = "neutral",
}: MetricCardProps) {
  const isAccent = accent === "supersonic";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 transition-colors sm:p-6 ${
        isAccent
          ? "border-accent/30 bg-accent/[0.04] shadow-[0_0_60px_-30px_rgba(34,211,238,0.45)]"
          : "border-foreground/10 bg-foreground/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${
            isAccent ? "text-accent/85" : "text-foreground/55"
          }`}
        >
          {label}
        </span>
        {icon && (
          <span
            className={isAccent ? "text-accent/80" : "text-foreground/40"}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      <div
        className={`mt-3 text-3xl font-semibold tabular-nums leading-none tracking-tight sm:text-4xl ${
          isAccent ? "text-accent" : "text-foreground"
        }`}
      >
        <CountUp value={value} format={format} />
      </div>
      {caption && (
        <div className="mt-2 text-xs text-foreground/55">{caption}</div>
      )}
    </div>
  );
}
