// Everything the pages show, computed from the engine's fills for a given
// time window. Pure functions of (engine, window, now).

import type { Engine } from "./engine";
import { WINDOW_MS, type ClosedTrade, type Fill, type TimeWindow, type Wallet } from "./types";

export const windowStart = (win: TimeWindow, now: number) => now - WINDOW_MS[win];

/** Fills inside the window, newest first. `clean` drops pre-tape sells. */
export function tapeFills(engine: Engine, win: TimeWindow, now: number, clean: boolean): Fill[] {
  const from = windowStart(win, now);
  const out: Fill[] = [];
  for (let i = engine.fills.length - 1; i >= 0; i--) {
    const f = engine.fills[i];
    if (f.t < from) break;
    if (clean && f.preTape) continue;
    out.push(f);
  }
  return out;
}

export interface TraderRow {
  wallet: Wallet;
  fills: number;
  volume: number;
  pnlSells: number;
  pnlOpen: number | null;
  total: number;
  won: number | null;
  closed: number;
  best: number | null;
  worst: number | null;
  lastAt: number | null;
}

export function traderRows(engine: Engine, win: TimeWindow, now: number): TraderRow[] {
  const from = windowStart(win, now);
  const rows = new Map<string, TraderRow>();
  const row = (address: string) => {
    let x = rows.get(address);
    if (!x) {
      x = {
        wallet: engine.byAddress.get(address)!,
        fills: 0, volume: 0, pnlSells: 0, pnlOpen: null, total: 0,
        won: null, closed: 0, best: null, worst: null, lastAt: null,
      };
      rows.set(address, x);
    }
    return x;
  };

  for (const f of engine.fills) {
    if (f.t < from) continue;
    const x = row(f.wallet);
    x.fills += 1;
    x.volume += f.sizeUsd;
    x.lastAt = f.t;
    const pnl = engine.realized.get(f.id);
    if (pnl !== undefined) x.pnlSells += pnl;
  }

  const wins = new Map<string, number>();
  for (const c of engine.closed) {
    if (c.closedAt < from) continue;
    const x = row(c.wallet);
    x.closed += 1;
    if (c.made > 0) wins.set(c.wallet, (wins.get(c.wallet) ?? 0) + 1);
    x.best = x.best === null ? c.made : Math.max(x.best, c.made);
    x.worst = x.worst === null ? c.made : Math.min(x.worst, c.made);
  }

  // Open bags are marked to market now regardless of window.
  for (const bag of engine.allOpenBags()) {
    const x = rows.get(bag.wallet);
    if (!x) continue;
    const value = bag.amount * engine.priceAt(bag.token, now);
    x.pnlOpen = (x.pnlOpen ?? 0) + (value - bag.cost);
  }

  for (const x of rows.values()) {
    x.won = x.closed ? (wins.get(x.wallet.address) ?? 0) / x.closed : null;
    x.total = x.pnlSells + (x.pnlOpen ?? 0);
  }
  return [...rows.values()]
    .filter((x) => x.fills > 0 || x.closed > 0)
    .sort((a, b) => b.pnlSells - a.pnlSells || b.total - a.total);
}

export function closedTrades(engine: Engine, win: TimeWindow, now: number): ClosedTrade[] {
  const from = windowStart(win, now);
  const out: ClosedTrade[] = [];
  for (let i = engine.closed.length - 1; i >= 0; i--) {
    const c = engine.closed[i];
    if (c.closedAt < from) break;
    out.push(c);
  }
  return out;
}

export interface TokenFlow {
  symbol: string;
  name: string;
  kols: number;
  bought: number;
  sold: number;
  net: number;
  mcap: number;
  change24h: number;
  firstIn: Wallet;
  who: Wallet[];
  lastAt: number;
}

export function tokenFlows(engine: Engine, win: TimeWindow, now: number): TokenFlow[] {
  const from = windowStart(win, now);
  const acc = new Map<string, { bought: number; sold: number; buyers: string[]; seen: Set<string>; lastAt: number }>();
  for (const f of engine.fills) {
    if (f.t < from) continue;
    let a = acc.get(f.token);
    if (!a) {
      a = { bought: 0, sold: 0, buyers: [], seen: new Set(), lastAt: 0 };
      acc.set(f.token, a);
    }
    a.lastAt = Math.max(a.lastAt, f.t);
    if (f.side === "buy") {
      a.bought += f.sizeUsd;
      if (!a.seen.has(f.wallet)) {
        a.seen.add(f.wallet);
        a.buyers.push(f.wallet);
      }
    } else a.sold += f.sizeUsd;
  }
  const out: TokenFlow[] = [];
  for (const [symbol, a] of acc) {
    if (!a.buyers.length) continue;
    const token = engine.bySymbol.get(symbol)!;
    const then = engine.priceAt(symbol, Math.max(token.createdAt, now - 86_400_000));
    out.push({
      symbol,
      name: token.name,
      kols: a.buyers.length,
      bought: a.bought,
      sold: a.sold,
      net: a.bought - a.sold,
      mcap: engine.mcapAt(symbol, now),
      change24h: engine.priceAt(symbol, now) / then - 1,
      firstIn: engine.byAddress.get(a.buyers[0])!,
      who: a.buyers.map((w) => engine.byAddress.get(w)!),
      lastAt: a.lastAt,
    });
  }
  return out.sort((a, b) => b.kols - a.kols || b.net - a.net);
}

