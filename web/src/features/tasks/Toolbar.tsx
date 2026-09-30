import type { TaskStats, TaskStatus } from "@/api/types";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export function Toolbar({
  status,
  stats,
  onStatusChange,
  range,
  disabled = false,
}: {
  status: TaskStatus | null;
  stats: TaskStats | undefined;
  onStatusChange: (status: TaskStatus | null) => void;
  range: string | null;
  disabled?: boolean;
}) {
  const total = stats ? stats.todo + stats.in_progress + stats.done : null;

  return (
    <div className="mt-10 flex items-center justify-between gap-3">
      <SegmentedControl
        label="Filter by status"
        value={status ?? "all"}
        disabled={disabled}
        onChange={(value) => onStatusChange(value === "all" ? null : (value as TaskStatus))}
        options={[
          { value: "all", label: "All", count: total },
          { value: "todo", label: "To do", count: stats?.todo ?? null },
          { value: "in_progress", label: "In progress", count: stats?.in_progress ?? null },
          { value: "done", label: "Done", count: stats?.done ?? null },
        ]}
      />
      {range ? <span className="hidden font-mono text-mono text-tertiary sm:block">{range}</span> : null}
    </div>
  );
}
