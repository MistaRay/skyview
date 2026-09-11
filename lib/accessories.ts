// Accessory collection tracking: what the player owns, which upgrades they're
// missing, and which accessories they don't have at all.
//
// Sources:
// - Owned: decoded talisman bag + player inventory
// - Catalog: Hypixel items resource (category ACCESSORY)
// - Upgrade chains + unobtainable filter: NotEnoughUpdates repo constants

import { decodeItems } from "skyhelper-networth/helper/decode";
import type { AccessoriesInfo, AccessoryItem } from "./types";

interface Catalog {
  items: Map<string, AccessoryItem>;
  chains: string[][]; // each chain is lowest -> highest tier
  chainOf: Map<string, { chain: string[]; index: number }>;
  ignored: Set<string>;
}

let catalogCache: { catalog: Catalog; fetched: number } | null = null;
const CATALOG_TTL = 24 * 60 * 60 * 1000;

function skinToIcon(skin: { value?: string } | undefined): string | null {
  if (!skin?.value) return null;
  try {
    const decoded = JSON.parse(Buffer.from(skin.value, "base64").toString("utf8"));
    const hash = (decoded?.textures?.SKIN?.url as string | undefined)?.split("/").pop();
    return hash ? `https://mc-heads.net/head/${hash}` : null;
  } catch {
    return null;
  }
}

async function getCatalog(): Promise<Catalog> {
  if (catalogCache && Date.now() - catalogCache.fetched < CATALOG_TTL) {
    return catalogCache.catalog;
  }

  const [itemsRes, miscRes] = await Promise.all([
    fetch("https://api.hypixel.net/v2/resources/skyblock/items", { signal: AbortSignal.timeout(20000) }),
    fetch("https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/master/constants/misc.json", {
      signal: AbortSignal.timeout(20000),
    }),
  ]);
  if (!itemsRes.ok || !miscRes.ok) throw new Error("Failed to fetch accessory catalog");
  const itemsData = await itemsRes.json();
  const miscData = await miscRes.json();

  const items = new Map<string, AccessoryItem>();
  for (const item of itemsData.items ?? []) {
    if (item.category !== "ACCESSORY" || !item.id) continue;
    items.set(item.id, {
      id: item.id,
      name: item.name ?? item.id,
      tier: item.tier ?? "COMMON",
      icon: skinToIcon(item.skin),
    });
  }

  const upgrades: Record<string, string[]> = miscData.talisman_upgrades ?? {};
  const isUpgradeOfSomething = new Set(Object.values(upgrades).flat());
  const chains: string[][] = [];
  const chainOf = new Map<string, { chain: string[]; index: number }>();
  for (const [base, ups] of Object.entries(upgrades)) {
    if (isUpgradeOfSomething.has(base)) continue; // not a chain root
    const chain = [base, ...ups];
    chains.push(chain);
    chain.forEach((id, index) => chainOf.set(id, { chain, index }));
  }

  const catalog: Catalog = {
    items,
    chains,
    chainOf,
    ignored: new Set(miscData.ignored_talisman ?? []),
  };
  catalogCache = { catalog, fetched: Date.now() };
  return catalog;
}

/** Compute owned/missing accessories for a profile member. Returns null if the inventory API is off. */
export async function computeAccessories(member: any): Promise<AccessoriesInfo | null> {
  const inv = member?.inventory;
  if (!inv?.inv_contents?.data && !inv?.bag_contents?.talisman_bag?.data) return null;

  const [catalog, decoded] = await Promise.all([
    getCatalog(),
    decodeItems([inv?.bag_contents?.talisman_bag?.data ?? "", inv?.inv_contents?.data ?? ""]),
  ]);

  const ownedIds = new Set<string>();
  for (const item of decoded.flat()) {
    const id = item?.tag?.ExtraAttributes?.id;
    if (id && catalog.items.has(id)) ownedIds.add(id);
  }

  const owned: AccessoryItem[] = [...ownedIds].map((id) => catalog.items.get(id)!);

  // Chains where the player owns at least one tier: everything above the
  // highest owned tier is a missing upgrade; lower tiers are redundant.
  const missingUpgrades: AccessoryItem[] = [];
  const inHandledChain = new Set<string>();
  for (const chain of catalog.chains) {
    let maxOwned = -1;
    for (let i = 0; i < chain.length; i++) if (ownedIds.has(chain[i])) maxOwned = i;
    if (maxOwned === -1) continue;
    chain.forEach((id) => inHandledChain.add(id));
    for (let i = maxOwned + 1; i < chain.length; i++) {
      const item = catalog.items.get(chain[i]);
      if (item && !catalog.ignored.has(chain[i])) missingUpgrades.push(item);
    }
  }

  // Everything else the player doesn't own. For fully-unowned chains only
  // list the base tier to avoid triple-listing the same accessory line.
  const missing: AccessoryItem[] = [];
  for (const [id, item] of catalog.items) {
    if (ownedIds.has(id) || inHandledChain.has(id) || catalog.ignored.has(id)) continue;
    const chainInfo = catalog.chainOf.get(id);
    if (chainInfo && chainInfo.index > 0) continue; // higher tier of an unowned chain
    missing.push(item);
  }

  const tierRank: Record<string, number> = {
    MYTHIC: 6, SUPREME: 6, LEGENDARY: 5, EPIC: 4, RARE: 3, UNCOMMON: 2, COMMON: 1, SPECIAL: 0,
  };
  const byTierThenName = (a: AccessoryItem, b: AccessoryItem) =>
    (tierRank[b.tier] ?? 0) - (tierRank[a.tier] ?? 0) || a.name.localeCompare(b.name);
  owned.sort(byTierThenName);
  missingUpgrades.sort(byTierThenName);
  missing.sort(byTierThenName);

  return { owned, missingUpgrades, missing };
}
