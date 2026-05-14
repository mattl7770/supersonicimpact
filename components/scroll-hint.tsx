"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useIsScrolled } from "@/lib/use-scroll";

export function ScrollHint() {
  const scrolled = useIsScrolled(40);

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={
        scrolled
          ? { opacity: 0, y: 8 }
          : { opacity: 0.6, y: [0, 6, 0] }
      }
      transition={
        scrolled
          ? { duration: 0.25 }
          : {
              y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.6 },
            }
      }
      className="flex items-center justify-center text-foreground/55"
    >
      <ChevronDown className="h-5 w-5" />
    </motion.div>
  );
}
