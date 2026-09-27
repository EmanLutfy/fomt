// Demo data engine. Stands in for the fomotrenches backend until its feed is
// wired up: a roster of 1000 tracked wallets (738 named), a set of tokens
// with random-walk prices, and a tape of fills that updates positions as it
// goes — so closed trades, open bags and every P/L figure are derived from the
// fills exactly the way the backend describes ("p/l measured from this tape's
// own fills"), not invented separately.
//
// All handles, names and tickers here are fictional.

import { hex, int, logNormal, mulberry32, pick, weighted, type Rng } from "./random";
import type { ClosedTrade, Fill, OpenBag, Source, Token, Wallet } from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const PRICE_STEP = 10 * MINUTE;
export const TAPE_SPAN = 30 * DAY;

export const ROSTER_SIZE = 1000;
export const ROSTER_NAMED = 738;

// ---------------------------------------------------------------- roster ---

const ADJ = [
  "happy", "dumb", "poor", "lazy", "based", "quiet", "lucky", "salty", "sleepy", "rich",
  "itchy", "cosmic", "frozen", "golden", "silent", "rapid", "tiny", "grumpy", "velvet", "neon",
  "paper", "diamond", "wild", "odd", "early", "humble", "spicy", "degen", "night", "iron",
  "lunar", "solar", "pixel", "turbo", "mellow", "brave", "crispy", "fuzzy", "hollow", "jolly",
];
const NOUN = [
  "swan", "goat", "duck", "hog", "penguin", "crayon", "soldier", "coach", "trench", "ape",
  "frog", "whale", "otter", "falcon", "monk", "wizard", "farmer", "pilot", "ghost", "panda",
  "tiger", "raven", "fox", "bull", "bear", "llama", "shark", "gecko", "baron", "scout",
  "owl", "yak", "mole", "viper", "sage", "badger", "comet", "lynx", "moth", "orca",
];
const SUFFIX = ["", "", "", "", "xbt", "_eth", "trades", "onchain", "_", "13", "88", "21", "404", "fi", "cap", "7"];
const SOURCES: Source[] = ["fomoapi", "fomoapi-blog", "fomopulse", "fomoradar", "rhtrenches"];

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function makeHandle(r: Rng, taken: Set<string>) {
  for (;;) {
    const a = pick(r, ADJ);
    const n = pick(r, NOUN);
    const style = r();
    let h: string;
    if (style < 0.3) h = cap(a) + cap(n);
    else if (style < 0.5) h = a + n;
    else if (style < 0.62) h = "0x" + a;
    else if (style < 0.75) h = n + pick(r, ["", "_", ""]) + pick(r, ["01", "33", "69", "2001", "x", "sol"]);
    else h = a + "_" + n;
    h += pick(r, SUFFIX);
    if (!taken.has(h.toLowerCase()) && h.length <= 18) {
      taken.add(h.toLowerCase());
      return { handle: h, name: r() < 0.55 ? cap(n) : cap(a) + " " + cap(n) };
    }
  }
}

function buildRoster(r: Rng): Wallet[] {
  const taken = new Set<string>();
  const named: Wallet[] = [];
  for (let i = 0; i < ROSTER_NAMED; i++) {
    const { handle, name } = makeHandle(r, taken);
    const checkRoll = r();
    const sources = SOURCES.filter(() => r() < 0.55);
    named.push({
      address: "0x" + hex(r, 40),
      handle,
      name: r() < 0.08 ? null : name,
      aka: r() < 0.03 ? handle.replace(/\d+$/, "") + "Alt" : undefined,
      followers: Math.round(Math.min(760_000, logNormal(r, 14_000, 1.35))),
      check: checkRoll < 0.86 ? "high" : checkRoll < 0.97 ? "medium" : "low",
      sources: sources.length ? sources : [pick(r, SOURCES)],
      fomoPnl: r() < 0.15 ? null : Math.round(logNormal(r, 180_000, 1.6) * (r() < 0.12 ? -0.2 : 1)),
      vol24h: r() < 0.5 ? null : Math.round(logNormal(r, 900, 2)),
    });
  }
  named.sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0));

  const anon: Wallet[] = [];
  for (let i = named.length; i < ROSTER_SIZE; i++) {
    anon.push({
      address: "0x" + hex(r, 40),
      handle: null,
      name: null,
      followers: null,
      check: null,
      sources: [],
      fomoPnl: null,
      vol24h: Math.round(logNormal(r, 4_000, 1.4)),
    });
  }
  anon.sort((a, b) => (b.vol24h ?? 0) - (a.vol24h ?? 0));
  return [...named, ...anon];
}

