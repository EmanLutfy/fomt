"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/components/scroll/useReducedMotionSafe";
import { Moon, Sun } from "@phosphor-icons/react";

const STORAGE_KEY = "fomt-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  // Starts at "light" (matches the SSR markup) and syncs to whatever the
  // blocking inline script in layout.tsx already set on <html> before paint
  // — that script owns avoiding the flash, this just mirrors its result so
  // the icon shown is correct.
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const reduceMotion = useReducedMotionSafe();

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — the toggle still works for
      // this page view, it just won't be remembered next visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative overflow-hidden rounded-full p-2.5 text-ink-muted transition hover:bg-surface-hover hover:text-ink active:scale-[0.96] ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.span
            key="sun"
            className="flex"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.6 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            <Sun size={17} weight="bold" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            className="flex"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.6 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.6 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            <Moon size={17} weight="bold" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
