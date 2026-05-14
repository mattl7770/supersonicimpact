"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Airport } from "./airports";
import { getAirportByIata } from "./airports";

type SelectionContextValue = {
  origin: Airport | null;
  destination: Airport | null;
  setOrigin: (a: Airport | null) => void;
  setDestination: (a: Airport | null) => void;
  setPair: (origin: Airport, destination: Airport) => void;
  selectAirport: (a: Airport) => void;
  swap: () => void;
  reset: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

type SelectionProviderProps = {
  children: ReactNode;
  defaultOrigin?: string | null;
  defaultDestination?: string | null;
};

export function SelectionProvider({
  children,
  defaultOrigin = null,
  defaultDestination = null,
}: SelectionProviderProps) {
  const [origin, setOrigin] = useState<Airport | null>(() =>
    defaultOrigin ? getAirportByIata(defaultOrigin) ?? null : null,
  );
  const [destination, setDestination] = useState<Airport | null>(() =>
    defaultDestination ? getAirportByIata(defaultDestination) ?? null : null,
  );

  const setPair = useCallback((o: Airport, d: Airport) => {
    setOrigin(o);
    setDestination(d);
  }, []);

  // Click flow: empty → fill origin; one filled → fill destination;
  // both filled → rotate (old destination becomes new origin, click becomes destination).
  const selectAirport = useCallback(
    (a: Airport) => {
      if (!origin) {
        setOrigin(a);
        return;
      }
      if (!destination) {
        if (a.iata === origin.iata) return;
        setDestination(a);
        return;
      }
      if (a.iata === origin.iata || a.iata === destination.iata) return;
      setOrigin(destination);
      setDestination(a);
    },
    [origin, destination],
  );

  const swap = useCallback(() => {
    setOrigin(destination);
    setDestination(origin);
  }, [origin, destination]);

  const reset = useCallback(() => {
    setOrigin(null);
    setDestination(null);
  }, []);

  const value = useMemo<SelectionContextValue>(
    () => ({
      origin,
      destination,
      setOrigin,
      setDestination,
      setPair,
      selectAirport,
      swap,
      reset,
    }),
    [origin, destination, setPair, selectAirport, swap, reset],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error("useSelection must be used inside SelectionProvider");
  }
  return ctx;
}
