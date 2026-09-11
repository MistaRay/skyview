"use client";

import { useState } from "react";
import type { GearItem, ProfileSummary } from "@/lib/types";
import { Card, CardTitle } from "@/components/ui";
import McText from "@/components/McText";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#ffffff",
  UNCOMMON: "#55FF55",
  RARE: "#5555FF",
  EPIC: "#AA00AA",
  LEGENDARY: "#FFAA00",
  MYTHIC: "#FF55FF",
  DIVINE: "#55FFFF",
  SPECIAL: "#FF5555",
  "VERY SPECIAL": "#FF5555",
};

const ARMOR_SLOTS = ["Helmet", "Chestplate", "Leggings", "Boots"];
const EQUIPMENT_SLOTS = ["Necklace", "Cloak", "Belt", "Gloves"];

export default function GearTab({ profile }: { profile: ProfileSummary }) {
  const gear = profile.gear;
  if (!gear) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="py-8 text-muted">
          This player&apos;s Inventory API is disabled, so gear can&apos;t be shown.
        </p>
      </Card>
    );
  }

  const hotbar = gear.inventory.slice(0, 9);
  const mainInv = gear.inventory.slice(9);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Armor</CardTitle>
          <div className="flex gap-2">
            {gear.armor.map((item, i) => (
              <Slot key={i} item={item} placeholder={ARMOR_SLOTS[i]} size="lg" />
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Equipment</CardTitle>
          <div className="flex gap-2">
            {gear.equipment.map((item, i) => (
              <Slot key={i} item={item} placeholder={EQUIPMENT_SLOTS[i]} size="lg" />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Inventory</CardTitle>
        <SlotGrid items={mainInv} />
        <div className="mt-2 border-t border-edge pt-2">
          <SlotGrid items={hotbar} />
        </div>
        <p className="mt-2 text-xs text-muted/70">Bottom row is the hotbar.</p>
      </Card>

      {gear.enderChest.some(Boolean) && (
        <Card>
          <CardTitle>Ender Chest</CardTitle>
          <SlotGrid items={gear.enderChest} />
        </Card>
      )}
    </div>
  );
}

function SlotGrid({ items }: { items: (GearItem | null)[] }) {
  return (
    <div className="grid grid-cols-9 gap-1.5" style={{ maxWidth: "34rem" }}>
      {items.map((item, i) => (
        <Slot key={i} item={item} />
      ))}
    </div>
  );
}

function Slot({
  item,
  placeholder,
  size = "md",
}: {
  item: GearItem | null;
  placeholder?: string;
  size?: "md" | "lg";
}) {
  const [hover, setHover] = useState(false);
  const px = size === "lg" ? "h-14 w-14" : "aspect-square w-full";
  const borderColor = item?.rarity ? RARITY_COLORS[item.rarity] ?? "var(--border)" : "var(--border)";

  if (!item) {
    return (
      <div
        className={`${px} flex items-center justify-center rounded-lg border border-edge bg-panel-2/60`}
        title={placeholder ? `Empty ${placeholder.toLowerCase()} slot` : undefined}
      >
        {placeholder && <span className="px-1 text-center text-[9px] leading-tight text-muted/50">{placeholder}</span>}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`${px} relative flex items-center justify-center rounded-lg border bg-panel-2 p-1`}
        style={{ borderColor: `${borderColor}66` }}
      >
        {item.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.icon}
            alt={item.name}
            className="h-full w-full object-contain [image-rendering:pixelated]"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <span
          className={`${item.icon ? "hidden" : ""} text-[10px] font-bold`}
          style={{ color: borderColor }}
        >
          {item.name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("")}
        </span>
        {item.count > 1 && (
          <span className="absolute bottom-0 right-0.5 text-xs font-bold text-white [text-shadow:1px_1px_0_#000]">
            {item.count}
          </span>
        )}
      </div>

      {hover && (
        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 w-max max-w-[22rem] -translate-x-1/2 rounded-lg border border-edge bg-[#100817] p-3 shadow-2xl shadow-black/60">
          <McText text={item.coloredName} className="block text-sm font-semibold leading-snug" />
          <div className="mt-1.5 flex flex-col">
            {item.lore.map((line, i) => (
              <McText key={i} text={line || " "} className="block min-h-[1em] text-xs leading-snug" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
