"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

type CountUpProps = {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  /** Optional formatter; receives the in-flight numeric value each frame. */
  format?: (value: number) => string;
};

export function CountUp({
  value,
  decimals = 0,
  duration = 0.9,
  className,
  format,
}: CountUpProps) {
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(reduced ? value : 0);
  const display = useTransform(motionValue, (latest) =>
    format ? format(latest) : latest.toFixed(decimals),
  );

  useEffect(() => {
    if (reduced) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [motionValue, value, duration, reduced]);

  return <motion.span className={className}>{display}</motion.span>;
}
