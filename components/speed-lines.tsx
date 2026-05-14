"use client";

import { motion } from "framer-motion";

const lines = [
  { top: "18%", duration: 7.5, delay: 0 },
  { top: "32%", duration: 9, delay: 1.8 },
  { top: "46%", duration: 6, delay: 0.6 },
  { top: "58%", duration: 8.5, delay: 3 },
  { top: "72%", duration: 10, delay: 1.2 },
  { top: "84%", duration: 7, delay: 2.4 },
];

export function SpeedLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-40 bg-gradient-to-r from-transparent via-accent/40 to-transparent"
          style={{ top: line.top, left: "100vw" }}
          initial={{ x: 0 }}
          animate={{ x: "-110vw" }}
          transition={{
            duration: line.duration,
            delay: line.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
