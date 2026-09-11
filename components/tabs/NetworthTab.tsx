"use client";

import { useState } from "react";
import type { ProfileSummary } from "@/lib/types";
import { formatCoins, formatFull } from "@/lib/format";
import { NETWORTH_CATEGORY_NAMES } from "@/lib/constants";
import { Card, StatPill } from "@/components/ui";

export default function NetworthTab({ profile }: { profile: ProfileSummary }) {
  const nw = profile.networth;
  const [open, setOpen] = useState<string | null>(null);

  if (!nw) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="py-8 text-muted">{profile.networthError ?? "Networth is not available for this profile."}</p>
      </Card>
    );
  }

  const maxTotal = Math.max(...nw.categories.map((c) => c.total), 1);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total networth</p>
            <p className="text-4xl font-bold text-gold" title={formatFull(nw.total)}>
              {formatCoins(nw.total)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatPill label="Unsoulbound" value={formatCoins(nw.unsoulbound)} />
            <StatPill label="Purse" value={formatCoins(nw.purse)} />
            <StatPill label="Bank" value={profile.bank === null ? "API off" : formatCoins(nw.bank)} />
            <StatPill label="Personal Bank" value={formatCoins(nw.personalBank)} />
          </div>
        </div>
        {nw.noInventory && (
          <p className="mt-3 rounded-lg bg-panel-2 px-3 py-2 text-xs text-amber-400">
            ⚠ This player&apos;s Inventory API is disabled, so item values are excluded from the total.
          </p>
        )}
        <p className="mt-3 text-xs text-muted/70">
          Prices via SkyHelper — actual sale values may differ.
        </p>
      </Card>

      <div className="flex flex-col gap-2">
        {nw.categories.map((c) => {
          const isOpen = open === c.id;
          return (
            <Card key={c.id} className="!p-0 overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : c.id)}
                className="relative flex w-full items-center justify-between px-4 py-3 text-left hover:bg-panel-2/50"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-gold/[0.06]"
                  style={{ width: `${(c.total / maxTotal) * 100}%` }}
                />
                <span className="relative font-medium">
                  {NETWORTH_CATEGORY_NAMES[c.id] ?? c.name}
                  {c.items.length > 0 && (
                    <span className="ml-2 text-xs text-muted">{isOpen ? "▾" : "▸"}</span>
                  )}
                </span>
                <span className="relative font-bold text-gold" title={formatFull(c.total)}>
                  {formatCoins(c.total)}
                </span>
              </button>
              {isOpen && c.items.length > 0 && (
                <div className="border-t border-edge px-4 py-2">
                  {c.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-1.5 text-sm">
                      <span className="truncate">
                        {item.name}
                        {item.count > 1 && <span className="ml-1.5 text-xs text-muted">×{item.count}</span>}
                        {item.soulbound && (
                          <span className="ml-1.5 text-[10px] uppercase text-muted" title="Soulbound">
                            SB
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-medium text-muted" title={formatFull(item.price)}>
                        {formatCoins(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
