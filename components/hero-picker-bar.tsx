"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, ChevronDown, Search } from "lucide-react";
import { airports, type Airport } from "@/lib/airports";
import { useSelection } from "@/lib/selection-context";

type Side = "from" | "to";

export function HeroPickerBar() {
  const { origin, destination, setOrigin, setDestination, swap } =
    useSelection();
  const [openSide, setOpenSide] = useState<Side | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openSide) return;
    function onPointer(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenSide(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenSide(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openSide]);

  function handleSelect(airport: Airport) {
    if (openSide === "from") setOrigin(airport);
    else if (openSide === "to") setDestination(airport);
    setOpenSide(null);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1 rounded-full border border-foreground/10 bg-background/80 px-1 py-1 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <AirportButton
          label="From"
          airport={origin}
          active={openSide === "from"}
          onClick={() => setOpenSide(openSide === "from" ? null : "from")}
        />
        <button
          type="button"
          onClick={swap}
          aria-label="Swap origin and destination"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/55 transition-colors hover:bg-foreground/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <AirportButton
          label="To"
          airport={destination}
          active={openSide === "to"}
          onClick={() => setOpenSide(openSide === "to" ? null : "to")}
        />
      </div>

      <AnimatePresence>
        {openSide && (
          <Popover
            side={openSide}
            exclude={openSide === "from" ? destination : origin}
            onSelect={handleSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AirportButton({
  label,
  airport,
  active,
  onClick,
}: {
  label: string;
  airport: Airport | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-haspopup="listbox"
      className={`flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? "bg-foreground/[0.08]" : "hover:bg-foreground/[0.05]"
      }`}
    >
      <span className="flex flex-col items-start">
        <span className="text-[9px] font-medium uppercase tracking-wider text-foreground/45">
          {label}
        </span>
        {airport ? (
          <span className="flex items-center gap-1.5 text-sm font-semibold leading-tight text-foreground">
            <span aria-hidden>{airport.flag}</span>
            {airport.iata}
            <span className="hidden text-foreground/55 font-medium sm:inline">
              {airport.city}
            </span>
          </span>
        ) : (
          <span className="text-sm text-foreground/45">Select…</span>
        )}
      </span>
      <ChevronDown
        className={`h-3.5 w-3.5 shrink-0 text-foreground/45 transition-transform ${active ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}

function Popover({
  side,
  exclude,
  onSelect,
}: {
  side: Side;
  exclude: Airport | null;
  onSelect: (a: Airport) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = exclude
      ? airports.filter((a) => a.iata !== exclude.iata)
      : airports;
    if (!q) return base;
    return base.filter((a) =>
      `${a.iata} ${a.name} ${a.city} ${a.country}`
        .toLowerCase()
        .includes(q),
    );
  }, [query, exclude]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      role="listbox"
      className={`absolute bottom-full mb-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-foreground/10 bg-background/95 shadow-2xl shadow-black/30 backdrop-blur-xl ${
        side === "from" ? "left-0" : "right-0"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-foreground/5 px-3 py-2.5">
        <Search className="h-4 w-4 text-foreground/40" aria-hidden="true" />
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
          filtered.map((a) => (
            <li key={a.iata}>
              <button
                type="button"
                onClick={() => onSelect(a)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-foreground/[0.05]"
              >
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <span aria-hidden>{a.flag}</span>
                    {a.iata}
                  </span>
                  <span className="truncate text-foreground/60">
                    {a.city}
                    <span className="text-foreground/40">
                      {" "}
                      · {a.country}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </motion.div>
  );
}
