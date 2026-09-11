import SearchBox from "@/components/SearchBox";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24">
      <div className="fade-up flex w-full max-w-xl flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Sky<span className="text-gold">View</span>
          </h1>
          <p className="mt-3 text-muted">
            Look up any Hypixel SkyBlock player — networth, skills, dungeons,
            slayers and more.
          </p>
        </div>
        <SearchBox autoFocus />
        <p className="text-xs text-muted">
          Try a username like <span className="font-mono text-foreground/80">Studio6</span> or{" "}
          <span className="font-mono text-foreground/80">Technoblade</span>
        </p>
      </div>
      <footer className="fixed bottom-4 text-xs text-muted/60">
        Not affiliated with Hypixel. Data from the public Hypixel API.
      </footer>
    </main>
  );
}
