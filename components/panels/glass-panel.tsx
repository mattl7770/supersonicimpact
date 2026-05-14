"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  side: "left" | "right";
  className?: string;
};

export function GlassPanel({ children, side, className = "" }: GlassPanelProps) {
  const initialX = side === "left" ? -40 : 40;

  return (
    <motion.aside
      initial={{ opacity: 0, x: initialX }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: initialX }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/[0.14] bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-white/[0.02] p-5 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.5),inset_1px_1px_0_0_rgba(255,255,255,0.14),0_0_28px_-8px_rgba(34,211,238,0.4)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.10] dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.01] ${className}`}
    >
      {/* Top-edge highlight to enhance the liquid-glass feel */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
      {children}
    </motion.aside>
  );
}
