import { Circle, CircleCheck, CircleDashed, TriangleAlert } from "lucide-react";

import type { TaskStats, TaskStatus } from "@/api/types";

import { StatTile } from "./StatTile";

const TILES = [
  { status: "todo" as const, icon: Circle, label: "To do", footnote: "NOT STARTED" },
  { status: "in_progress" as const, icon: CircleDashed, label: "In progress", footnote: "BEING WORKED ON" },
  { status: "done" as const, icon: CircleCheck, label: "Done", footnote: "COMPLETED" },
];

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

  return (
    <section aria-label="Overview" className="mt-6">
      {isError ? (
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={onRetry} className="text-caption text-accent-text underline">
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {TILES.map((tile) => (
          <StatTile
            key={tile.status}
            icon={tile.icon}
            label={tile.label}
            value={stats?.[tile.status]}
            footnote={tile.footnote}
            selected={activeStatus === tile.status}
            onSelect={() => onSelectStatus(activeStatus === tile.status ? null : tile.status)}
            loading={isLoading}
            error={isError}
          />
        ))}

        <StatTile
          // DESIGN 4.11: overdue is never clickable — the API has no overdue filter,
          // and filtering one page client-side would lie about the result set.
          icon={overdue > 0 ? TriangleAlert : CircleCheck}
          label="Overdue"
          value={stats?.overdue}
          footnote={overdue > 0 ? "PAST DUE AND NOT DONE" : "NOTHING PAST DUE"}
          tone={overdue > 0 ? "warning" : "default"}
          loading={isLoading}
          error={isError}
          ariaLabel={
            stats ? `${overdue} overdue task${overdue === 1 ? "" : "s"}, past due and not done` : undefined
          }
        />
      </div>
    </section>
  );
}
