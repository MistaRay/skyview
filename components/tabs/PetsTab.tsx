import type { ProfileSummary } from "@/lib/types";
import { formatCoins } from "@/lib/format";
import { Card } from "@/components/ui";

/** Parses "[Lvl 100] Ender Dragon" into { level, petName }. */
function parsePet(name: string): { level: number | null; petName: string } {
  const match = name.match(/^\[Lvl (\d+)\]\s*(.+)$/);
  if (!match) return { level: null, petName: name };
  return { level: Number(match[1]), petName: match[2] };
}

export default function PetsTab({ profile }: { profile: ProfileSummary }) {
  if (profile.pets.length === 0) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="py-8 text-muted">No pets found on this profile (or Inventory API is disabled).</p>
      </Card>
    );
  }

  const pets = [...profile.pets].sort((a, b) => b.price - a.price);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pets.map((pet, i) => {
        const { level, petName } = parsePet(pet.name);
        return (
          <Card key={i} className="flex items-center gap-3 !p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-panel-2 text-sm font-bold text-gold">
              {level ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {petName}
                {pet.count > 1 && <span className="ml-1 text-xs text-muted">×{pet.count}</span>}
              </p>
              <p className="text-xs text-muted">{formatCoins(pet.price)} coins</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
