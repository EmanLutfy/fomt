"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = "",
  inputClassName = "",
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <MagnifyingGlass size={15} weight="bold" className="pointer-events-none absolute left-3 text-ink-dim" />
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-9 text-sm text-ink outline-none transition placeholder:text-ink-dim hover:border-border-strong focus-visible:border-accent ${inputClassName}`}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2.5 text-ink-dim transition hover:text-ink"
        >
          <X size={15} weight="bold" />
        </button>
      )}
    </div>
  );
}
