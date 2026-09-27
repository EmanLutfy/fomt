// Data shapes mirrored from the fomotrenches backend dashboard. Field names
// follow the columns it shows, so wiring the real feed in later is a mapping
// exercise, not a redesign.

/** How confident the roster is that a handle really owns its wallet. */
export type Check = "high" | "medium" | "low";

/** Where a wallet↔handle link was published. */
export type Source = "fomoapi" | "fomoapi-blog" | "fomopulse" | "fomoradar" | "rhtrenches";

export interface Wallet {
  address: string;
  /** null = anonymous ("onchain-only"): found on-chain, no published handle. */
  handle: string | null;
  name: string | null;
  aka?: string;
  followers: number | null;
  check: Check | null;
  sources: Source[];
  /** Lifetime P/L across all chains, as reported by fomo. */
  fomoPnl: number | null;
  vol24h: number | null;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  supply: number;
  /** ms epoch the pool was created. */
  createdAt: number;
  liquidity: number;
}

export type Side = "buy" | "sell";

export interface Fill {
  id: string;
  /** ms epoch */
  t: number;
  side: Side;
  token: string;
  sizeUsd: number;
  price: number;
  mcap: number;
  amount: number;
  wallet: string;
  /** A sell of a bag bought before the tape started watching — cost unknown. */
  preTape: boolean;
  tx: string;
}

/** A position taken from flat back to flat, seen entirely by the tape. */
export interface ClosedTrade {
  id: string;
  wallet: string;
  token: string;
  openedAt: number;
  closedAt: number;
  paidIn: number;
  gotOut: number;
  made: number;
  /** fraction, e.g. 0.412 = +41.2% */
  ret: number;
  fills: number;
}

export interface OpenBag {
  wallet: string;
  token: string;
  amount: number;
  cost: number;
  openedAt: number;
  fills: number;
}

export type TimeWindow = "1h" | "24h" | "7d" | "30d" | "all";

export const WINDOW_MS: Record<TimeWindow, number> = {
  "1h": 3_600_000,
  "24h": 86_400_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
  all: Number.POSITIVE_INFINITY,
};

export const WINDOWS: TimeWindow[] = ["1h", "24h", "7d", "30d", "all"];
