"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

type CountUpProps = {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
};

export function CountUp({
  value,
  decimals = 0,
  duration = 0.9,
  className,
}: CountUpProps) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) =>
    latest.toFixed(decimals),
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [motionValue, value, duration]);

  return <motion.span className={className}>{display}</motion.span>;
}
