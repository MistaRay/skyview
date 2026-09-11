// Shared response types between the API route and the frontend.

export interface SkillInfo {
  id: string;
  name: string;
  icon: string;
  xp: number;
  level: number; // float including progress toward next level
  levelInt: number;
  maxLevel: number;
  xpIntoLevel: number;
  xpForNext: number | null; // null when maxed
  inAverage: boolean;
}

export interface SlayerInfo {
  id: string;
  name: string;
  xp: number;
  level: number;
  maxLevel: number;
  xpForNext: number | null;
  kills: number[]; // kills per tier (index 0 = tier I)
}

export interface DungeonClassInfo {
  id: string;
  xp: number;
  level: number;
  levelInt: number;
  selected: boolean;
}

export interface DungeonsInfo {
  catacombs: {
    xp: number;
    level: number;
    levelInt: number;
    xpIntoLevel: number;
    xpForNext: number | null;
  };
  classAverage: number;
  classes: DungeonClassInfo[];
  completions: Record<string, number>; // floor -> completions, "0" = entrance
  masterCompletions: Record<string, number>;
  secrets: number | null;
}

export interface NetworthItem {
  name: string;
  count: number;
  price: number;
  soulbound: boolean;
}

export interface NetworthCategory {
  id: string;
  name: string;
  total: number;
  items: NetworthItem[];
}

export interface NetworthInfo {
  total: number;
  unsoulbound: number;
  purse: number;
  bank: number;
  personalBank: number;
  noInventory: boolean;
  categories: NetworthCategory[];
}

export interface GearItem {
  name: string;
  /** Raw display name including Minecraft § color codes. */
  coloredName: string;
  /** Raw lore lines including § color codes. */
  lore: string[];
  count: number;
  skyblockId: string | null;
  rarity: string | null;
  icon: string | null;
}

export interface GearInfo {
  /** [helmet, chestplate, leggings, boots] — null entries are empty slots. */
  armor: (GearItem | null)[];
  /** [necklace, cloak, belt, gloves] */
  equipment: (GearItem | null)[];
  /** 36 slots; 0-8 is the hotbar. */
  inventory: (GearItem | null)[];
  enderChest: (GearItem | null)[];
}

export interface AccessoryItem {
  id: string;
  name: string;
  tier: string;
  icon: string | null;
}

export interface AccessoriesInfo {
  owned: AccessoryItem[];
  /** Higher tiers of accessory lines the player already owns. */
  missingUpgrades: AccessoryItem[];
  /** Accessory lines the player doesn't own at all (base tier shown). */
  missing: AccessoryItem[];
}

export interface PetInfo {
  name: string; // e.g. "[Lvl 100] Ender Dragon"
  price: number;
  count: number;
}

export interface ProfileSummary {
  profileId: string;
  cuteName: string;
  gameMode: string | null;
  selected: boolean;
  memberCount: number;
  skyblockLevel: number;
  fairySouls: number;
  purse: number;
  bank: number | null;
  skills: SkillInfo[];
  skillAverage: number;
  dungeons: DungeonsInfo | null;
  slayers: SlayerInfo[];
  networth: NetworthInfo | null;
  networthError: string | null;
  pets: PetInfo[];
  gear: GearInfo | null;
  accessories: AccessoriesInfo | null;
}

export interface PlayerResponse {
  username: string;
  uuid: string;
  rank: string | null;
  profiles: ProfileSummary[];
  fetchedAt: number;
}

export interface ApiError {
  error: string;
  code?: "NO_KEY" | "INVALID_KEY" | "NOT_FOUND" | "NO_PROFILES" | "RATE_LIMITED" | "UPSTREAM";
}
