"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { data } from "@/lib/ui";

// Trade tx hashes and wallet addresses are fictional in this dataset, so a
// link to a block explorer would be a dead/fake control. Copy-to-clipboard
// is real, working behavior instead (R-26).
export function CopyableValue({
  value,
  display,
  label,
  className = "",
}: {
  value: string;
  display: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  function legacyCopy(text: string): boolean {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(el);
    return ok;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Async Clipboard API can be blocked (insecure context, permissions
      // policy, synthetic click not treated as user activation), so fall back
      // to the synchronous legacy path, which most embedders still allow.
      legacyCopy(value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className={`inline-flex items-center gap-1.5 ${data} text-inherit transition hover:text-accent ${className}`}
    >
      {display}
      {copied ? (
        <Check size={13} weight="bold" className="text-accent" />
      ) : (
        <Copy size={13} weight="bold" className="opacity-50" />
      )}
    </button>
  );
}
