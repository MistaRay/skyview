/** 12345678 -> "12.35M", 4321 -> "4,321" */
export function formatCoins(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e4) return `${(n / 1e3).toFixed(1)}K`;
  return Math.round(n).toLocaleString("en-US");
}

/** Full number with thousands separators. */
export function formatFull(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** 34.6789 -> "34.68" */
export function formatLevel(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

export const GAME_MODE_LABELS: Record<string, string> = {
  ironman: "♻ Ironman",
  island: "☀ Stranded",
  bingo: "Ⓑ Bingo",
};
