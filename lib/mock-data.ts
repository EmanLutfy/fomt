import type { Trade, TradeSide } from "@/types/trade";
import type { Trader, Holding } from "@/types/trader";
import type { Token } from "@/types/token";

// Deterministic hashing so addresses/hashes/history are identical on the
// server render and the client hydration pass. No random values touch
// anything that renders during SSR. Live-feed randomness (see
// generateLiveTrade) is confined to a client-only effect.
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function hexOfLength(seed: string, len: number): string {
  let out = "";
  let h = fnv1a(seed);
  while (out.length < len) {
    h = fnv1a(h.toString(16) + seed + out.length);
    out += h.toString(16).padStart(8, "0");
  }
  return out.slice(0, len);
}

export function deriveAddress(seed: string): string {
  return "0x" + hexOfLength("addr:" + seed, 40);
}

export function deriveTxHash(seed: string): string {
  return "0x" + hexOfLength("tx:" + seed, 64);
}

function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HANDLES = [
  "ozzi",
  "unipics",
  "frankdegos",
  "lunardrop",
  "kesh",
  "renfield",
  "tako",
  "mvrk",
  "snowline",
  "drift0x",
] as const;

interface TokenSeed {
  symbol: string;
  name: string;
  basePrice: number;
  baseMarketCap: number;
}

const TOKEN_SEEDS: TokenSeed[] = [
  { symbol: "PONS", name: "Pons Protocol", basePrice: 0.42, baseMarketCap: 42_100_000 },
  { symbol: "RBC", name: "Robinhood Chain Token", basePrice: 0.18, baseMarketCap: 18_400_000 },
  { symbol: "XYZ", name: "XYZ Finance", basePrice: 1.21, baseMarketCap: 91_200_000 },
  { symbol: "HOOD", name: "Hoodie Coin", basePrice: 0.065, baseMarketCap: 6_500_000 },
  { symbol: "VLT", name: "Vault Labs", basePrice: 2.84, baseMarketCap: 128_000_000 },
  { symbol: "DRFT", name: "Drift Markets", basePrice: 0.031, baseMarketCap: 3_100_000 },
  { symbol: "NOVA", name: "Nova Chain", basePrice: 0.94, baseMarketCap: 54_300_000 },
  { symbol: "GRID", name: "Gridlock", basePrice: 0.011, baseMarketCap: 1_450_000 },
];

const TOKEN_SUPPLY: Record<string, number> = Object.fromEntries(
  TOKEN_SEEDS.map((t) => [t.symbol, t.baseMarketCap / t.basePrice])
);

export const TOKEN_ADDRESS: Record<string, string> = Object.fromEntries(
  TOKEN_SEEDS.map((t) => [t.symbol, deriveAddress("token:" + t.symbol)])
);

export const TRADER_ADDRESS: Record<string, string> = Object.fromEntries(
  HANDLES.map((h) => [h, deriveAddress("trader:" + h)])
);

// Fixed anchor instead of Date.now(), which keeps every server render and every
// client hydration byte-identical. Trades count backward in time from here.
const ANCHOR_MS = Date.UTC(2026, 8, 23, 18, 0, 0);

function buildTradeLog(): Trade[] {
  const rng = mulberry32(1337);
  const trades: Trade[] = [];
  let cursor = ANCHOR_MS;

  for (let i = 0; i < 90; i++) {
    const trader = HANDLES[Math.floor(rng() * HANDLES.length)];
    const token = TOKEN_SEEDS[Math.floor(rng() * TOKEN_SEEDS.length)];
    const side: TradeSide = rng() < 0.56 ? "BUY" : "SELL";
    const priceMultiplier = 0.85 + rng() * 0.3;
    const price = token.basePrice * priceMultiplier;
    const supply = TOKEN_SUPPLY[token.symbol];
    const marketCap = price * supply;
    const sizeUsd = Math.round((150 + rng() * 9200) / 10) * 10;

    const id = `seed-${i}`;
    trades.push({
      id,
      timestamp: new Date(cursor).toISOString(),
      side,
      token: token.symbol,
      tokenAddress: TOKEN_ADDRESS[token.symbol],
      sizeUsd,
      price,
      marketCap,
      traderHandle: trader,
      traderAddress: TRADER_ADDRESS[trader],
      txHash: deriveTxHash(id),
    });

    cursor -= Math.round(8 + rng() * 210) * 1000;
  }

  return trades;
}

export const TRADE_LOG: Trade[] = buildTradeLog();

export const TOKENS: Token[] = TOKEN_SEEDS.map((seed) => {
  const latest = TRADE_LOG.find((t) => t.token === seed.symbol);
  return {
    symbol: seed.symbol,
    name: seed.name,
    address: TOKEN_ADDRESS[seed.symbol],
    price: latest?.price ?? seed.basePrice,
    marketCap: latest?.marketCap ?? seed.baseMarketCap,
    chain: "Robinhood Chain",
  };
});

export const TRADERS: Trader[] = HANDLES.map((handle) => {
  const own = TRADE_LOG.filter((t) => t.traderHandle === handle);
  const volumeUsd = own.reduce((sum, t) => sum + t.sizeUsd, 0);
  return {
    handle,
    address: TRADER_ADDRESS[handle],
    fills: own.length,
    volumeUsd,
    tracked: true as const,
  };
}).sort((a, b) => b.volumeUsd - a.volumeUsd);

function computeHoldings(handle: string): Holding[] {
  const net: Record<string, number> = {};
  for (const t of TRADE_LOG) {
    if (t.traderHandle !== handle) continue;
    const amount = t.sizeUsd / t.price;
    net[t.token] = (net[t.token] ?? 0) + (t.side === "BUY" ? amount : -amount);
  }
  return Object.entries(net)
    .filter(([, amount]) => amount > 0.5)
    .map(([symbol, amount]) => {
      const token = TOKENS.find((tk) => tk.symbol === symbol)!;
      return {
        token: symbol,
        tokenAddress: token.address,
        amount,
        price: token.price,
        valueUsd: amount * token.price,
      };
    })
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

export const HOLDINGS: Record<string, Holding[]> = Object.fromEntries(
  HANDLES.map((h) => [h, computeHoldings(h)])
);

// Client-only: called from useLiveTrades after mount. Real randomness and a
// real clock are safe here because nothing server-rendered depends on it.
export function generateLiveTrade(): Trade {
  const trader = HANDLES[Math.floor(Math.random() * HANDLES.length)];
  const token = TOKEN_SEEDS[Math.floor(Math.random() * TOKEN_SEEDS.length)];
  const side: TradeSide = Math.random() < 0.56 ? "BUY" : "SELL";
  const priceMultiplier = 0.85 + Math.random() * 0.3;
  const price = token.basePrice * priceMultiplier;
  const supply = TOKEN_SUPPLY[token.symbol];
  const marketCap = price * supply;
  const sizeUsd = Math.round((150 + Math.random() * 9200) / 10) * 10;
  const id = `live-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  return {
    id,
    timestamp: new Date().toISOString(),
    side,
    token: token.symbol,
    tokenAddress: TOKEN_ADDRESS[token.symbol],
    sizeUsd,
    price,
    marketCap,
    traderHandle: trader,
    traderAddress: TRADER_ADDRESS[trader],
    txHash: deriveTxHash(id),
  };
}
