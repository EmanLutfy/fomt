"use client";

import { useEffect, useRef, useState } from "react";
import type { Trade } from "@/types/trade";
import { TRADE_LOG, generateLiveTrade } from "@/lib/mock-data";

const MAX_ROWS = 250;
const MIN_INTERVAL_MS = 2200;
const MAX_INTERVAL_MS = 4800;

/**
 * Drives the terminal's live tape. Seeds with the deterministic TRADE_LOG
 * (safe to use during SSR) then, once mounted, appends freshly generated
 * trades on a randomized interval: the abstraction point where a real
 * backend/WebSocket subscription would replace generateLiveTrade().
 */
export function useLiveTrades() {
  const [trades, setTrades] = useState<Trade[]>(TRADE_LOG);
  const [latestId, setLatestId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleNext() {
      const wait = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
      timeoutRef.current = setTimeout(() => {
        const next = generateLiveTrade();
        setTrades((prev) => [next, ...prev].slice(0, MAX_ROWS));
        setLatestId(next.id);
        scheduleNext();
      }, wait);
    }

    scheduleNext();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { trades, latestId, isLive: true };
}
