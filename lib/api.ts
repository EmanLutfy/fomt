import type { Trade, TradeFilters } from "@/types/trade";
import type { Trader, Holding } from "@/types/trader";
import type { Token, TokenStats } from "@/types/token";
import { HOLDINGS, TOKENS, TRADE_LOG, TRADERS } from "@/lib/mock-data";

/**
 * Service layer over the mock dataset. Every UI component reads through
 * here, never through lib/mock-data directly (except the live-trade feed,
 * which is intentionally a separate client-only stream, see
 * hooks/use-live-trades.ts). Swapping this file's bodies for real
 * fetch()/WebSocket calls against a backend is the entire migration path;
 * no component should need to change.
 */

const NETWORK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));
}

export function filterTrades(trades: Trade[], filters: TradeFilters = {}): Trade[] {
  let result = trades;

  if (filters.side && filters.side !== "ALL") {
    result = result.filter((t) => t.side === filters.side);
  }
  if (typeof filters.minSizeUsd === "number") {
    result = result.filter((t) => t.sizeUsd >= filters.minSizeUsd!);
  }
  if (typeof filters.maxSizeUsd === "number") {
    result = result.filter((t) => t.sizeUsd <= filters.maxSizeUsd!);
  }
  if (typeof filters.sinceMinutes === "number") {
    const cutoff = Date.now() - filters.sinceMinutes * 60_000;
    result = result.filter((t) => new Date(t.timestamp).getTime() >= cutoff);
  }
  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.token.toLowerCase().includes(q) ||
        t.traderHandle.toLowerCase().includes(q) ||
        t.traderAddress.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function getTrades(filters: TradeFilters = {}): Promise<Trade[]> {
  return delay(filterTrades(TRADE_LOG, filters));
}

export async function getTraders(query?: string): Promise<Trader[]> {
  if (!query) return delay(TRADERS);
  const q = query.trim().toLowerCase();
  return delay(
    TRADERS.filter((t) => t.handle.toLowerCase().includes(q) || t.address.toLowerCase().includes(q))
  );
}

export async function getTrader(handle: string): Promise<Trader | null> {
  return delay(TRADERS.find((t) => t.handle.toLowerCase() === handle.toLowerCase()) ?? null);
}

export async function getTraderHoldings(handle: string): Promise<Holding[]> {
  return delay(HOLDINGS[handle.toLowerCase()] ?? []);
}

export async function getTraderActivity(handle: string): Promise<Trade[]> {
  return delay(TRADE_LOG.filter((t) => t.traderHandle.toLowerCase() === handle.toLowerCase()));
}

export async function getTokens(query?: string): Promise<Token[]> {
  if (!query) return delay(TOKENS);
  const q = query.trim().toLowerCase();
  return delay(
    TOKENS.filter((t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
  );
}

export async function getToken(symbol: string): Promise<Token | null> {
  return delay(TOKENS.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase()) ?? null);
}

export async function getTokenActivity(symbol: string): Promise<Trade[]> {
  return delay(TRADE_LOG.filter((t) => t.token.toLowerCase() === symbol.toLowerCase()));
}

export async function getTokenStats(symbol: string): Promise<TokenStats> {
  const activity = TRADE_LOG.filter((t) => t.token.toLowerCase() === symbol.toLowerCase());
  const buys = activity.filter((t) => t.side === "BUY");
  const sells = activity.filter((t) => t.side === "SELL");
  return delay({
    trackedWalletsActive: new Set(activity.map((t) => t.traderHandle)).size,
    buys: buys.length,
    sells: sells.length,
    trackedBuyVolumeUsd: buys.reduce((sum, t) => sum + t.sizeUsd, 0),
    trackedSellVolumeUsd: sells.reduce((sum, t) => sum + t.sizeUsd, 0),
  });
}

export async function searchAll(query: string): Promise<{ traders: Trader[]; tokens: Token[] }> {
  const q = query.trim().toLowerCase();
  if (!q) return { traders: [], tokens: [] };
  return delay({
    traders: TRADERS.filter(
      (t) => t.handle.toLowerCase().includes(q) || t.address.toLowerCase().includes(q)
    ).slice(0, 6),
    tokens: TOKENS.filter(
      (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    ).slice(0, 6),
  });
}
