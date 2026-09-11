import type { ProfileSummary } from "@/lib/types";
import { formatCoins, formatFull, formatLevel } from "@/lib/format";
import { Card, CardTitle, ProgressBar, StatPill } from "@/components/ui";

export default function OverviewTab({ profile }: { profile: ProfileSummary }) {
  const nw = profile.networth;
  const cata = profile.dungeons?.catacombs;
  const topCategories = nw?.categories.slice(0, 5) ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardTitle>Networth</CardTitle>
        {nw ? (
          <>
            <p className="text-3xl font-bold text-gold" title={formatFull(nw.total)}>
              {formatCoins(nw.total)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatPill label="Purse" value={formatCoins(nw.purse)} />
              <StatPill label="Bank" value={profile.bank === null ? "API off" : formatCoins(nw.bank)} />
            </div>
            {nw.noInventory && (
              <p className="mt-3 text-xs text-muted">⚠ Inventory API is disabled — item values are missing.</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">{profile.networthError ?? "Not available."}</p>
        )}
      </Card>

      <Card>
        <CardTitle>Top skills</CardTitle>
        <div className="flex flex-col gap-2.5">
          {[...profile.skills]
            .filter((s) => s.inAverage)
            .sort((a, b) => b.level - a.level)
            .slice(0, 5)
            .map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="w-6 text-center">{s.icon}</span>
                <span className="w-24 text-sm">{s.name}</span>
                <ProgressBar progress={s.level / s.maxLevel} className="flex-1" />
                <span className="w-12 text-right text-sm font-semibold text-gold">
                  {s.levelInt}
                </span>
              </div>
            ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Skill average: <span className="font-semibold text-foreground">{formatLevel(profile.skillAverage)}</span>
        </p>
      </Card>

      <Card>
        <CardTitle>Dungeons</CardTitle>
        {cata ? (
          <>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[#c084fc]">{cata.levelInt}</p>
              <p className="text-sm text-muted">Catacombs</p>
            </div>
            <ProgressBar progress={cata.level - cata.levelInt} color="#c084fc" className="mt-2" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatPill label="Class Avg" value={formatLevel(profile.dungeons!.classAverage)} />
              <StatPill
                label="Selected"
                value={
                  profile.dungeons!.classes.find((c) => c.selected)?.id.replace(/^./, (m) => m.toUpperCase()) ?? "—"
                }
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">This player hasn&apos;t entered the Catacombs.</p>
        )}
      </Card>

      <Card>
        <CardTitle>Slayers</CardTitle>
        <div className="flex flex-wrap gap-2">
          {profile.slayers.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 rounded-lg bg-panel-2 px-2.5 py-1.5" title={s.name}>
              <span className="text-xs text-muted">{s.name.split(" ")[0]}</span>
              <span className="text-sm font-bold text-red-400">{s.level}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Character</CardTitle>
        <div className="grid grid-cols-2 gap-2">
          <StatPill label="SB Level" value={formatLevel(profile.skyblockLevel)} />
          <StatPill label="Fairy Souls" value={formatFull(profile.fairySouls)} />
          <StatPill label="Purse" value={formatCoins(profile.purse)} />
          <StatPill label="Members" value={profile.memberCount} />
        </div>
      </Card>

      {topCategories.length > 0 && (
        <Card>
          <CardTitle>Networth breakdown</CardTitle>
          <div className="flex flex-col gap-2">
            {topCategories.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-muted">{c.name}</span>
                <span className="font-semibold">{formatCoins(c.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
