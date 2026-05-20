"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  CUSTOM_AIRCRAFT,
  DEFAULT_AIRCRAFT,
  aircraft as ALL_AIRCRAFT,
  getAircraftById,
  type Aircraft,
} from "./aircraft";

const STORAGE_KEY = "supersonicimpact.aircraft";

export type AircraftConfig = Pick<
  Aircraft,
  | "topMach"
  | "rangeNm"
  | "boomlessCruiseMach"
  | "hasBoomlessCruise"
  | "passengers"
>;

type PersistedState = {
  v: 1;
  presetId: string;
  config: AircraftConfig;
};

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
    hasBoomlessCruise: a.hasBoomlessCruise,
    passengers: a.passengers,
  };
}

function isFiniteInRange(n: unknown, min: number, max: number): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
}

function validate(parsed: unknown): PersistedState | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (o.v !== 1) return null;
  if (typeof o.presetId !== "string") return null;
  const matchedPreset =
    o.presetId === "custom" ? CUSTOM_AIRCRAFT : getAircraftById(o.presetId);
  if (!matchedPreset) return null;
  const c = o.config;
  if (!c || typeof c !== "object") return null;
  const cfg = c as Record<string, unknown>;
  if (!isFiniteInRange(cfg.topMach, 0.5, 3)) return null;
  if (!isFiniteInRange(cfg.rangeNm, 500, 15000)) return null;
  if (!isFiniteInRange(cfg.boomlessCruiseMach, 0.5, 2)) return null;
  if (!isFiniteInRange(cfg.passengers, 1, 1000)) return null;
  // hasBoomlessCruise was added later. Fall back to the matched preset's value
  // so old persisted state migrates cleanly.
  const hasBoomlessCruise =
    typeof cfg.hasBoomlessCruise === "boolean"
      ? cfg.hasBoomlessCruise
      : matchedPreset.hasBoomlessCruise;
  return {
    v: 1,
    presetId: o.presetId,
    config: {
      topMach: cfg.topMach,
      rangeNm: cfg.rangeNm,
      boomlessCruiseMach: cfg.boomlessCruiseMach,
      hasBoomlessCruise,
      passengers: cfg.passengers,
    },
  };
}

const DEFAULT_STATE: PersistedState = {
  v: 1,
  presetId: DEFAULT_AIRCRAFT.id,
  config: configFromAircraft(DEFAULT_AIRCRAFT),
};

// Module-level cache so `useSyncExternalStore` returns a stable reference
// when the underlying JSON hasn't changed.
let cachedRaw: string | null = null;
let cachedSnapshot: PersistedState = DEFAULT_STATE;

function readSnapshot(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  if (!raw) {
    cachedSnapshot = DEFAULT_STATE;
    return cachedSnapshot;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedSnapshot = validate(parsed) ?? DEFAULT_STATE;
  } catch {
    cachedSnapshot = DEFAULT_STATE;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): PersistedState {
  return DEFAULT_STATE;
}

function subscribe(callback: () => void) {
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) callback();
  }
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function writeStorage(next: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, json);
    // useSyncExternalStore doesn't see same-tab writes via the "storage" event,
    // so we dispatch one manually to keep subscribers in sync.
    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEY, newValue: json }),
    );
  } catch {
    // ignore
  }
}

export function AircraftProvider({ children }: { children: ReactNode }) {
  const persisted = useSyncExternalStore(
    subscribe,
    readSnapshot,
    getServerSnapshot,
  );

  const preset = useMemo<Aircraft>(() => {
    if (persisted.presetId === "custom") return CUSTOM_AIRCRAFT;
    return getAircraftById(persisted.presetId) ?? DEFAULT_AIRCRAFT;
  }, [persisted.presetId]);

  const setPreset = useCallback((id: string) => {
    if (id === "custom") {
      const cur = readSnapshot();
      writeStorage({ v: 1, presetId: "custom", config: cur.config });
      return;
    }
    const a = getAircraftById(id);
    if (!a) return;
    writeStorage({
      v: 1,
      presetId: a.id,
      config: configFromAircraft(a),
    });
  }, []);

  const setConfig = useCallback((partial: Partial<AircraftConfig>) => {
    const cur = readSnapshot();
    // Custom always exposes the full set of knobs, including Boomless Cruise.
    // If we're auto-switching from a non-Boomless preset (e.g. Concorde), flip
    // hasBoomlessCruise on so the slider becomes available.
    const wasCustom = cur.presetId === "custom";
    writeStorage({
      v: 1,
      presetId: "custom",
      config: {
        ...cur.config,
        ...partial,
        hasBoomlessCruise: wasCustom ? cur.config.hasBoomlessCruise : true,
      },
    });
  }, []);

  const resetToPreset = useCallback(() => {
    const cur = readSnapshot();
    if (cur.presetId === "custom") return;
    const a = getAircraftById(cur.presetId);
    if (!a) return;
    writeStorage({
      v: 1,
      presetId: a.id,
      config: configFromAircraft(a),
    });
  }, []);

  const value = useMemo<AircraftContextValue>(
    () => ({
      preset,
      config: persisted.config,
      setPreset,
      setConfig,
      resetToPreset,
    }),
    [preset, persisted.config, setPreset, setConfig, resetToPreset],
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

export { ALL_AIRCRAFT, CUSTOM_AIRCRAFT };
