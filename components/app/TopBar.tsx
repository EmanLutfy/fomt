"use client";

import { List, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSettings, type Toggle } from "@/components/app/FomoProvider";
import { SearchBox } from "@/components/app/SearchBox";
import { Wordmark } from "@/components/app/Sidebar";
import { WINDOWS } from "@/lib/fomo/types";

const WINDOW_LABEL = { "1h": "1H", "24h": "24H", "7d": "7D", "30d": "30D", all: "All" } as const;

function WindowPills() {
  const { window: win, setWindow } = useSettings();
  return (
    <div className="hb flex items-center rounded-full border border-line-strong p-1" role="group" aria-label="Time window">
      {WINDOWS.map((w, i) => (
        <button
          key={w}
          type="button"
          onClick={() => setWindow(w)}
          aria-pressed={win === w}
          title={`${WINDOW_LABEL[w]} (key ${i + 1})`}
          className={cn(
            "rounded-full px-2.5 py-1 text-[12.5px] font-medium tabular transition-colors",
            win === w ? "bg-ink text-bg" : "text-ink-muted hover:text-ink",
          )}
        >
          {WINDOW_LABEL[w]}
        </button>
      ))}
    </div>
  );
}

const TOGGLES: { key: Toggle; label: string; hint: string }[] = [
  { key: "sound", label: "Sound", hint: "Play a tick when a fill lands (key s)" },
];

function ToggleButtons() {
  const { toggles, flip } = useSettings();
  return (
    <div className="flex items-center gap-1">
      {TOGGLES.map(({ key, label, hint }) => {
        const on = toggles[key];
        const Icon = on ? SpeakerHigh : SpeakerSlash;
        return (
          <button
            key={key}
            type="button"
            onClick={() => flip(key)}
            aria-pressed={on}
            title={hint}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
              on ? "border-line-strong bg-card-raised text-ink" : "border-transparent text-ink-dim hover:text-ink",
            )}
          >
            <Icon size={15} weight={on ? "fill" : "regular"} />
            <span className="hidden xl:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button type="button" onClick={onOpenMenu} aria-label="Open menu" className="-ml-1 p-2 text-ink-muted lg:hidden">
          <List size={22} />
        </button>
        <div className="lg:hidden">
          <Wordmark compact />
        </div>
        <SearchBox className="mx-auto w-full max-w-[560px]" />
        <div className="hidden items-center gap-2 md:flex">
          <WindowPills />
          <ToggleButtons />
        </div>
      </div>
      {/* Phones: window + toggles on their own scrollable row. */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-2.5 md:hidden">
        <WindowPills />
        <ToggleButtons />
      </div>
    </header>
  );
}
