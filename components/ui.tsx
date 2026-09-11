import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-edge bg-panel p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </h3>
  );
}

export function ProgressBar({
  progress,
  color = "var(--gold)",
  className = "",
}: {
  /** 0..1 */
  progress: number;
  color?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-panel-2 ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function StatPill({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-panel-2 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
