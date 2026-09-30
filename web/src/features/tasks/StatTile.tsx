import type { LucideIcon } from "lucide-react";

import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

export function StatTile({
  icon: Icon,
  label,
  value,
  footnote,
  selected = false,
  onSelect,
  tone = "default",
  loading = false,
  error = false,
  ariaLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: number | undefined;
  footnote: string;
  selected?: boolean;
  onSelect?: () => void;
  tone?: "default" | "warning";
  loading?: boolean;
  error?: boolean;
  ariaLabel?: string;
}) {
  const body = (
    <>
      <span
        className={cn(
          "flex items-center gap-1.5 font-mono text-overline uppercase",
          tone === "warning" ? "text-warning" : selected ? "text-primary" : "text-secondary",
        )}
      >
        <Icon aria-hidden className="size-3.5" strokeWidth={1.75} />
        {label}
      </span>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-14 rounded-xs" />
      ) : error ? (
        <span className="mt-3 block text-display text-tertiary">–</span>
      ) : (
        <span
          className={cn(
            "mt-3 block text-display tabular-nums",
            tone === "warning" ? "text-warning" : value === 0 ? "text-tertiary" : "text-primary",
          )}
        >
          {value}
        </span>
      )}

      {loading ? (
        <div className="mt-1">
          <SkeletonLine width={96} />
        </div>
      ) : (
        <span
          className={cn(
            "mt-1 block font-mono text-mono uppercase",
            error ? "text-danger-text" : tone === "warning" ? "text-secondary" : "text-tertiary",
          )}
        >
          {error ? "Couldn't load" : footnote}
        </span>
      )}
    </>
  );

  const shell = cn(
    "min-h-30 rounded-md border p-5 text-left shadow-xs transition-[background-color,border-color,box-shadow] duration-[160ms]",
    tone === "warning"
      ? "border-warning-border bg-warning-subtle"
      : selected
        ? "border-accent/40 bg-accent-subtle"
        : "border-default bg-surface",
    onSelect && "hover:border-strong hover:shadow-sm active:bg-subtle",
  );

  if (!onSelect) {
    return (
      <div className={shell} aria-label={ariaLabel}>
        {body}
      </div>
    );
  }

  return (
    <button type="button" aria-pressed={selected} onClick={onSelect} className={shell}>
      {body}
    </button>
  );
}
