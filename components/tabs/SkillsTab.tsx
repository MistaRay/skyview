import type { ProfileSummary } from "@/lib/types";
import { formatFull, formatLevel } from "@/lib/format";
import { Card, ProgressBar } from "@/components/ui";

export default function SkillsTab({ profile }: { profile: ProfileSummary }) {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Skill average (excl. Carpentry, Runecrafting, Social):{" "}
        <span className="font-semibold text-gold">{formatLevel(profile.skillAverage)}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.skills.map((s) => {
          const maxed = s.levelInt >= s.maxLevel;
          return (
            <Card key={s.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <span className="font-semibold">{s.name}</span>
                  {!s.inAverage && <span className="text-[10px] uppercase text-muted">cosmetic</span>}
                </div>
                <span className={`text-xl font-bold ${maxed ? "text-gold" : ""}`}>
                  {s.levelInt}
                  <span className="text-xs font-normal text-muted"> / {s.maxLevel}</span>
                </span>
              </div>
              <ProgressBar
                progress={maxed ? 1 : s.level - s.levelInt}
                color={maxed ? "var(--gold)" : "var(--accent)"}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted">
                {maxed ? (
                  <>MAXED — {formatFull(s.xp)} total XP</>
                ) : (
                  <>
                    {formatFull(s.xpIntoLevel)} / {formatFull(s.xpForNext ?? 0)} XP to level {s.levelInt + 1}
                  </>
                )}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
