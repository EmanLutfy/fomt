"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Engine } from "@/lib/fomo/engine";
import { WINDOWS, type Fill, type TimeWindow } from "@/lib/fomo/types";

// Three contexts so the once-a-second status line doesn't re-render every
// table on the page: data changes when a fill lands, settings when the user
// flips something, status every second.

interface DataCtx {
  engine: Engine | null;
  /** Bumps on every new fill — use it as a memo dependency. */
  version: number;
  /** The clock time the current version was computed at. */
  now: number;
  /** Mount time: fills after this arrived live, during this visit. */
  sessionStart: number;
}

export type Toggle = "sound";

interface SettingsCtx {
  window: TimeWindow;
  setWindow: (w: TimeWindow) => void;
  toggles: Record<Toggle, boolean>;
  flip: (k: Toggle) => void;
  registerSearch: (el: HTMLInputElement | null) => void;
}

interface StatusCtx {
  head: number;
  lag: number;
  eth: number;
  viewers: number;
  session: { volume: number; fills: number; startedAt: number };
  clock: number;
}

const Data = createContext<DataCtx | null>(null);
const Settings = createContext<SettingsCtx | null>(null);
const Status = createContext<StatusCtx | null>(null);

const STORE_KEY = "fomotrenches:settings";

function readStore(): { window?: TimeWindow; toggles?: Partial<Record<Toggle, boolean>> } {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function blip(ctx: AudioContext, side: Fill["side"]) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = side === "buy" ? 880 : 520;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}

export function FomoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataCtx>({ engine: null, version: 0, now: 0, sessionStart: 0 });
  const [window_, setWindow_] = useState<TimeWindow>("24h");
  const [toggles, setToggles] = useState<Record<Toggle, boolean>>({ sound: false });
  const [status, setStatus] = useState<StatusCtx>({
    head: 0, lag: 0, eth: 0, viewers: 1, session: { volume: 0, fills: 0, startedAt: 0 }, clock: 0,
  });

  const searchEl = useRef<HTMLInputElement | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const soundOn = useRef(false);
  soundOn.current = toggles.sound;

  // Build the engine on the client only: every time on the page is relative
  // to "now", which the server and browser would disagree on.
  useEffect(() => {
    const start = Date.now();
    const engine = new Engine(start);
    setData({ engine, version: 1, now: start, sessionStart: start });
    setStatus((s) => ({
      ...s,
      head: 73_944_137,
      eth: 2_720,
      viewers: 2,
      clock: start,
      session: { volume: 0, fills: 0, startedAt: start },
    }));

    const saved = readStore();
    if (saved.window && WINDOWS.includes(saved.window)) setWindow_(saved.window);

    // Live feed: a new fill every 1.5–6s.
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(() => {
        const t = Date.now();
        const fill = engine.step(t);
        setData((d) => ({ ...d, version: d.version + 1, now: t }));
        setStatus((s) => ({
          ...s,
          session: { ...s.session, volume: s.session.volume + fill.sizeUsd, fills: s.session.fills + 1 },
        }));
        if (soundOn.current && audio.current) blip(audio.current, fill.side);
        next();
      }, 1500 + Math.random() * 4500);
    };
    next();

    // Status line: block head, lag, eth, viewers.
    const status = setInterval(() => {
      setStatus((s) => ({
        ...s,
        clock: Date.now(),
        head: s.head + 3 + Math.floor(Math.random() * 3),
        lag: Math.random() < 0.85 ? 0 : 1 + Math.floor(Math.random() * 3),
        eth: Math.max(1000, s.eth * (1 + (Math.random() - 0.5) * 0.0008)),
        viewers: Math.random() < 0.97 ? s.viewers : Math.max(1, s.viewers + (Math.random() < 0.5 ? -1 : 1)),
      }));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(status);
    };
  }, []);

  const persist = useCallback((next: { window?: TimeWindow; toggles?: Record<Toggle, boolean> }) => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), ...next }));
    } catch {}
  }, []);

  const setWindow = useCallback(
    (w: TimeWindow) => {
      setWindow_(w);
      persist({ window: w });
    },
    [persist],
  );

  const flip = useCallback(
    (k: Toggle) => {
      setToggles((t) => {
        const next = { ...t, [k]: !t[k] };
        if (k === "sound" && next.sound && !audio.current) {
          try {
            audio.current = new AudioContext();
          } catch {}
        }
        persist({ toggles: next });
        return next;
      });
    },
    [persist],
  );

  const registerSearch = useCallback((el: HTMLInputElement | null) => {
    searchEl.current = el;
  }, []);

  // Keyboard: 1–5 time window, s sound, / search, esc leaves search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) {
        if (e.key === "Escape") target.blur();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 5) setWindow(WINDOWS[n - 1]);
      else if (e.key === "s") flip("sound");
      else if (e.key === "/") {
        e.preventDefault();
        searchEl.current?.focus();
      } else return;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, setWindow]);

  const settings = useMemo<SettingsCtx>(
    () => ({ window: window_, setWindow, toggles, flip, registerSearch }),
    [window_, setWindow, toggles, flip, registerSearch],
  );

  return (
    <Data.Provider value={data}>
      <Settings.Provider value={settings}>
        <Status.Provider value={status}>{children}</Status.Provider>
      </Settings.Provider>
    </Data.Provider>
  );
}

function need<T>(v: T | null, name: string): T {
  if (!v) throw new Error(`${name} must be used inside <FomoProvider>`);
  return v;
}

export const useFomoData = () => need(useContext(Data), "useFomoData");
export const useSettings = () => need(useContext(Settings), "useSettings");
export const useStatus = () => need(useContext(Status), "useStatus");

/**
 * Memoised derivation over the engine for the current window. Returns null
 * until the engine has been built on the client.
 */
export function useDerived<T>(
  fn: (engine: Engine, win: TimeWindow, now: number) => T,
  extraDeps: unknown[] = [],
): T | null {
  const { engine, version, now } = useFomoData();
  const { window: win } = useSettings();
  return useMemo(
    () => (engine ? fn(engine, win, now) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, version, win, ...extraDeps],
  );
}

/** A clock that ticks every `ms`, for "3m ago" labels. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
