import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://supersonicimpact.vercel.app";

export const metadata: Metadata = {
  title: "supersonicimpact",
  description:
    "Route comparisons, time-value calculators, and economic-impact simulations for Boom Supersonic's Overture and the next generation of supersonic aircraft.",
  metadataBase: new URL(SITE_URL),
  authors: [{ name: "Matt", url: "https://github.com/mattl7770" }],
  creator: "Matt",
  keywords: [
    "supersonic",
    "Boom Supersonic",
    "Overture",
    "Concorde",
    "aviation",
    "data visualization",
    "interactive",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "supersonicimpact",
    title: "supersonicimpact",
    description:
      "Route comparisons, time-value calculator, and economic-impact simulator for Boom Supersonic's Overture and the next generation of supersonic aircraft.",
  },
  twitter: {
    card: "summary_large_image",
    title: "supersonicimpact",
    description:
      "Route comparisons, time-value calculator, and economic-impact simulator for the next generation of supersonic aircraft.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
