import type { ProfileSummary } from "@/lib/types";
import { formatFull, formatLevel } from "@/lib/format";
import { Card, CardTitle, ProgressBar } from "@/components/ui";

const CLASS_ICONS: Record<string, string> = {
  healer: "❤️",
  mage: "🔮",
  berserk: "🗡️",
  archer: "🏹",
  tank: "🛡️",
};

const FLOOR_NAMES: Record<string, string> = {
  "0": "Entrance",
  "1": "Floor 1",
  "2": "Floor 2",
  "3": "Floor 3",
  "4": "Floor 4",
  "5": "Floor 5",
  "6": "Floor 6",
  "7": "Floor 7",
};

export default function DungeonsTab({ profile }: { profile: ProfileSummary }) {
  const d = profile.dungeons;
  if (!d) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="py-8 text-muted">This player hasn&apos;t entered the Catacombs on this profile.</p>
      </Card>
    );
  }

  const maxed = d.catacombs.levelInt >= 50;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Catacombs</p>
            <p className="text-4xl font-bold text-[#c084fc]">{formatLevel(d.catacombs.level)}</p>
          </div>
          <div className="min-w-[220px] flex-1">
            <ProgressBar progress={maxed ? 1 : d.catacombs.level - d.catacombs.levelInt} color="#c084fc" />
            <p className="mt-1.5 text-xs text-muted">
              {maxed ? (
                <>MAXED — {formatFull(d.catacombs.xp)} total XP</>
              ) : (
                <>
                  {formatFull(d.catacombs.xpIntoLevel)} / {formatFull(d.catacombs.xpForNext ?? 0)} XP to{" "}
                  {d.catacombs.levelInt + 1}
                </>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Class average</p>
            <p className="text-2xl font-bold">{formatLevel(d.classAverage)}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {d.classes.map((c) => (
          <Card key={c.id} className={c.selected ? "border-[#c084fc]/50" : ""}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold capitalize">
                {CLASS_ICONS[c.id]} {c.id}
              </span>
              {c.selected && <span className="text-[10px] uppercase text-[#c084fc]">active</span>}
            </div>
            <p className="mt-2 text-2xl font-bold">{c.levelInt}</p>
            <ProgressBar progress={c.levelInt >= 50 ? 1 : c.level - c.levelInt} color="#c084fc" className="mt-2" />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CompletionsCard title="Catacombs completions" completions={d.completions} />
        <CompletionsCard title="Master Mode completions" completions={d.masterCompletions} master />
      </div>
    </div>
  );
}

function CompletionsCard({
  title,
  completions,
  master = false,
}: {
  title: string;
  completions: Record<string, number>;
  master?: boolean;
}) {
  const entries = Object.entries(completions).sort(([a], [b]) => Number(a) - Number(b));
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">No completions yet.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {entries.map(([floor, count]) => (
            <div key={floor} className="rounded-lg bg-panel-2 px-2 py-2 text-center">
              <p className="text-[11px] text-muted">
                {master ? `M${floor}` : FLOOR_NAMES[floor] ?? `F${floor}`}
              </p>
              <p className="text-sm font-bold">{formatFull(count)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
