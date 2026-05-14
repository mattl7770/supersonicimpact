"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "supersonicimpact.hourly-rate";
const DEFAULT_RATE = 300;

type ValueContextValue = {
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
};

const ValueContext = createContext<ValueContextValue | null>(null);

export function ValueProvider({ children }: { children: ReactNode }) {
  const [hourlyRate, setRateState] = useState<number>(DEFAULT_RATE);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRateState(parsed);
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  const setHourlyRate = useCallback((rate: number) => {
    setRateState(rate);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(rate));
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ hourlyRate, setHourlyRate }),
    [hourlyRate, setHourlyRate],
  );

  return (
    <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
  );
}

export function useHourlyRate(): ValueContextValue {
  const ctx = useContext(ValueContext);
  if (!ctx) {
    throw new Error("useHourlyRate must be used inside ValueProvider");
  }
  return ctx;
}