// ---------------------------------------------------------------- tokens ---

const TOKEN_NAMES: [string, string][] = [
  ["GLINT", "Glint"], ["PUDDLE", "Puddle"], ["ORBIX", "Orbix.so"], ["MOOK", "Mookie"],
  ["TRNCH", "Trench Coin"], ["HOGG", "Hog Wild"], ["SWANY", "Swanny"], ["DUCKY", "Duck Army"],
  ["FROGO", "Frogo"], ["NEONX", "Neon X"], ["PAPR", "Paper Hands"], ["DMND", "Diamond Hands"],
  ["LUNR", "Lunar"], ["SOLR", "Solar Flare"], ["PIXL", "Pixel Pals"], ["TURBO", "Turbo Cat"],
  ["MELLO", "Mello"], ["BRAV", "Brave Frog"], ["QUIX", "Quixote"], ["ZEPH", "Zephyr"],
  ["KOBO", "Kobo"], ["RUMI", "Rumi"], ["FABL", "Fable"], ["NOVI", "Novi"],
  ["GRIT", "Grit"], ["OPAL", "Opal"], ["VANTA", "Vanta"], ["BLIP", "Blip"],
  ["CRUMB", "Crumb"], ["SPRK", "Spark"], ["WAFL", "Waffle"], ["TOFU", "Tofu"],
  ["MOSS", "Moss"], ["JUNO", "Juno"], ["ECHOE", "Echoe"], ["DRIFT", "Drift"],
  ["PLUM", "Plum"], ["YETI", "Yeti"], ["KITE", "Kite"], ["BOLTZ", "Boltz"],
  ["HAZE", "Haze"], ["RIFT", "Rift"],
];
// The last few are brand new pools (Fresh Pools).
const FRESH_COUNT = 9;

interface PriceSeries {
  base: number;
  values: number[];
  /** log-price the walk is pulled back toward */
  anchor: number;
  vol: number;
  pull: number;
  rng: Rng;
}

// ---------------------------------------------------------------- engine ---

interface Position {
  amount: number;
  cost: number;
  openedAt: number;
  fills: number;
  paidIn: number;
  gotOut: number;
}

export class Engine {
  readonly wallets: Wallet[];
  readonly byAddress = new Map<string, Wallet>();
  readonly byHandle = new Map<string, Wallet>();
  readonly tokens: Token[];
  readonly bySymbol = new Map<string, Token>();
  readonly tapeStart: number;

  readonly fills: Fill[] = [];
  readonly closed: ClosedTrade[] = [];
  /** Realized P/L of each (non pre-tape) sell, by fill id. */
  readonly realized = new Map<string, number>();

  private positions = new Map<string, Position>();
  private held = new Map<string, Set<string>>();
  private prices = new Map<string, PriceSeries>();
  private active: Wallet[] = [];
  private activeWeights: number[] = [];
  private sizeMedian = new Map<string, number>();
  private popularity: number[] = [];
  private recent: string[] = [];
  private seq = 0;
  private r: Rng;

