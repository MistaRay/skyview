// Converts raw Hypixel profile member data into computed, display-ready stats.

import {
  DUNGEON_CLASSES,
  DUNGEON_XP_TABLE,
  SKILLS,
  SLAYER_NAMES,
  SLAYER_XP_THRESHOLDS,
} from "./constants";
import type {
  DungeonsInfo,
  NetworthInfo,
  PetInfo,
  SkillInfo,
  SlayerInfo,
} from "./types";

/** Compute level info from total XP and a per-level XP table. */
function levelFromXp(xp: number, table: number[], maxLevel: number) {
  let level = 0;
  let remaining = xp;
  for (let i = 0; i < Math.min(table.length, maxLevel); i++) {
    if (remaining >= table[i]) {
      remaining -= table[i];
      level++;
    } else {
      break;
    }
  }
  const maxed = level >= maxLevel;
  const xpForNext = maxed ? null : table[level];
  const progress = maxed || !xpForNext ? 0 : remaining / xpForNext;
  return {
    levelInt: level,
    level: Math.min(level + progress, maxLevel),
    xpIntoLevel: maxed ? 0 : remaining,
    xpForNext,
  };
}

export function computeSkills(member: any): { skills: SkillInfo[]; skillAverage: number } {
  const experience = member?.player_data?.experience ?? {};
  // Farming's level cap can be raised from 50 to 60 via Anita's shop.
  const farmingCap = 50 + (member?.jacobs_contest?.perks?.farming_level_cap ?? 0);
  // Taming levels 51-60 are unlocked one at a time by sacrificing max-level pets.
  const tamingCap = 50 + (member?.pets_data?.pet_care?.pet_types_sacrificed?.length ?? 0);

  const skills: SkillInfo[] = SKILLS.map((def) => {
    const xp = Math.floor(experience[def.apiKey] ?? 0);
    const maxLevel =
      def.id === "farming" ? Math.min(farmingCap, 60) :
      def.id === "taming" ? Math.min(tamingCap, 60) :
      def.maxLevel;
    const lvl = levelFromXp(xp, def.table, maxLevel);
    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      xp,
      level: lvl.level,
      levelInt: lvl.levelInt,
      maxLevel,
      xpIntoLevel: lvl.xpIntoLevel,
      xpForNext: lvl.xpForNext,
      inAverage: def.inAverage,
    };
  });

  const avgSkills = skills.filter((s) => s.inAverage);
  const skillAverage =
    avgSkills.length > 0
      ? avgSkills.reduce((sum, s) => sum + s.level, 0) / avgSkills.length
      : 0;

  return { skills, skillAverage };
}

export function computeSlayers(member: any): SlayerInfo[] {
  const bosses = member?.slayer?.slayer_bosses ?? {};
  return Object.keys(SLAYER_XP_THRESHOLDS).map((id) => {
    const data = bosses[id] ?? {};
    const xp = data.xp ?? 0;
    const thresholds = SLAYER_XP_THRESHOLDS[id];
    let level = 0;
    for (const t of thresholds) if (xp >= t) level++;
    const kills: number[] = [];
    for (let tier = 0; tier < 5; tier++) {
      const k = data[`boss_kills_tier_${tier}`];
      if (typeof k === "number") kills[tier] = k;
    }
    return {
      id,
      name: SLAYER_NAMES[id],
      xp,
      level,
      maxLevel: thresholds.length,
      xpForNext: level >= thresholds.length ? null : thresholds[level],
      kills,
    };
  });
}

export function computeDungeons(member: any): DungeonsInfo | null {
  const dungeons = member?.dungeons;
  const cataXp = dungeons?.dungeon_types?.catacombs?.experience;
  if (!dungeons || cataXp === undefined) return null;

  const cata = levelFromXp(cataXp ?? 0, DUNGEON_XP_TABLE, 50);
  const selectedClass = dungeons.selected_dungeon_class ?? null;

  const classes = DUNGEON_CLASSES.map((id) => {
    const xp = dungeons.player_classes?.[id]?.experience ?? 0;
    const lvl = levelFromXp(xp, DUNGEON_XP_TABLE, 50);
    return { id, xp, level: lvl.level, levelInt: lvl.levelInt, selected: id === selectedClass };
  });

  const classAverage = classes.reduce((sum, c) => sum + c.level, 0) / classes.length;

  const toCompletions = (obj: any): Record<string, number> => {
    const out: Record<string, number> = {};
    if (obj) {
      for (const [floor, count] of Object.entries(obj)) {
        if (floor !== "total" && typeof count === "number") out[floor] = Math.floor(count);
      }
    }
    return out;
  };

  return {
    catacombs: {
      xp: cataXp ?? 0,
      level: cata.level,
      levelInt: cata.levelInt,
      xpIntoLevel: cata.xpIntoLevel,
      xpForNext: cata.xpForNext,
    },
    classAverage,
    classes,
    completions: toCompletions(dungeons.dungeon_types?.catacombs?.tier_completions),
    masterCompletions: toCompletions(dungeons.dungeon_types?.master_catacombs?.tier_completions),
    secrets: null,
  };
}

export function getSkyblockLevel(member: any): number {
  return (member?.leveling?.experience ?? 0) / 100;
}

export function getPurse(member: any): number {
  return member?.currencies?.coin_purse ?? member?.coin_purse ?? 0;
}

export function getFairySouls(member: any): number {
  return member?.fairy_soul?.total_collected ?? 0;
}

const MAX_ITEMS_PER_CATEGORY = 25;

/** Trim the huge skyhelper-networth result down to what the UI needs. */
export function summarizeNetworth(raw: any): { networth: NetworthInfo; pets: PetInfo[] } {
  const categories = Object.entries(raw.types ?? {})
    .map(([id, cat]: [string, any]) => ({
      id,
      name: id,
      total: cat?.total ?? 0,
      items: (cat?.items ?? [])
        .slice(0, MAX_ITEMS_PER_CATEGORY)
        .map((it: any) => ({
          name: String(it.name ?? it.loreName ?? "Unknown"),
          count: it.count ?? 1,
          price: it.price ?? 0,
          soulbound: !!it.soulbound,
        })),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const pets: PetInfo[] = (raw.types?.pets?.items ?? []).map((it: any) => ({
    name: String(it.name ?? "Unknown Pet"),
    price: it.price ?? 0,
    count: it.count ?? 1,
  }));

  return {
    networth: {
      total: raw.networth ?? 0,
      unsoulbound: raw.unsoulboundNetworth ?? 0,
      purse: raw.purse ?? 0,
      bank: raw.bank ?? 0,
      personalBank: raw.personalBank ?? 0,
      noInventory: !!raw.noInventory,
      categories,
    },
    pets,
  };
}