export interface WalletView {
  wallet: Wallet;
  bags: { token: string; amount: number; cost: number; value: number; pnl: number; mcap: number; heldMs: number }[];
  closed: ClosedTrade[];
  fills: Fill[];
  pnlSells: number;
  pnlOpen: number;
  volume: number;
  won: number;
}

export function walletView(engine: Engine, address: string, now: number): WalletView | null {
  const wallet = engine.byAddress.get(address);
  if (!wallet) return null;
  const bags = engine.openBags(address).map((b) => {
    const value = b.amount * engine.priceAt(b.token, now);
    return {
      token: b.token,
      amount: b.amount,
      cost: b.cost,
      value,
      pnl: value - b.cost,
      mcap: engine.mcapAt(b.token, now),
      heldMs: now - b.openedAt,
    };
  });
  const fills = engine.fills.filter((f) => f.wallet === address).reverse();
  const closed = engine.closed.filter((c) => c.wallet === address).reverse();
  let pnlSells = 0;
  let volume = 0;
  for (const f of fills) {
    volume += f.sizeUsd;
    pnlSells += engine.realized.get(f.id) ?? 0;
  }
  return {
    wallet,
    bags: bags.sort((a, b) => b.value - a.value),
    closed,
    fills,
    pnlSells,
    pnlOpen: bags.reduce((s, b) => s + b.pnl, 0),
    volume,
    won: closed.filter((c) => c.made > 0).length,
  };
}

export interface FollowChain {
  token: string;
  leader: Wallet;
  leaderAt: number;
  leaderPrice: number;
  followers: { wallet: Wallet; delayMs: number; sizeUsd: number }[];
  /** Price move from the leader's entry to now. */
  since: number;
}

/**
 * For each token bought in the window: the first buyer, and every distinct
 * wallet that bought the same token within `followMs` after them.
 */
export function followChains(engine: Engine, win: TimeWindow, now: number, followMs = 2 * 3_600_000): FollowChain[] {
  const from = windowStart(win, now);
  const buys = engine.fills.filter((f) => f.side === "buy" && f.t >= from);
  const byToken = new Map<string, Fill[]>();
  for (const b of buys) {
    const list = byToken.get(b.token) ?? [];
    list.push(b);
    byToken.set(b.token, list);
  }
  const chains: FollowChain[] = [];
  for (const [token, list] of byToken) {
    let i = 0;
    while (i < list.length) {
      const lead = list[i];
      const seen = new Set([lead.wallet]);
      const followers: FollowChain["followers"] = [];
      let j = i + 1;
      while (j < list.length && list[j].t - lead.t <= followMs) {
        if (!seen.has(list[j].wallet)) {
          seen.add(list[j].wallet);
          followers.push({ wallet: engine.byAddress.get(list[j].wallet)!, delayMs: list[j].t - lead.t, sizeUsd: list[j].sizeUsd });
        }
        j++;
      }
      if (followers.length >= 2) {
        chains.push({
          token,
          leader: engine.byAddress.get(lead.wallet)!,
          leaderAt: lead.t,
          leaderPrice: lead.price,
          followers,
          since: engine.priceAt(token, now) / lead.price - 1,
        });
      }
      i = Math.max(j, i + 1);
    }
  }
  return chains.sort((a, b) => b.leaderAt - a.leaderAt);
}

export interface FreshPool {
  symbol: string;
  name: string;
  address: string;
  createdAt: number;
  liquidity: number;
  mcap: number;
  sinceLaunch: number;
  kolsIn: number;
  firstKol: Wallet | null;
  firstKolDelayMs: number | null;
  bought: number;
}

export function freshPools(engine: Engine, now: number, maxAgeMs = 7 * 86_400_000): FreshPool[] {
  return engine.tokens
    .filter((t) => now - t.createdAt <= maxAgeMs && t.createdAt <= now)
    .map((t) => {
      const buys = engine.fills.filter((f) => f.token === t.symbol && f.side === "buy");
      const first = buys[0];
      return {
        symbol: t.symbol,
        name: t.name,
        address: t.address,
        createdAt: t.createdAt,
        liquidity: t.liquidity,
        mcap: engine.mcapAt(t.symbol, now),
        sinceLaunch: engine.priceAt(t.symbol, now) / engine.priceAt(t.symbol, t.createdAt) - 1,
        kolsIn: new Set(buys.map((b) => b.wallet)).size,
        firstKol: first ? engine.byAddress.get(first.wallet)! : null,
        firstKolDelayMs: first ? first.t - t.createdAt : null,
        bought: buys.reduce((s, b) => s + b.sizeUsd, 0),
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Volume per bucket across the window, for the small sparkline charts. */
export function volumeSeries(engine: Engine, win: TimeWindow, now: number, buckets = 32): number[] {
  const span = Math.min(WINDOW_MS[win], now - engine.tapeStart);
  const from = now - span;
  const out = new Array(buckets).fill(0);
  for (let i = engine.fills.length - 1; i >= 0; i--) {
    const f = engine.fills[i];
    if (f.t < from) break;
    const b = Math.min(buckets - 1, Math.floor(((f.t - from) / span) * buckets));
    out[b] += f.sizeUsd;
  }
  return out;
}
