"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "supersonicimpact.projection";

export type Projection = "globe" | "flat";

function isValid(s: string | null): s is Projection {
  return s === "globe" || s === "flat";
}

function readSnapshot(): Projection {
  if (typeof window === "undefined") return "globe";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isValid(raw) ? raw : "globe";
}

function subscribe(callback: () => void) {
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) callback();
  }
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function useProjectionPref(): [Projection, (p: Projection) => void] {
  const projection = useSyncExternalStore(
    subscribe,
    readSnapshot,
    () => "globe" as Projection,
  );

  const setProjection = useCallback((next: Projection) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      // useSyncExternalStore doesn't see same-tab writes via the "storage" event,
      // so we dispatch one manually to keep all subscribers in sync.
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: next }),
      );
    } catch {
      // ignore
    }
  }, []);

  return [projection, setProjection];
}
