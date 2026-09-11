"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApiError, PlayerResponse, ProfileSummary } from "@/lib/types";
import { formatCoins, formatLevel, GAME_MODE_LABELS } from "@/lib/format";
import { pushRecent } from "@/components/SearchBox";
import OverviewTab from "@/components/tabs/OverviewTab";
import GearTab from "@/components/tabs/GearTab";
import SkillsTab from "@/components/tabs/SkillsTab";
import DungeonsTab from "@/components/tabs/DungeonsTab";
import SlayersTab from "@/components/tabs/SlayersTab";
import NetworthTab from "@/components/tabs/NetworthTab";
import PetsTab from "@/components/tabs/PetsTab";

const TABS = ["Overview", "Gear", "Skills", "Dungeons", "Slayers", "Networth", "Pets"] as const;
type Tab = (typeof TABS)[number];

export default function ProfileViewer({ username }: { username: string }) {
  const [data, setData] = useState<PlayerResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    setError(null);

    fetch(`/api/player/${encodeURIComponent(username)}`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(body as ApiError);
        } else {
          const player = body as PlayerResponse;
          setData(player);
          setProfileId(player.profiles[0]?.profileId ?? null);
          pushRecent(player.username);
        }
      })
      .catch(() => {
        if (!cancelled) setError({ error: "Network error — could not reach the server." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const profile: ProfileSummary | null = useMemo(
    () => data?.profiles.find((p) => p.profileId === profileId) ?? data?.profiles[0] ?? null,
    [data, profileId]
  );

  if (loading) return <LoadingSkeleton username={username} />;
  if (error) return <ErrorCard error={error} username={username} />;
  if (!data || !profile) return null;

  return (
    <div className="fade-up flex flex-col gap-6">
      {/* Player header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-edge bg-panel p-5 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://mc-heads.net/avatar/${data.uuid}/72`}
          alt={data.username}
          className="h-[72px] w-[72px] rounded-xl border border-edge"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {data.rank && (
              <span className="rounded bg-gold/15 px-1.5 py-0.5 text-xs font-bold text-gold">
                {data.rank}
              </span>
            )}
            <h1 className="truncate text-2xl font-bold">{data.username}</h1>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.profiles.map((p) => (
              <button
                key={p.profileId}
                onClick={() => setProfileId(p.profileId)}
                className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                  p.profileId === profile.profileId
                    ? "border-gold/60 bg-gold/10 text-gold"
                    : "border-edge bg-panel-2 text-muted hover:text-foreground"
                }`}
              >
                {p.cuteName}
                {p.gameMode && (
                  <span className="ml-1.5 text-xs opacity-70">{GAME_MODE_LABELS[p.gameMode] ?? p.gameMode}</span>
                )}
                {p.selected && <span className="ml-1.5 text-xs opacity-70">• active</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <HeaderStat label="SB Level" value={formatLevel(profile.skyblockLevel, 2)} accent />
          <HeaderStat
            label="Networth"
            value={profile.networth ? formatCoins(profile.networth.total) : "—"}
          />
          <HeaderStat label="Skill Avg" value={formatLevel(profile.skillAverage, 2)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-edge bg-panel p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-gold text-[#1a1405]" : "text-muted hover:bg-panel-2 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="fade-up" key={`${profile.profileId}:${tab}`}>
        {tab === "Overview" && <OverviewTab profile={profile} />}
        {tab === "Gear" && <GearTab profile={profile} />}
        {tab === "Skills" && <SkillsTab profile={profile} />}
        {tab === "Dungeons" && <DungeonsTab profile={profile} />}
        {tab === "Slayers" && <SlayersTab profile={profile} />}
        {tab === "Networth" && <NetworthTab profile={profile} />}
        {tab === "Pets" && <PetsTab profile={profile} />}
      </div>
    </div>
  );
}

function HeaderStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex min-w-[90px] flex-col items-center justify-center rounded-xl bg-panel-2 px-4 py-2">
      <span className={`text-lg font-bold ${accent ? "text-gold" : ""}`}>{value}</span>
      <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
}

function LoadingSkeleton({ username }: { username: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-2xl border border-edge bg-panel p-5">
        <div className="h-[72px] w-[72px] animate-pulse rounded-xl bg-panel-2" />
        <div className="flex-1">
          <div className="h-6 w-48 animate-pulse rounded bg-panel-2" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-panel-2" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border border-edge bg-panel" />
        ))}
      </div>
      <p className="text-center text-sm text-muted">
        Loading <span className="font-semibold text-foreground">{username}</span>&apos;s profiles… networth
        calculation can take a few seconds.
      </p>
    </div>
  );
}

function ErrorCard({ error, username }: { error: ApiError; username: string }) {
  const isKeyIssue = error.code === "NO_KEY" || error.code === "INVALID_KEY";
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-edge bg-panel p-8 text-center">
      <p className="text-4xl">{isKeyIssue ? "🔑" : "😕"}</p>
      <h2 className="mt-4 text-xl font-bold">
        {isKeyIssue ? "API key needed" : `Couldn't load ${username}`}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{error.error}</p>
      {isKeyIssue && (
        <ol className="mx-auto mt-4 max-w-sm list-decimal space-y-1 pl-6 text-left text-sm text-muted">
          <li>
            Visit{" "}
            <a href="https://developer.hypixel.net/dashboard" target="_blank" rel="noreferrer" className="text-accent underline">
              developer.hypixel.net/dashboard
            </a>
          </li>
          <li>Create App → Personal API Key</li>
          <li>
            Paste it into <code className="rounded bg-panel-2 px-1 font-mono text-xs">.env.local</code> as{" "}
            <code className="rounded bg-panel-2 px-1 font-mono text-xs">HYPIXEL_API_KEY=…</code>
          </li>
          <li>Restart the dev server</li>
        </ol>
      )}
    </div>
  );
}
