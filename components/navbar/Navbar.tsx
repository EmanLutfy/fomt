"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { List, MagnifyingGlass, X } from "@phosphor-icons/react";
import { container } from "@/lib/ui";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/terminal", label: "Terminal" },
  { href: "/traders", label: "Traders" },
  { href: "/tokens", label: "Tokens" },
];

// The skill's shadow rule ("practically non-existent, opacity < 0.05") in
// place of the old shadow-[0_12px_32px_rgba(0,0,0,0.45)] — the floating nav
// still needs *some* separation cue when scrolling past content, this is
// just what "ultra-diffuse" actually means as a value.
const FLOAT_SHADOW = "shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

// apple-design's default spring: critically damped (bounce 0), ~0.35s
// response — used for every panel below instead of a fixed-duration
// CSS transition, since a spring can be grabbed/redirected if the user
// re-triggers it mid-animation (e.g. toggling search open/closed fast).
const SPRING = { type: "spring" as const, bounce: 0, duration: 0.35 };

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!searchOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes whichever overlay is open — search first, then the menu.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (searchOpen) setSearchOpen(false);
      else if (menuOpen) setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, menuOpen]);

  // Reduced motion: cross-fade only, no slide/scale — per the skill's own
  // accessibility rule (§14), not just a generic "turn animation off".
  const panelVariants = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: -8, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } };
  const sheetVariants = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } };

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-50 sm:top-4">
        <div className={`${container} flex h-16 items-center justify-between gap-4`}>
          <Link
            href="/"
            aria-label="FOMT home"
            className={`origin-left flex items-center justify-center transition-all duration-300 ease-out ${
              scrolled
                ? `rounded-full border border-border-strong bg-bg-deep/80 p-2 backdrop-blur-md ${FLOAT_SHADOW}`
                : "rounded-full border border-transparent p-2"
            }`}
          >
            <Logo size={26} />
          </Link>

          {/* Desktop: nav links, a divider, and search all live inside one floating
              pill bar, curved to match the rest of the interface. */}
          <div
            className={`hidden items-center gap-0.5 rounded-full border border-border-strong bg-bg-deep/80 p-1.5 backdrop-blur-md md:flex ${FLOAT_SHADOW}`}
          >
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "text-accent" : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <span className="mx-1 h-5 w-px bg-border-strong" />
            <button
              type="button"
              aria-label="Search"
              aria-pressed={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className={`rounded-full p-2.5 transition active:scale-[0.96] ${
                searchOpen ? "bg-surface-hover text-accent" : "text-ink-muted hover:bg-surface-hover hover:text-ink"
              }`}
            >
              <MagnifyingGlass size={17} weight="bold" />
            </button>
            <ThemeToggle />
          </div>

          {/* Mobile: same floating pill-bar treatment as the desktop bar, just narrower */}
          <div
            className={`flex items-center gap-1 rounded-full border border-border-strong bg-bg-deep/80 p-1 backdrop-blur-md md:hidden ${FLOAT_SHADOW}`}
          >
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="rounded-full p-2 text-ink-muted transition hover:text-ink active:scale-[0.96]"
            >
              <MagnifyingGlass size={20} weight="bold" />
            </button>
            <ThemeToggle />
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2 text-ink-muted transition hover:text-ink active:scale-[0.96]"
            >
              <List size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Anchored to the search trigger above it (transform-origin: top) and
            materializing — opacity + scale + a slight downward settle together,
            not a plain fade — per the skill's "materialize, don't just fade"
            rule for surfaces that carry blur. */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              ref={searchPanelRef}
              className={`${container} origin-top pb-4`}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={panelVariants}
              transition={SPRING}
            >
              <GlobalSearch onNavigate={() => setSearchOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col gap-6 bg-bg px-5 pt-6 md:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
            transition={SPRING}
            style={{ transformOrigin: "top right" }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center" aria-label="FOMT">
                <Logo size={26} />
              </span>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full p-2 text-ink active:scale-[0.96]"
                >
                  <X size={22} weight="bold" />
                </button>
              </div>
            </div>
            <GlobalSearch onNavigate={() => setMenuOpen(false)} />
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border py-4 text-lg text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
