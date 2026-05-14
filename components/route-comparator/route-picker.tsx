"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { Route } from "@/lib/types";

type RoutePickerProps = {
  routes: Route[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function RoutePicker({
  routes,
  selectedId,
  onSelect,
}: RoutePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = routes.find((r) => r.id === selectedId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) => {
      const haystack = [
        r.origin.iata,
        r.origin.name,
        r.origin.country,
        r.destination.iata,
        r.destination.name,
        r.destination.country,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [routes, query]);

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-left transition-colors hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {selected ? (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <span aria-hidden>{selected.origin.flag}</span>
              {selected.origin.iata}
              <span className="text-foreground/40">→</span>
              <span aria-hidden>{selected.destination.flag}</span>
              {selected.destination.iata}
            </span>
            <span className="text-foreground/60">
              {selected.origin.name} to {selected.destination.name}
            </span>
          </span>
        ) : (
          <span className="text-sm text-foreground/50">Select a route…</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-lg shadow-black/10"
        >
          <div className="flex items-center gap-2 border-b border-foreground/5 px-3 py-2.5">
            <Search
              className="h-4 w-4 text-foreground/40"
              aria-hidden="true"
            />
            <input
              type="search"
              autoFocus
              placeholder="Search routes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-foreground/50">
                No routes match.
              </li>
            ) : (
              filtered.map((r) => {
                const isSelected = r.id === selectedId;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(r.id);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-foreground/[0.05] ${
                        isSelected ? "bg-foreground/[0.04]" : ""
                      }`}
                    >
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          <span aria-hidden>{r.origin.flag}</span>
                          {r.origin.iata}
                          <span className="text-foreground/40">→</span>
                          <span aria-hidden>{r.destination.flag}</span>
                          {r.destination.iata}
                        </span>
                        <span className="text-foreground/60">
                          {r.origin.name} → {r.destination.name}
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
