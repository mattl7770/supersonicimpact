"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

type GaugeRingProps = {
  /** Fraction in [0, 1]+ (values > 1 are clamped to 1 for the arc). */
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
};

export function GaugeRing({
  value,
  size = 96,
  stroke = 8,
  label,
  className,
}: GaugeRingProps) {
  const reduced = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(1, value));

  const progress = useMotionValue(reduced ? target : 0);
  const dashOffset = useTransform(
    progress,
    (p) => circumference * (1 - p),
  );
  const percentText = useTransform(progress, (p) => `${(p * 100).toFixed(1)}%`);

  useEffect(() => {
    if (reduced) {
      progress.set(target);
      return;
    }
    const controls = animate(progress, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [target, reduced, progress]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={
          label
            ? `${label}: ${(target * 100).toFixed(1)} percent`
            : `${(target * 100).toFixed(1)} percent`
        }
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="color-mix(in oklab, var(--foreground) 10%, transparent)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span className="text-sm font-semibold tabular-nums text-foreground">
          {percentText}
        </motion.span>
      </div>
      {label && (
        <span className="mt-2 text-center text-[10px] uppercase tracking-wider text-foreground/55">
          {label}
        </span>
      )}
    </div>
  );
}
