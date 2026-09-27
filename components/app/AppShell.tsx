"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";

const COLLAPSE_KEY = "fomotrenches:sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {}
  }, []);

  // Close the phone drawer on navigation.
  useEffect(() => setMobileOpen(false), [pathname]);

  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });

  return (
    <div className="min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={toggle} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[272px]")}>
        <TopBar onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-6 sm:px-6 lg:pt-8">{children}</main>
        <footer className="mx-auto w-full max-w-[1320px] px-4 pb-10 text-[12px] leading-relaxed text-ink-dim sm:px-6">
          <div className="rounded-2xl border border-line px-4 py-3">
            data: robinhood chain rpc (transfers through fomo&apos;s relay), dexscreener prices · sources: fomoapi.io,
            fomoradar.app, fomopulse, rhtrenches, fomoapi blog
          </div>
          <p className="mt-3 px-1">
            unofficial · read-only · not affiliated with Robinhood Markets or fomo.family · never asks for a wallet, keys or a
            login · public on-chain data only · not financial advice
          </p>
        </footer>
      </div>
    </div>
  );
}
