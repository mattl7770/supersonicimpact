"use client";

import { motion } from "framer-motion";
import { useScrolledPastHero } from "@/lib/use-scroll";

const items = [
  { label: "Comparator", href: "#comparator", available: true },
  { label: "Economic Impact", href: "#economic-impact", available: true },
  { label: "Sustainability", href: "#sustainability", available: false },
  { label: "About", href: "#about", available: false },
];

export function SectionNav() {
  const visible = useScrolledPastHero(0.55);

  return (
    <motion.nav
      aria-label="Section navigation"
      initial={false}
      animate={
        visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24, pointerEvents: "none" }
      }
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-5 z-40 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full border border-foreground/10 bg-background/80 px-1.5 py-1.5 shadow-2xl shadow-black/15 backdrop-blur-xl"
    >
      {items.map((item) =>
        item.available ? (
          <a
            key={item.label}
            href={item.href}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            {item.label}
          </a>
        ) : (
          <span
            key={item.label}
            title="Coming soon"
            className="rounded-full px-3 py-1.5 text-xs font-medium text-foreground/35"
          >
            {item.label}
          </span>
        ),
      )}
    </motion.nav>
  );
}
