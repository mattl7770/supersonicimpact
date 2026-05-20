import { ERA_LABEL, type AircraftEra } from "@/lib/aircraft";

type Props = {
  era: AircraftEra | undefined;
  className?: string;
};

const TONE: Record<AircraftEra, string> = {
  "in-development":
    "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  historical:
    "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  concept:
    "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "in-service":
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function StatusBadge({ era, className }: Props) {
  if (!era) return null;
  const tone = TONE[era];
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide";
  return (
    <span className={`${base} ${tone}${className ? ` ${className}` : ""}`}>
      {ERA_LABEL[era]}
    </span>
  );
}
