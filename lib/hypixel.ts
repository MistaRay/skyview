// Server-side fetch helpers for the Mojang and Hypixel APIs, with in-memory TTL caching.

interface CacheEntry {
  value: unknown;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function cacheSet(key: string, value: unknown, ttlMs: number) {
  // Basic eviction so the map cannot grow without bound.
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) if (v.expires < now) cache.delete(k);
    if (cache.size > 500) cache.clear();
  }
  cache.set(key, { value, expires: Date.now() + ttlMs });
}

export class HypixelError extends Error {
  code: "NO_KEY" | "INVALID_KEY" | "NOT_FOUND" | "RATE_LIMITED" | "UPSTREAM";
  constructor(code: HypixelError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

/** Resolve a Minecraft username to { uuid, name } via the Mojang API. Cached for 6 hours. */
export async function resolveUuid(username: string): Promise<{ uuid: string; name: string }> {
  const key = `uuid:${username.toLowerCase()}`;
  const cached = cacheGet<{ uuid: string; name: string }>(key);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
      { signal: AbortSignal.timeout(8000) }
    );
  } catch {
    // Mojang can be flaky; fall back to PlayerDB.
    return resolveUuidFallback(username);
  }

  if (res.status === 404 || res.status === 204) {
    throw new HypixelError("NOT_FOUND", `No Minecraft player named "${username}" exists.`);
  }
  if (!res.ok) return resolveUuidFallback(username);

  const data = (await res.json()) as { id: string; name: string };
  const result = { uuid: data.id, name: data.name };
  cacheSet(key, result, 6 * 60 * 60 * 1000);
  return result;
}

async function resolveUuidFallback(username: string): Promise<{ uuid: string; name: string }> {
  const res = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(username)}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    if (res.status === 400 || res.status === 404) {
      throw new HypixelError("NOT_FOUND", `No Minecraft player named "${username}" exists.`);
    }
    throw new HypixelError("UPSTREAM", "Could not resolve username (Mojang API unavailable).");
  }
  const data = await res.json();
  if (!data?.success || !data?.data?.player?.raw_id) {
    throw new HypixelError("NOT_FOUND", `No Minecraft player named "${username}" exists.`);
  }
  const result = { uuid: data.data.player.raw_id as string, name: data.data.player.username as string };
  cacheSet(`uuid:${username.toLowerCase()}`, result, 6 * 60 * 60 * 1000);
  return result;
}

async function hypixelFetch(path: string, params: Record<string, string>): Promise<any> {
  const apiKey = process.env.HYPIXEL_API_KEY;
  if (!apiKey) {
    throw new HypixelError(
      "NO_KEY",
      "No Hypixel API key configured. Add HYPIXEL_API_KEY to .env.local (get one at developer.hypixel.net)."
    );
  }
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`https://api.hypixel.net/v2/${path}?${qs}`, {
    headers: { "API-Key": apiKey },
    signal: AbortSignal.timeout(15000),
  });

  if (res.status === 403) throw new HypixelError("INVALID_KEY", "The configured Hypixel API key is invalid or expired.");
  if (res.status === 429) throw new HypixelError("RATE_LIMITED", "Hypixel API rate limit reached. Try again in a minute.");
  if (!res.ok) throw new HypixelError("UPSTREAM", `Hypixel API error (HTTP ${res.status}).`);

  const data = await res.json();
  if (!data.success) throw new HypixelError("UPSTREAM", data.cause || "Hypixel API request failed.");
  return data;
}

/** All SkyBlock profiles for a player UUID. Cached for 2 minutes. */
export async function getProfiles(uuid: string): Promise<any[]> {
  const key = `profiles:${uuid}`;
  const cached = cacheGet<any[]>(key);
  if (cached) return cached;
  const data = await hypixelFetch("skyblock/profiles", { uuid });
  const profiles = data.profiles ?? [];
  cacheSet(key, profiles, 2 * 60 * 1000);
  return profiles;
}

/** Museum data for a profile ID (map of member uuid -> museum data). Cached for 10 minutes. Returns null on failure. */
export async function getMuseum(profileId: string): Promise<Record<string, any> | null> {
  const key = `museum:${profileId}`;
  const cached = cacheGet<Record<string, any> | null>(key);
  if (cached !== undefined) return cached;
  try {
    const data = await hypixelFetch("skyblock/museum", { profile: profileId });
    const members = data.members ?? {};
    cacheSet(key, members, 10 * 60 * 1000);
    return members;
  } catch {
    // Museum is a nice-to-have for networth; don't fail the whole request.
    cacheSet(key, null, 60 * 1000);
    return null;
  }
}

const RANK_DISPLAY: Record<string, string> = {
  ADMIN: "ADMIN",
  GAME_MASTER: "GM",
  YOUTUBER: "YOUTUBE",
  SUPERSTAR: "MVP++",
  MVP_PLUS: "MVP+",
  MVP: "MVP",
  VIP_PLUS: "VIP+",
  VIP: "VIP",
};

/** Player's network rank (e.g. "MVP+"), or null. Cached for 30 minutes. Never throws. */
export async function getRank(uuid: string): Promise<string | null> {
  const key = `rank:${uuid}`;
  const cached = cacheGet<string | null>(key);
  if (cached !== undefined) return cached;
  try {
    const data = await hypixelFetch("player", { uuid });
    const p = data.player ?? {};
    const raw =
      (p.rank && p.rank !== "NORMAL" ? p.rank : null) ??
      (p.monthlyPackageRank === "SUPERSTAR" ? "SUPERSTAR" : null) ??
      (p.newPackageRank && p.newPackageRank !== "NONE" ? p.newPackageRank : null) ??
      (p.packageRank && p.packageRank !== "NONE" ? p.packageRank : null);
    const rank = raw ? RANK_DISPLAY[raw] ?? raw : null;
    cacheSet(key, rank, 30 * 60 * 1000);
    return rank;
  } catch {
    return null;
  }
}
