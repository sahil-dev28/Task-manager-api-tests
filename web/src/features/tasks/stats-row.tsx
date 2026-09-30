import { TriangleAlert } from "lucide-react";

import type { TaskStats, TaskStatus } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STATUS_ICON, STATUS_LABEL } from "@/lib/vocab";

const TILES: { status: TaskStatus; hint: string }[] = [
  { status: "todo", hint: "Not started" },
  { status: "in_progress", hint: "Being worked on" },
  { status: "done", hint: "Completed" },
];

const tile = "rounded-xl border bg-card p-4 text-left text-card-foreground shadow-xs";

export function StatsRow({
  stats,
  isLoading,
  isError,
  activeStatus,
  onSelectStatus,
  onRetry,
}: {
  stats: TaskStats | undefined;
  isLoading: boolean;
  isError: boolean;
  activeStatus: TaskStatus | null;
  onSelectStatus: (status: TaskStatus | null) => void;
  onRetry: () => void;
}) {
  const overdue = stats?.overdue ?? 0;

  const value = (n: number | undefined) =>
    isLoading ? <Skeleton className="h-8 w-10" /> : isError ? "—" : n;

  return (
    <section aria-label="Overview" className="mt-6">
      {isError ? (
        <div className="mb-2 flex justify-end">
          <Button variant="link" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {TILES.map(({ status, hint }) => {
          const Icon = STATUS_ICON[status];
          const active = activeStatus === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectStatus(active ? null : status)}
              className={cn(
                tile,
                "transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                active && "border-foreground/40 bg-muted/60",
              )}
            >
              <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                <Icon className="size-3.5" />
                {STATUS_LABEL[status]}
              </div>
              <div className="mt-3 text-2xl font-semibold tabular-nums">{value(stats?.[status])}</div>
              <div className="mt-1 text-xs text-muted-foreground">{isError ? "Couldn't load" : hint}</div>
            </button>
          );
        })}

        <div
          aria-label={`${overdue} overdue ${overdue === 1 ? "task" : "tasks"}`}
          className={cn(
            tile,
            overdue > 0 &&
              "border-amber-500/40 bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide",
              overdue > 0 ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground",
            )}
          >
            <TriangleAlert className="size-3.5" />
            Overdue
          </div>
          <div className="mt-3 text-2xl font-semibold tabular-nums">{value(stats?.overdue)}</div>
          <div className={cn("mt-1 text-xs", overdue > 0 ? "text-amber-800/80 dark:text-amber-200/80" : "text-muted-foreground")}>
            {isError ? "Couldn't load" : overdue > 0 ? "Past due and not done" : "Nothing past due"}
          </div>
        </div>
      </div>
    </section>
  );
}
