import { useSyncExternalStore } from "react";

/**
 * SSR-safe scroll subscription that returns true once the viewport has scrolled
 * past the given pixel threshold.
 */
export function useIsScrolled(threshold = 50): boolean {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("scroll", callback, { passive: true });
      return () => window.removeEventListener("scroll", callback);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}

/**
 * Returns true once the viewport has scrolled past `fraction` of the viewport
 * height (default 60%). Used to reveal sticky UI once the hero is mostly off
 * screen.
 */
export function useScrolledPastHero(fraction = 0.6): boolean {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("scroll", callback, { passive: true });
      window.addEventListener("resize", callback, { passive: true });
      return () => {
        window.removeEventListener("scroll", callback);
        window.removeEventListener("resize", callback);
      };
    },
    () => window.scrollY > window.innerHeight * fraction,
    () => false,
  );
}
