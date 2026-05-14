import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "supersonicimpact.com — Explore the real-world impact of supersonic flight",
  description:
    "Side-by-side route comparisons, time-value calculators, and economic-impact simulations for Boom Supersonic's Overture and the next generation of supersonic aircraft.",
  metadataBase: new URL("https://supersonicimpact.com"),
  openGraph: {
    title: "supersonicimpact.com",
    description:
      "Explore the real-world impact of supersonic commercial flight.",
    type: "website",
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
