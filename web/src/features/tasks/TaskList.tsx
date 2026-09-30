import type { Task, TaskStatus } from "@/api/types";
import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

import { FilterEmpty, LoadErrorEmpty, NoTasksEmpty } from "./emptyStates";
import { TaskCard } from "./TaskCard";

/** DESIGN 4.14: title widths vary by row so the skeleton does not read as a table. */
const SKELETON_WIDTHS = ["45%", "60%", "38%", "52%", "70%"];

const TaskCardSkeleton = ({ width }: { width: string }) => (
  <div className="flex items-center gap-3 rounded-md border border-default bg-surface px-4 py-3.5 shadow-xs">
    <Skeleton className="size-[18px] rounded-full" />
    <div className="flex-1">
      <SkeletonLine width={width} />
      <div className="mt-2.5 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <SkeletonLine width={72} />
      </div>
    </div>
  </div>
);

export function TaskList({
  tasks,
  isLoading,
  isDimmed,
  isError,
  error,
  activeStatus,
  onComplete,
  onEdit,
  onDelete,
  onNewTask,
  onAddSamples,
  onShowAll,
  onRetry,
  samplesLoading = false,
  busyIds,
}: {
  tasks: Task[];
  isLoading: boolean;
  isDimmed: boolean;
  isError: boolean;
  error: string | null;
  activeStatus: TaskStatus | null;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onNewTask: () => void;
  onAddSamples: () => void;
  onShowAll: () => void;
  onRetry: () => void;
  samplesLoading?: boolean;
  busyIds?: Set<string>;
}) {
  let content;

  if (isLoading) {
    content = (
      <div aria-busy="true" aria-label="Loading tasks" className="flex flex-col gap-2">
        {SKELETON_WIDTHS.map((width, index) => (
          <TaskCardSkeleton key={index} width={width} />
        ))}
      </div>
    );
  } else if (isError) {
    content = <LoadErrorEmpty message={error} onRetry={onRetry} />;
  } else if (tasks.length === 0) {
    content = activeStatus ? (
      <FilterEmpty status={activeStatus} onShowAll={onShowAll} />
    ) : (
      <NoTasksEmpty onNewTask={onNewTask} onAddSamples={onAddSamples} samplesLoading={samplesLoading} />
    );
  } else {
    content = (
      <ul
        aria-busy={isDimmed || undefined}
        className={cn("flex flex-col gap-2 transition-opacity duration-[160ms]", isDimmed && "opacity-60")}
      >
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              busy={busyIds?.has(task.id)}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div id="tasks" className="mt-3">
      {content}
    </div>
  );
}
