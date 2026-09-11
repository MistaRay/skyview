// Decodes worn armor, equipment, and inventories from raw profile member data.

import { decodeItems } from "skyhelper-networth/helper/decode";
import { vanillaIconUrl } from "./vanilla-icons";
import type { GearInfo, GearItem } from "./types";

const RARITIES = [
  "VERY SPECIAL",
  "SPECIAL",
  "DIVINE",
  "MYTHIC",
  "LEGENDARY",
  "EPIC",
  "RARE",
  "UNCOMMON",
  "COMMON",
] as const;

function stripCodes(s: string): string {
  return s.replace(/§./g, "");
}

/** Extract the SkyBlock rarity from the last matching lore line. */
function rarityFromLore(lore: string[]): string | null {
  for (let i = lore.length - 1; i >= 0; i--) {
    const line = stripCodes(lore[i]);
    for (const rarity of RARITIES) {
      if (line.includes(rarity)) return rarity;
    }
  }
  return null;
}

/** Best-effort icon URL for an item. */
function iconUrl(raw: any): string | null {
  // Player-head items carry their texture; render via the texture hash.
  const textureB64 = raw?.tag?.SkullOwner?.Properties?.textures?.[0]?.Value;
  if (textureB64) {
    try {
      const decoded = JSON.parse(Buffer.from(textureB64, "base64").toString("utf8"));
      const url: string | undefined = decoded?.textures?.SKIN?.url;
      const hash = url?.split("/").pop();
      if (hash) return `https://mc-heads.net/head/${hash}`;
    } catch {
      // fall through to vanilla texture
    }
  }
  // Otherwise use the vanilla 1.8 item texture for the numeric ID.
  return vanillaIconUrl(typeof raw?.id === "number" ? raw.id : undefined);
}

function toGearItem(raw: any): GearItem | null {
  if (!raw || !raw.tag) return null; // empty slot
  const display = raw.tag.display ?? {};
  const rawName: string = display.Name ?? "Unknown Item";
  const lore: string[] = Array.isArray(display.Lore) ? display.Lore.map(String) : [];
  const skyblockId: string | null = raw.tag.ExtraAttributes?.id ?? null;
  return {
    name: stripCodes(rawName),
    coloredName: rawName,
    lore,
    count: raw.Count ?? 1,
    skyblockId,
    rarity: rarityFromLore(lore),
    icon: iconUrl(raw),
  };
}

/**
 * Decode the member's worn armor, equipment, inventory, and ender chest.
 * Returns null when the Inventory API is disabled for this member.
 */
export async function computeGear(member: any): Promise<GearInfo | null> {
  const inv = member?.inventory;
  if (!inv?.inv_contents?.data && !inv?.inv_armor?.data) return null;

  const [armor, equipment, inventory, enderChest] = await decodeItems([
    inv?.inv_armor?.data ?? "",
    inv?.equipment_contents?.data ?? "",
    inv?.inv_contents?.data ?? "",
    inv?.ender_chest_contents?.data ?? "",
  ]);

  return {
    // NBT armor order is boots, leggings, chestplate, helmet — show helmet first.
    armor: armor.map(toGearItem).reverse(),
    equipment: equipment.map(toGearItem),
    inventory: inventory.map(toGearItem),
    enderChest: enderChest.map(toGearItem),
  };
}
