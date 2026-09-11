// Maps numeric Minecraft 1.8 item IDs to texture names in the
// InventivetalentDev/minecraft-assets repo (1.8.9 item textures).

const ID_TO_TEXTURE: Record<number, string> = {
  256: "iron_shovel", 257: "iron_pickaxe", 258: "iron_axe", 259: "flint_and_steel",
  260: "apple", 261: "bow_standby", 262: "arrow", 263: "coal", 264: "diamond",
  265: "iron_ingot", 266: "gold_ingot", 267: "iron_sword", 268: "wood_sword",
  269: "wood_shovel", 270: "wood_pickaxe", 271: "wood_axe", 272: "stone_sword",
  273: "stone_shovel", 274: "stone_pickaxe", 275: "stone_axe", 276: "diamond_sword",
  277: "diamond_shovel", 278: "diamond_pickaxe", 279: "diamond_axe", 280: "stick",
  281: "bowl", 282: "mushroom_stew", 283: "gold_sword", 284: "gold_shovel",
  285: "gold_pickaxe", 286: "gold_axe", 287: "string", 288: "feather",
  289: "gunpowder", 290: "wood_hoe", 291: "stone_hoe", 292: "iron_hoe",
  293: "diamond_hoe", 294: "gold_hoe", 295: "seeds_wheat", 296: "wheat",
  297: "bread", 298: "leather_helmet", 299: "leather_chestplate",
  300: "leather_leggings", 301: "leather_boots", 302: "chainmail_helmet",
  303: "chainmail_chestplate", 304: "chainmail_leggings", 305: "chainmail_boots",
  306: "iron_helmet", 307: "iron_chestplate", 308: "iron_leggings",
  309: "iron_boots", 310: "diamond_helmet", 311: "diamond_chestplate",
  312: "diamond_leggings", 313: "diamond_boots", 314: "gold_helmet",
  315: "gold_chestplate", 316: "gold_leggings", 317: "gold_boots", 318: "flint",
  319: "porkchop_raw", 320: "porkchop_cooked", 322: "apple_golden",
  325: "bucket_empty", 331: "redstone_dust", 332: "snowball", 334: "leather",
  336: "brick", 337: "clay_ball", 339: "paper", 340: "book_normal",
  341: "slimeball", 344: "egg", 345: "compass", 346: "fishing_rod_uncast",
  347: "clock", 348: "glowstone_dust", 349: "fish_cod_raw", 350: "fish_cod_cooked",
  352: "bone", 353: "sugar", 354: "cake", 357: "cookie", 359: "shears",
  360: "melon", 363: "beef_raw", 364: "beef_cooked", 366: "chicken_cooked",
  367: "rotten_flesh", 368: "ender_pearl", 369: "blaze_rod", 370: "ghast_tear",
  371: "gold_nugget", 372: "nether_wart", 373: "potion_bottle_drinkable",
  374: "potion_bottle_empty", 375: "spider_eye", 376: "spider_eye_fermented",
  377: "blaze_powder", 378: "magma_cream", 381: "ender_eye",
  382: "melon_speckled", 384: "experience_bottle", 388: "emerald", 391: "carrot",
  392: "potato", 393: "potato_baked", 396: "carrot_golden",
  398: "carrot_on_a_stick", 399: "nether_star", 400: "pumpkin_pie",
  403: "book_enchanted", 405: "netherbrick", 406: "quartz",
  409: "prismarine_shard", 410: "prismarine_crystals", 414: "rabbit_foot",
  415: "rabbit_hide", 420: "lead", 421: "name_tag",
};

const CDN =
  "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.8.9/assets/minecraft/textures/items";

export function vanillaIconUrl(numericId: number | undefined): string | null {
  if (!numericId) return null;
  const texture = ID_TO_TEXTURE[numericId];
  return texture ? `${CDN}/${texture}.png` : null;
}
