import type { Metadata } from "next";
import { Montserrat, Instrument_Serif, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/Footer";

// Runs before paint so the light/dark toggle never flashes the wrong theme
// on load — reads the saved choice (falling back to OS preference) and sets
// data-theme on <html> before React hydrates. See globals.css for the two
// CSS-variable palettes this attribute switches between.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("fomt-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Editorial serif for display type, per the installed "minimalist-ui" skill's
// own named target list (Lyon Text / Newsreader / Playfair Display /
// Instrument Serif) — swapped from Bodoni Moda to match the skill exactly.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Fallback for the hero headline on devices without Apple's SF Pro (see the
// `hero` font family in tailwind.config.js). Only the one weight it uses.
const inter = Inter({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-hero",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FOMT: Fear Of Missing Trenches",
    template: "%s | FOMT",
  },
  description:
    "A read-only on-chain intelligence terminal tracking what tracked traders and KOL wallets are doing on Robinhood Chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${instrumentSerif.variable} ${geistMono.variable} ${inter.variable}`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body>
        <Providers>
          <Navbar />
          {/* The navbar is fixed (floats over content) rather than sticky, so it no
              longer reserves its own space in flow — this padding replaces that
              reserved space for every page except the hero, which cancels it locally. */}
          <main className="pt-20 sm:pt-24">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
