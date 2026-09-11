import { NextRequest, NextResponse } from "next/server";
import { getMuseum, getProfiles, getRank, HypixelError, resolveUuid } from "@/lib/hypixel";
import {
  computeDungeons,
  computeSkills,
  computeSlayers,
  getFairySouls,
  getPurse,
  getSkyblockLevel,
  summarizeNetworth,
} from "@/lib/stats";
import { computeAccessories } from "@/lib/accessories";
import { computeGear } from "@/lib/gear";
import type { PlayerResponse, ProfileSummary } from "@/lib/types";

// skyhelper-networth is CommonJS; require-style import via interop.
import { ProfileNetworthCalculator, getPrices } from "skyhelper-networth";

export const dynamic = "force-dynamic";

let pricesCache: { prices: object; fetched: number } | null = null;

/** Item prices shared across all profile calculations, cached for 5 minutes. */
async function getSharedPrices(): Promise<object | undefined> {
  if (pricesCache && Date.now() - pricesCache.fetched < 5 * 60 * 1000) {
    return pricesCache.prices;
  }
  try {
    const prices = await getPrices(true);
    pricesCache = { prices, fetched: Date.now() };
    return prices;
  } catch {
    return undefined; // let the library fetch prices itself as a fallback
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const username = decodeURIComponent(name).trim();

  if (!/^[A-Za-z0-9_]{1,16}$/.test(username)) {
    return NextResponse.json(
      { error: "Invalid username. Minecraft names are 1-16 letters, numbers, or underscores.", code: "NOT_FOUND" },
      { status: 400 }
    );
  }

  try {
    const { uuid, name: canonicalName } = await resolveUuid(username);
    const [profiles, rank, prices] = await Promise.all([
      getProfiles(uuid),
      getRank(uuid),
      getSharedPrices(),
    ]);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: `${canonicalName} has never played SkyBlock (or their profiles are hidden).`, code: "NO_PROFILES" },
        { status: 404 }
      );
    }

    const summaries: ProfileSummary[] = await Promise.all(
      profiles.map(async (profile: any): Promise<ProfileSummary> => {
        const member = profile.members?.[uuid] ?? {};
        const bank = profile.banking?.balance ?? null;

        const { skills, skillAverage } = computeSkills(member);
        const [gear, accessories] = await Promise.all([
          computeGear(member).catch((err) => {
            console.error(`gear decode failed for ${profile.profile_id}:`, err?.message ?? err);
            return null;
          }),
          computeAccessories(member).catch((err) => {
            console.error(`accessories failed for ${profile.profile_id}:`, err?.message ?? err);
            return null;
          }),
        ]);

        let networth = null;
        let networthError = null;
        let pets: ProfileSummary["pets"] = [];
        try {
          const museumMembers = await getMuseum(profile.profile_id);
          const calculator = new ProfileNetworthCalculator(
            member,
            museumMembers?.[uuid] ?? undefined,
            bank ?? 0
          );
          const result = await calculator.getNetworth(
            prices ? { prices, cachePrices: true } : { cachePrices: true }
          );
          const summarized = summarizeNetworth(result);
          networth = summarized.networth;
          pets = summarized.pets;
        } catch (err: any) {
          networthError = "Networth could not be calculated for this profile.";
          console.error(`networth failed for ${profile.profile_id}:`, err?.message ?? err);
        }

        return {
          profileId: profile.profile_id,
          cuteName: profile.cute_name ?? "Unknown",
          gameMode: profile.game_mode ?? null,
          selected: !!profile.selected,
          memberCount: Object.keys(profile.members ?? {}).length,
          skyblockLevel: getSkyblockLevel(member),
          fairySouls: getFairySouls(member),
          purse: getPurse(member),
          bank,
          skills,
          skillAverage,
          dungeons: computeDungeons(member),
          slayers: computeSlayers(member),
          networth,
          networthError,
          pets,
          gear,
          accessories,
        };
      })
    );

    // Selected profile first, then by SkyBlock level.
    summaries.sort((a, b) => Number(b.selected) - Number(a.selected) || b.skyblockLevel - a.skyblockLevel);

    const response: PlayerResponse = {
      username: canonicalName,
      uuid,
      rank,
      profiles: summaries,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof HypixelError) {
      const status =
        err.code === "NOT_FOUND" ? 404 :
        err.code === "RATE_LIMITED" ? 429 :
        err.code === "NO_KEY" || err.code === "INVALID_KEY" ? 503 : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("player route error:", err);
    return NextResponse.json(
      { error: "Something went wrong fetching this player.", code: "UPSTREAM" },
      { status: 500 }
    );
  }
}
