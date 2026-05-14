"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_AIRCRAFT,
  aircraft as ALL_AIRCRAFT,
  getAircraftById,
  type Aircraft,
} from "./aircraft";

export type AircraftConfig = Pick<
  Aircraft,
  "topMach" | "rangeNm" | "boomlessCruiseMach" | "passengers"
>;

type AircraftContextValue = {
  preset: Aircraft;
  config: AircraftConfig;
  setPreset: (id: string) => void;
  setConfig: (partial: Partial<AircraftConfig>) => void;
  resetToPreset: () => void;
};

const AircraftContext = createContext<AircraftContextValue | null>(null);

function configFromAircraft(a: Aircraft): AircraftConfig {
  return {
    topMach: a.topMach,
    rangeNm: a.rangeNm,
    boomlessCruiseMach: a.boomlessCruiseMach,
    passengers: a.passengers,
  };
}

export function AircraftProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<Aircraft>(DEFAULT_AIRCRAFT);
  const [config, setConfigState] = useState<AircraftConfig>(() =>
    configFromAircraft(DEFAULT_AIRCRAFT),
  );

  const setPreset = useCallback((id: string) => {
    const next = getAircraftById(id);
    if (!next) return;
    setPresetState(next);
    setConfigState(configFromAircraft(next));
  }, []);

  const setConfig = useCallback((partial: Partial<AircraftConfig>) => {
    setConfigState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetToPreset = useCallback(() => {
    setConfigState(configFromAircraft(preset));
  }, [preset]);

  const value = useMemo<AircraftContextValue>(
    () => ({ preset, config, setPreset, setConfig, resetToPreset }),
    [preset, config, setPreset, setConfig, resetToPreset],
  );

  return (
    <AircraftContext.Provider value={value}>
      {children}
    </AircraftContext.Provider>
  );
}

export function useAircraft(): AircraftContextValue {
  const ctx = useContext(AircraftContext);
  if (!ctx) {
    throw new Error("useAircraft must be used inside AircraftProvider");
  }
  return ctx;
}

export { ALL_AIRCRAFT };
