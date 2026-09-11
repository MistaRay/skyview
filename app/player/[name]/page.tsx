import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import ProfileViewer from "@/components/ProfileViewer";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const username = decodeURIComponent(name);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-edge bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
            Sky<span className="text-gold">View</span>
          </Link>
          <div className="max-w-sm flex-1">
            <SearchBox compact />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <ProfileViewer username={username} />
      </main>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const username = decodeURIComponent(name);
  return {
    title: `${username} — SkyView`,
    description: `Hypixel SkyBlock stats for ${username}: networth, skills, dungeons, slayers.`,
  };
}
