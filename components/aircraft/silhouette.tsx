"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";

import { useMediaQuery } from "@/lib/use-media-query";

type Props = {
  aircraftId: string;
  aircraftName: string;
  className?: string;
};

const PHOTO_IDS = new Set([
  "overture",
  "concorde",
  "tu-144",
  "x-59",
  "xb-1",
  "aerion-as2",
  "spike-s512",
]);

/**
 * Renders a hero photo of the active aircraft, or the rotating lucide
 * `Plane` icon for the Custom pseudo-preset / unknown ids.
 *
 * Photos live under `public/aircraft/<id>.jpg` and were sourced from
 * Wikipedia / Wikimedia Commons. They use `next/image` with `fill`, so
 * the parent must be `position: relative` and have a fixed height.
 */
export function AircraftSilhouette({ aircraftId, aircraftName, className }: Props) {
  if (PHOTO_IDS.has(aircraftId)) {
    return (
      <Image
        src={`/aircraft/${aircraftId}.jpg`}
        alt={aircraftName}
        fill
        sizes="(max-width: 768px) 100vw, 22rem"
        className={`object-cover ${className ?? ""}`}
        priority
      />
    );
  }
  return <CustomPlaneIcon className={className} />;
}

function CustomPlaneIcon({ className }: { className?: string }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <motion.div
      animate={reducedMotion ? undefined : { rotate: 360 }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 22, repeat: Infinity, ease: "linear" }
      }
      className={`flex aspect-square h-16 items-center justify-center text-foreground/85 ${className ?? ""}`}
    >
      <Plane
        className="h-full w-full -rotate-45"
        strokeWidth={1.2}
        aria-hidden="true"
      />
    </motion.div>
  );
}
