// XP tables and game constants for Hypixel SkyBlock stat calculations.

/** Per-level XP required for standard skills (level 1 through 60). */
export const SKILL_XP_TABLE: number[] = [
  50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500, 10000,
  15000, 20000, 30000, 50000, 75000, 100000, 200000, 300000, 400000, 500000,
  600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000,
  1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000,
  2300000, 2400000, 2500000, 2600000, 2750000, 2900000, 3100000, 3400000,
  3700000, 4000000, 4300000, 4600000, 4900000, 5200000, 5500000, 5800000,
  6100000, 6400000, 6700000, 7000000,
];

/** Per-level XP for Runecrafting (max 25). */
export const RUNECRAFTING_XP_TABLE: number[] = [
  50, 100, 125, 160, 200, 250, 315, 400, 500, 625, 785, 1000, 1250, 1600,
  2000, 2465, 3125, 4000, 5000, 6200, 7800, 9800, 12200, 15300, 19050,
];

/** Per-level XP for Social (max 25). */
export const SOCIAL_XP_TABLE: number[] = [
  50, 100, 150, 250, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 3750,
  4500, 6000, 8000, 10000, 12500, 15000, 20000, 25000, 30000, 35000, 40000,
  50000,
];

/** Per-level XP for Catacombs and dungeon classes (max 50). */
export const DUNGEON_XP_TABLE: number[] = [
  50, 75, 110, 160, 230, 330, 470, 670, 950, 1340, 1890, 2665, 3760, 5260,
  7380, 10300, 14400, 20000, 27600, 38000, 52500, 71500, 97000, 132000,
  180000, 243000, 328000, 445000, 600000, 800000, 1065000, 1410000, 1900000,
  2500000, 3300000, 4300000, 5600000, 7200000, 9200000, 12000000, 15000000,
  19000000, 24000000, 30000000, 38000000, 48000000, 60000000, 75000000,
  93000000, 116250000,
];

/** Cumulative XP thresholds per slayer level, by slayer type. */
export const SLAYER_XP_THRESHOLDS: Record<string, number[]> = {
  zombie: [5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000],
  spider: [5, 25, 200, 1000, 5000, 20000, 100000, 400000, 1000000],
  wolf: [10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  enderman: [10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  blaze: [10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  vampire: [20, 75, 240, 840, 2400],
};

export const SLAYER_NAMES: Record<string, string> = {
  zombie: "Revenant Horror",
  spider: "Tarantula Broodfather",
  wolf: "Sven Packmaster",
  enderman: "Voidgloom Seraph",
  blaze: "Inferno Demonlord",
  vampire: "Riftstalker Bloodfiend",
};

export interface SkillDef {
  id: string;
  /** Key inside player_data.experience, e.g. SKILL_FARMING */
  apiKey: string;
  name: string;
  maxLevel: number;
  table: number[];
  /** Included in the skill average calculation. */
  inAverage: boolean;
  icon: string;
}

export const SKILLS: SkillDef[] = [
  { id: "farming", apiKey: "SKILL_FARMING", name: "Farming", maxLevel: 60, table: SKILL_XP_TABLE, inAverage: true, icon: "🌾" },
  { id: "mining", apiKey: "SKILL_MINING", name: "Mining", maxLevel: 60, table: SKILL_XP_TABLE, inAverage: true, icon: "⛏️" },
  { id: "combat", apiKey: "SKILL_COMBAT", name: "Combat", maxLevel: 60, table: SKILL_XP_TABLE, inAverage: true, icon: "⚔️" },
  { id: "foraging", apiKey: "SKILL_FORAGING", name: "Foraging", maxLevel: 57, table: SKILL_XP_TABLE, inAverage: true, icon: "🪓" },
  { id: "fishing", apiKey: "SKILL_FISHING", name: "Fishing", maxLevel: 50, table: SKILL_XP_TABLE, inAverage: true, icon: "🎣" },
  { id: "hunting", apiKey: "SKILL_HUNTING", name: "Hunting", maxLevel: 50, table: SKILL_XP_TABLE, inAverage: true, icon: "🦌" },
  { id: "enchanting", apiKey: "SKILL_ENCHANTING", name: "Enchanting", maxLevel: 60, table: SKILL_XP_TABLE, inAverage: true, icon: "📖" },
  { id: "alchemy", apiKey: "SKILL_ALCHEMY", name: "Alchemy", maxLevel: 50, table: SKILL_XP_TABLE, inAverage: true, icon: "🧪" },
  { id: "taming", apiKey: "SKILL_TAMING", name: "Taming", maxLevel: 60, table: SKILL_XP_TABLE, inAverage: true, icon: "🐾" },
  // Carpentry counts toward the in-game skill average since the Community Center update.
  { id: "carpentry", apiKey: "SKILL_CARPENTRY", name: "Carpentry", maxLevel: 50, table: SKILL_XP_TABLE, inAverage: true, icon: "🪑" },
  { id: "runecrafting", apiKey: "SKILL_RUNECRAFTING", name: "Runecrafting", maxLevel: 25, table: RUNECRAFTING_XP_TABLE, inAverage: false, icon: "◆" },
  { id: "social", apiKey: "SKILL_SOCIAL", name: "Social", maxLevel: 25, table: SOCIAL_XP_TABLE, inAverage: false, icon: "💬" },
];

export const DUNGEON_CLASSES = ["healer", "mage", "berserk", "archer", "tank"] as const;

export const NETWORTH_CATEGORY_NAMES: Record<string, string> = {
  armor: "Armor",
  equipment: "Equipment",
  wardrobe: "Wardrobe",
  inventory: "Inventory",
  enderchest: "Ender Chest",
  accessories: "Accessories",
  personal_vault: "Personal Vault",
  fishing_bag: "Fishing Bag",
  potion_bag: "Potion Bag",
  sacks_bag: "Sacks Bag",
  candy_inventory: "Candy Inventory",
  carnival_mask_inventory: "Carnival Masks",
  storage: "Storage",
  museum: "Museum",
  sacks: "Sacks",
  essence: "Essence",
  pets: "Pets",
  quiver: "Quiver",
  farming_toolkit: "Farming Toolkit",
  hunting_toolkit: "Hunting Toolkit",
};
