"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const RECENT_KEY = "skyview:recent";

export function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function pushRecent(name: string) {
  const list = [name, ...getRecent().filter((n) => n.toLowerCase() !== name.toLowerCase())].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

export default function SearchBox({
  autoFocus = false,
  compact = false,
  initialValue = "",
}: {
  autoFocus?: boolean;
  compact?: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [recent, setRecent] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecent(getRecent());
  }, []);

  function go(name: string) {
    const trimmed = name.trim();
    if (!/^[A-Za-z0-9_]{1,16}$/.test(trimmed)) return;
    pushRecent(trimmed);
    setFocused(false);
    router.push(`/player/${encodeURIComponent(trimmed)}`);
  }

  const showRecent = focused && !compact && recent.length > 0 && value.length === 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className={`flex items-center gap-2 rounded-xl border border-edge bg-panel transition-colors focus-within:border-gold/60 ${
          compact ? "px-3 py-1.5" : "px-4 py-3"
        }`}
      >
        <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          autoFocus={autoFocus}
          placeholder="Enter a Minecraft username…"
          spellCheck={false}
          maxLength={16}
          className={`w-full bg-transparent outline-none placeholder:text-muted ${compact ? "text-sm" : "text-base"}`}
        />
        <button
          type="submit"
          className={`shrink-0 rounded-lg bg-gold font-semibold text-[#1a1405] transition-opacity hover:opacity-90 disabled:opacity-40 ${
            compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
          }`}
          disabled={!/^[A-Za-z0-9_]{1,16}$/.test(value.trim())}
        >
          Search
        </button>
      </form>

      {showRecent && (
        <div className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-edge bg-panel shadow-xl shadow-black/40">
          <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-muted">Recent searches</p>
          {recent.map((name) => (
            <button
              key={name}
              onMouseDown={() => go(name)}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-panel-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://mc-heads.net/avatar/${name}/20`} alt="" className="h-5 w-5 rounded" />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