  constructor(now: number, seed = 4663) {
    this.r = mulberry32(seed);
    const r = this.r;
    this.tapeStart = now - TAPE_SPAN;

    this.wallets = buildRoster(r);
    for (const w of this.wallets) {
      this.byAddress.set(w.address, w);
      if (w.handle) this.byHandle.set(w.handle.toLowerCase(), w);
    }

    this.tokens = TOKEN_NAMES.map(([symbol, name], i) => {
      const fresh = i >= TOKEN_NAMES.length - FRESH_COUNT;
      const supply = pick(r, [1e9, 1e9, 1e9, 1e8, 1e10]);
      const createdAt = fresh
        ? now - Math.pow(r(), 1.6) * 3 * DAY - 20 * MINUTE
        : this.tapeStart - (5 + r() * 90) * DAY;
      const mcap0 = fresh ? logNormal(r, 40_000, 0.8) : logNormal(r, 900_000, 1.7);
      const token: Token = {
        symbol,
        name,
        address: "0x" + hex(r, 40),
        supply,
        createdAt,
        liquidity: mcap0 * (0.08 + r() * 0.14),
      };
      // Old tokens are priced from the start of the tape; new pools from
      // their launch. The walk is mean-reverting so market caps swing but
      // stay plausible instead of drifting to zero or the moon.
      this.prices.set(symbol, {
        base: (fresh ? createdAt : this.tapeStart) - PRICE_STEP,
        values: [mcap0 / supply],
        anchor: Math.log(mcap0 / supply) + (fresh ? 0.8 : 0),
        vol: fresh ? 0.045 : 0.03,
        pull: fresh ? 0.004 : 0.0015,
        rng: mulberry32(seed * 31 + i),
      });
      return token;
    });
    for (const t of this.tokens) this.bySymbol.set(t.symbol, t);
    this.popularity = this.tokens.map(() => logNormal(r, 1, 0.9));

    // Active traders: most named, some anon, heavy-tailed activity.
    const namedPool = this.wallets.filter((w) => w.handle);
    const anonPool = this.wallets.filter((w) => !w.handle);
    const chosen = new Set<Wallet>();
    while (chosen.size < 115) chosen.add(pick(r, namedPool.slice(0, 400)));
    while (chosen.size < 170) chosen.add(pick(r, anonPool));
    this.active = [...chosen];
    this.activeWeights = this.active.map(() => logNormal(r, 1, 1));
    for (const w of this.active) {
      this.sizeMedian.set(w.address, Math.min(5_000, Math.max(20, logNormal(r, 260, 1))));
    }

    // History: busier toward "now" — ~5 fills a minute over the last two
    // hours (the pace the backend tape runs at), thinning out further back.
    const times: number[] = [];
    for (let i = 0; i < 600; i++) times.push(now - 4_000 - r() * (2 * HOUR - 4_000));
    for (let i = 0; i < 1100; i++) times.push(now - 2 * HOUR - r() * 22 * HOUR);
    for (let i = 0; i < 3500; i++) times.push(now - DAY - Math.pow(r(), 1.5) * (TAPE_SPAN - DAY));
    times.sort((a, b) => a - b);
    for (const t of times) this.step(t);
  }

  // ---- prices ----

  priceAt(symbol: string, t: number) {
    const s = this.prices.get(symbol)!;
    const x = Math.max(0, (t - s.base) / PRICE_STEP);
    const i = Math.floor(x);
    while (s.values.length < i + 2) {
      const last = Math.log(s.values[s.values.length - 1]);
      const z = (s.rng() - 0.5) * 2 * Math.sqrt(3);
      s.values.push(Math.exp(last + s.pull * (s.anchor - last) + s.vol * z));
    }
    const f = x - i;
    return s.values[i] * (1 - f) + s.values[i + 1] * f;
  }

  mcapAt(symbol: string, t: number) {
    return this.priceAt(symbol, t) * this.bySymbol.get(symbol)!.supply;
  }

  // ---- positions ----

  openBags(address: string): OpenBag[] {
    const syms = this.held.get(address);
    if (!syms) return [];
    return [...syms].map((token) => {
      const p = this.positions.get(address + "|" + token)!;
      return { wallet: address, token, amount: p.amount, cost: p.cost, openedAt: p.openedAt, fills: p.fills };
    });
  }

  /** Every open bag across the roster (for P/L on open bags). */
  allOpenBags(): OpenBag[] {
    const out: OpenBag[] = [];
    for (const address of this.held.keys()) out.push(...this.openBags(address));
    return out;
  }

  // ---- the tape ----

