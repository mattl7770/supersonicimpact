import { useSyncExternalStore } from "react";

/**
 * SSR-safe boolean media-query subscription.
 * Server snapshot is always `false` so initial paint is consistent;
 * the real value comes in after hydration via the external store.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
