import type { ProfileSummary } from "@/lib/types";
import { formatFull } from "@/lib/format";
import { Card, ProgressBar } from "@/components/ui";

const SLAYER_COLORS: Record<string, string> = {
  zombie: "#4ade80",
  spider: "#a78bfa",
  wolf: "#94a3b8",
  enderman: "#c084fc",
  blaze: "#fb923c",
  vampire: "#f87171",
};

const TIER_LABELS = ["I", "II", "III", "IV", "V"];

export default function SlayersTab({ profile }: { profile: ProfileSummary }) {
  const anyXp = profile.slayers.some((s) => s.xp > 0);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {!anyXp && (
        <Card className="sm:col-span-2 lg:col-span-3 text-center">
          <p className="py-6 text-muted">No slayer progress on this profile.</p>
        </Card>
      )}
      {profile.slayers.map((s) => {
        const color = SLAYER_COLORS[s.id] ?? "var(--gold)";
        const maxed = s.level >= s.maxLevel;
        return (
          <Card key={s.id}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{s.name}</span>
              <span className="text-xl font-bold" style={{ color }}>
                {s.level}
                <span className="text-xs font-normal text-muted"> / {s.maxLevel}</span>
              </span>
            </div>
            <ProgressBar
              progress={maxed ? 1 : s.xpForNext ? s.xp / s.xpForNext : 0}
              color={color}
              className="mt-3"
            />
            <p className="mt-2 text-xs text-muted">
              {maxed ? (
                <>MAXED — {formatFull(s.xp)} XP</>
              ) : (
                <>
                  {formatFull(s.xp)} / {formatFull(s.xpForNext ?? 0)} XP
                </>
              )}
            </p>
            {s.kills.some((k) => k > 0) && (
              <div className="mt-3 flex gap-1.5">
                {TIER_LABELS.map((label, i) =>
                  s.kills[i] ? (
                    <div key={label} className="flex-1 rounded bg-panel-2 px-1 py-1 text-center">
                      <p className="text-[10px] text-muted">T{label}</p>
                      <p className="text-xs font-semibold">{formatFull(s.kills[i])}</p>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
