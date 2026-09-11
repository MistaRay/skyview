"use client";

import { useState } from "react";
import type { AccessoryItem, ProfileSummary } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui";

const TIER_COLORS: Record<string, string> = {
  COMMON: "#ffffff",
  UNCOMMON: "#55FF55",
  RARE: "#5555FF",
  EPIC: "#AA00AA",
  LEGENDARY: "#FFAA00",
  MYTHIC: "#FF55FF",
  SUPREME: "#55FFFF",
  SPECIAL: "#FF5555",
  VERY_SPECIAL: "#FF5555",
};

export default function AccessoriesTab({ profile }: { profile: ProfileSummary }) {
  const acc = profile.accessories;
  if (!acc) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="py-8 text-muted">
          This player&apos;s Inventory API is disabled, so accessories can&apos;t be shown.
        </p>
      </Card>
    );
  }

  const totalLines = acc.owned.length + acc.missing.length;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <Stat label="Owned" value={acc.owned.length} color="#55FF55" />
          <Stat label="Missing upgrades" value={acc.missingUpgrades.length} color="#FFAA00" />
          <Stat label="Not owned" value={acc.missing.length} color="#FF5555" />
          <p className="text-xs text-muted">
            Counted from the accessory bag and inventory. {acc.owned.length} of {totalLines} accessory
            lines collected.
          </p>
        </div>
      </Card>

      <Section
        title={`Missing upgrades (${acc.missingUpgrades.length})`}
        empty="No missing upgrades — every accessory line you own is at max tier."
        items={acc.missingUpgrades}
      />
      <Section
        title={`Not owned (${acc.missing.length})`}
        empty="You own every accessory line. Completionist!"
        items={acc.missing}
      />
      <Section title={`Owned (${acc.owned.length})`} empty="No accessories found." items={acc.owned} />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="ml-2 text-xs uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: AccessoryItem[]; empty: string }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <AccessoryTile key={item.id} item={item} />
          ))}
        </div>
      )}
    </Card>
  );
}

function AccessoryTile({ item }: { item: AccessoryItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const color = TIER_COLORS[item.tier] ?? "#ffffff";
  return (
    <div
      className="flex items-center gap-2 rounded-lg border bg-panel-2 px-2 py-1.5"
      style={{ borderColor: `${color}55` }}
      title={`${item.name} (${item.tier.replace(/_/g, " ")})`}
    >
      {item.icon && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.icon}
          alt=""
          className="h-6 w-6 shrink-0 [image-rendering:pixelated]"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-panel text-[9px] font-bold"
          style={{ color }}
        >
          {item.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("")}
        </span>
      )}
      <span className="truncate text-xs" style={{ color }}>
        {item.name}
      </span>
    </div>
  );
}
