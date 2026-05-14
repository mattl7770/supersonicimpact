"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { Airport } from "@/lib/airports";

type AirportPickerProps = {
  label: string;
  airports: Airport[];
  selected: Airport | null;
  onSelect: (a: Airport) => void;
  exclude?: Airport | null;
};

export function AirportPicker({
  label,
  airports,
  selected,
  onSelect,
  exclude,
}: AirportPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = exclude
      ? airports.filter((a) => a.iata !== exclude.iata)
      : airports;
    if (!q) return base;
    return base.filter((a) => {
      const haystack = `${a.iata} ${a.name} ${a.city} ${a.country}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [airports, query, exclude]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-left transition-colors hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="flex flex-col items-start gap-0.5 min-w-0">
          <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">
            {label}
          </span>
          {selected ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground truncate">
              <span aria-hidden>{selected.flag}</span>
              {selected.iata}
              <span className="text-foreground/60 font-normal truncate">
                {selected.city}
              </span>
            </span>
          ) : (
            <span className="text-sm text-foreground/50">Pick an airport…</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-lg shadow-black/20"
        >
          <div className="flex items-center gap-2 border-b border-foreground/5 px-3 py-2.5">
            <Search
              className="h-4 w-4 text-foreground/40"
              aria-hidden="true"
            />
            <input
              type="search"
              autoFocus
              placeholder="Search IATA, city, country…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-foreground/50">
                No airports match.
              </li>
            ) : (
              filtered.map((a) => {
                const isSelected = selected?.iata === a.iata;
                return (
                  <li key={a.iata}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(a);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-foreground/[0.05] ${
                        isSelected ? "bg-foreground/[0.04]" : ""
                      }`}
                    >
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          <span aria-hidden>{a.flag}</span>
                          {a.iata}
                        </span>
                        <span className="text-foreground/60 truncate">
                          {a.city}
                          <span className="text-foreground/40">
                            {" "}
                            · {a.country}
                          </span>
                        </span>
                      </span>
                      {isSelected && (
                        <Check
                          className="h-4 w-4 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
