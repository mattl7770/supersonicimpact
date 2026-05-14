import { Globe } from "lucide-react";

export function MapPlaceholder() {
  return (
    <div className="relative flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02]">
      <div className="flex flex-col items-center gap-3 text-foreground/40">
        <Globe className="h-10 w-10 animate-pulse" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider">Loading map…</span>
      </div>
    </div>
  );
}
