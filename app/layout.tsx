import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FomoProvider } from "@/components/app/FomoProvider";
import { AppShell } from "@/components/app/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "fomotrenches",
    template: "%s · fomotrenches",
  },
  description:
    "Every buy and sell by 1000 tracked trader and KOL wallets on Robinhood Chain, as it lands. Read-only, public on-chain data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body>
        <FomoProvider>
          <AppShell>{children}</AppShell>
        </FomoProvider>
      </body>
    </html>
  );
}
