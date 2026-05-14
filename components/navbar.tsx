import Link from "next/link";
import { MachWave } from "./mach-wave";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { label: "Comparator", href: "#comparator", available: true },
  { label: "Time Value", href: "#time-value", available: false },
  { label: "Economic Impact", href: "#economic-impact", available: false },
  { label: "Sustainability", href: "#sustainability", available: false },
  { label: "About", href: "#about", available: false },
];

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-foreground/5 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <MachWave className="h-4 w-8 text-accent" />
          <span>Supersonic Impact</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.available ? (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ) : (
              <li key={item.label}>
                <span
                  title="Coming soon"
                  className="cursor-default rounded-full px-3 py-1.5 text-sm text-foreground/35"
                >
                  {item.label}
                </span>
              </li>
            ),
          )}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="#comparator"
            className="hidden rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Try Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
