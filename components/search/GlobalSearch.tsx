"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { searchAll } from "@/lib/api";
import type { Trader } from "@/types/trader";
import type { Token } from "@/types/token";
import { SearchInput } from "@/components/ui/SearchInput";
import { truncateAddress } from "@/lib/utils";

export function GlobalSearch({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const [traders, setTraders] = useState<Trader[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const results: { href: string; label: string; sub: string }[] = [
    ...traders.map((t) => ({ href: `/traders/${t.handle}`, label: `@${t.handle}`, sub: truncateAddress(t.address) })),
    ...tokens.map((t) => ({ href: `/tokens/${t.symbol.toLowerCase()}`, label: `$${t.symbol}`, sub: t.name })),
  ];

  useEffect(() => {
    if (!query.trim()) {
      setTraders([]);
      setTokens([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const res = await searchAll(query);
      setTraders(res.traders);
      setTokens(res.tokens);
      setLoading(false);
      setActiveIndex(-1);
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function go(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
    onNavigate?.();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      go(results[activeIndex].href);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={onKeyDown}>
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        placeholder="Search trader, wallet, or token"
        className="w-full"
      />
      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-80 origin-top overflow-y-auto rounded-2xl border border-border-strong bg-bg-deep shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            {loading && <div className="px-4 py-3 text-sm text-ink-dim">Searching…</div>}
            {!loading && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-ink-dim">No traders or tokens match &ldquo;{query}&rdquo;.</div>
            )}
            {!loading &&
              results.map((r, i) => (
                <button
                  key={r.href}
                  type="button"
                  onClick={() => go(r.href)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                    activeIndex === i ? "bg-surface text-accent" : "text-ink hover:bg-surface"
                  }`}
                >
                  <span className="font-mono">{r.label}</span>
                  <span className="font-mono text-xs text-ink-dim">{r.sub}</span>
                </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
