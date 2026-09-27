import type { Wallet } from "./types";

const SUB = "₀₁₂₃₄₅₆₇₈₉";

function compact(n: number, digits = 2) {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(digits) + "B";
  if (abs >= 1e6) return (n / 1e6).toFixed(digits) + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(abs >= 1e5 ? 1 : digits) + "K";
  return null;
}

/** $1.49K, $85.25M, $24, $4.37 */
export function usd(n: number) {
  const c = compact(n);
  if (c) return (n < 0 ? "-$" : "$") + c.replace("-", "");
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return (n < 0 ? "-$" : "$") + body;
}

/** +$1.44K / -$2.05 — for P/L, always signed. */
export function pnl(n: number) {
  if (Math.abs(n) < 0.005) return "$0.00";
  return (n > 0 ? "+" : "") + usd(n);
}

/** Full dollars with cents, for the big headline figures: $4,377,435 */
export function usdWhole(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** Token price with subscript zero-count for tiny values: $0.0₄328 */
export function price(n: number) {
  if (n >= 1000) return "$" + Math.round(n).toLocaleString("en-US");
  if (n >= 1) return "$" + n.toFixed(2);
  if (n >= 0.001) return "$" + n.toPrecision(3);
  // Zeros between the decimal point and the first significant digit.
  const zeros = -Math.floor(Math.log10(n)) - 1;
  const digits = Math.round(n * Math.pow(10, zeros + 3)).toString().slice(0, 3);
  const sub = String(zeros).split("").map((d) => SUB[+d]).join("");
  return `$0.0${sub}${digits}`;
}

/** Token amounts: 8.8K, 1.27M, 0.00479 */
export function amount(n: number) {
  const c = compact(n);
  if (c) return c;
  if (n >= 1) return n.toFixed(n >= 100 ? 0 : 1);
  return n.toPrecision(3);
}

export function count(n: number) {
  return compact(n, 1) ?? String(Math.round(n));
}

export function pct(fraction: number, signed = true) {
  const v = fraction * 100;
  const s = Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1);
  return (signed && v > 0 ? "+" : "") + s + "%";
}

/** 19.36.35 — the tape's clock format. */
export function clock(t: number) {
  const d = new Date(t);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}`;
}

/** 58s, 27m, 1.7h, 3d */
export function duration(ms: number) {
  const s = ms / 1000;
  if (s < 60) return Math.max(1, Math.round(s)) + "s";
  const m = s / 60;
  if (m < 60) return Math.round(m) + "m";
  const h = m / 60;
  if (h < 24) return (h < 10 ? h.toFixed(1).replace(/\.0$/, "") : Math.round(h)) + "h";
  return Math.round(h / 24) + "d";
}

export const ago = (t: number, now: number) => duration(now - t);

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Handle if named, otherwise the short address. */
export function walletLabel(w: Wallet) {
  return w.handle ?? shortAddress(w.address);
}

export function toneOf(n: number) {
  return n > 0.005 ? "text-up" : n < -0.005 ? "text-down" : "text-ink-dim";
}