  /** Produce the next fill at time `t` and apply it to positions. */
  step(t: number): Fill {
    const r = this.r;
    const wallet = this.active[weighted(r, this.activeWeights)];
    const address = wallet.address;
    const held = this.held.get(address) ?? new Set<string>();
    const live = this.tokens.filter((tk) => tk.createdAt <= t);

    let side: Fill["side"] = "buy";
    let preTape = false;
    let symbol: string;
    let sizeUsd: number;
    let price: number;
    let amount: number;

    if (r() < 0.07 && live.length) {
      // Selling a bag the tape never saw being bought.
      side = "sell";
      preTape = true;
      symbol = pick(r, live).symbol;
      price = this.priceAt(symbol, t) * (1 + (r() - 0.5) * 0.01);
      sizeUsd = Math.max(2, logNormal(r, 420, 1.3));
      amount = sizeUsd / price;
    } else if (held.size && r() < 0.44) {
      side = "sell";
      symbol = pick(r, [...held]);
      const key = address + "|" + symbol;
      const pos = this.positions.get(key)!;
      const portion = r() < 0.55 ? 1 : 0.3 + r() * 0.4;
      price = this.priceAt(symbol, t) * (1 + (r() - 0.5) * 0.01);
      amount = pos.amount * portion;
      sizeUsd = amount * price;
      const costOut = pos.cost * portion;
      pos.amount -= amount;
      pos.cost -= costOut;
      pos.fills += 1;
      pos.gotOut += sizeUsd;
      const id = this.nextId();
      this.realized.set(id, sizeUsd - costOut);
      if (portion === 1) {
        this.positions.delete(key);
        held.delete(symbol);
        const made = pos.gotOut - pos.paidIn;
        this.closed.push({
          id: "c" + id,
          wallet: address,
          token: symbol,
          openedAt: pos.openedAt,
          closedAt: t,
          paidIn: pos.paidIn,
          gotOut: pos.gotOut,
          made,
          ret: made / pos.paidIn,
          fills: pos.fills,
        });
      }
      return this.push({ id, t, side, token: symbol, sizeUsd, price, amount, wallet: address, preTape });
    } else {
      // Buy — sometimes piling into whatever was just bought (so "who
      // followed who" has real chains to find).
      const pool = live.length ? live : this.tokens;
      if (this.recent.length && r() < 0.38) symbol = pick(r, this.recent);
      else {
        const weights = pool.map((tk) => this.popularity[this.tokens.indexOf(tk)]);
        symbol = pool[weighted(r, weights)].symbol;
      }
      price = this.priceAt(symbol, t) * (1 + (r() - 0.5) * 0.01);
      // Nobody buys more than ~1.5% of a token's market cap in one fill.
      const mcapNow = price * this.bySymbol.get(symbol)!.supply;
      sizeUsd = Math.min(60_000, mcapNow * 0.015, Math.max(3, logNormal(r, this.sizeMedian.get(address) ?? 200, 1.05)));
      amount = sizeUsd / price;
      const key = address + "|" + symbol;
      const pos = this.positions.get(key);
      if (pos) {
        pos.amount += amount;
        pos.cost += sizeUsd;
        pos.paidIn += sizeUsd;
        pos.fills += 1;
      } else {
        this.positions.set(key, { amount, cost: sizeUsd, openedAt: t, fills: 1, paidIn: sizeUsd, gotOut: 0 });
        held.add(symbol);
        this.held.set(address, held);
      }
      this.recent.push(symbol);
      if (this.recent.length > 14) this.recent.shift();
    }

    return this.push({ id: this.nextId(), t, side, token: symbol, sizeUsd, price, amount, wallet: address, preTape });
  }

  private nextId() {
    return (++this.seq).toString(36);
  }

  private push(f: Omit<Fill, "mcap" | "tx">): Fill {
    const fill: Fill = {
      ...f,
      mcap: f.price * this.bySymbol.get(f.token)!.supply,
      tx: "0x" + hex(this.r, 64),
    };
    this.fills.push(fill);
    return fill;
  }

  /** Small random helpers for the live status line. */
  jitter(min: number, max: number) {
    return int(this.r, min, max);
  }
}
