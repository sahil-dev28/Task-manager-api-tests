import { Calendar, Check, CircleCheck, Ellipsis, TriangleAlert } from "lucide-react";
import { Link } from "react-router";

import type { Task } from "@/api/types";
import { AssigneeChip } from "@/components/ui/AssigneeChip";
import { IconButton } from "@/components/ui/IconButton";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { formatRelativeDate, isOverdue } from "@/lib/dates";
import { taskAccessibleName } from "@/lib/taskLabel";

export function TaskCard({
  task,
  now = new Date(),
  onComplete,
  onOpenMenu,
  busy = false,
  selected = false,
}: {
  task: Task;
  now?: Date;
  onComplete: (task: Task) => void;
  onOpenMenu?: (task: Task) => void;
  busy?: boolean;
  selected?: boolean;
}) {
  const done = task.status === "done";
  const overdue = isOverdue(task, now);

  return (
    <article
      aria-busy={busy || undefined}
      className={cn(
        "group relative flex min-h-16 items-center rounded-md border bg-surface px-4 py-3.5 shadow-xs",
        "transition-[border-color,box-shadow] duration-[160ms] hover:border-strong hover:shadow-sm",
        selected ? "border-accent/40 bg-accent-subtle/50" : "border-default",
        busy && "pointer-events-none opacity-60",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-disabled={done || busy || undefined}
        aria-label={`Mark “${task.title}” complete`}
        title={done ? "Completed. Change status from the task menu to reopen." : undefined}
        onClick={() => !done && !busy && onComplete(task)}
        className="group/checkbox z-10 -m-[9px] grid size-9 shrink-0 place-items-center"
      >
        <span
          aria-hidden
          className={cn(
            "grid size-[18px] place-items-center rounded-full border-[1.5px] transition-colors duration-[160ms]",
            done
              ? "border-success bg-success text-surface"
              : "border-input group-hover/checkbox:border-accent",
          )}
        >
          {done ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
      </button>

      <div className="ml-3 min-w-0 flex-1">
        <Link
          to={`/tasks/${task.id}`}
          aria-label={taskAccessibleName(task, now)}
          className={cn(
            "block truncate text-body-strong before:absolute before:inset-0 before:content-['']",
            done ? "text-secondary line-through decoration-strong" : "text-primary",
          )}
        >
          {task.title}
        </Link>

        {task.description && !done ? (
          <p data-description className="mt-0.5 truncate text-small text-secondary">
            {task.description}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />

          {task.dueDate ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-mono uppercase",
                overdue ? "text-warning" : "text-secondary",
              )}
            >
              {overdue ? (
                <TriangleAlert aria-hidden className="size-3.5" strokeWidth={1.75} />
              ) : (
                <Calendar aria-hidden className="size-3.5" strokeWidth={1.75} />
              )}
              {overdue ? `OVERDUE · ${formatRelativeDate(task.dueDate, now)}` : formatRelativeDate(task.dueDate, now)}
            </span>
          ) : null}

          {task.assignee ? <AssigneeChip name={task.assignee} /> : null}

          {done && task.completedAt ? (
            <span className="inline-flex items-center gap-1 font-mono text-mono uppercase text-tertiary">
              <CircleCheck aria-hidden className="size-3.5" strokeWidth={1.75} />
              COMPLETED {formatRelativeDate(task.completedAt, now)}
            </span>
          ) : null}
        </div>
      </div>

      <span className="pointer-events-none ml-4">
        <PriorityIndicator priority={task.priority} />
      </span>

      {onOpenMenu ? (
        <IconButton
          label="More actions"
          icon={Ellipsis}
          size="sm"
          disabled={busy}
          onClick={() => onOpenMenu(task)}
          className="z-10 ml-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        />
      ) : null}
    </article>
  );
}
