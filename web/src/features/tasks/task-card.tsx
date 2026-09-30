import { Calendar, CircleCheck, Ellipsis, Pencil, Trash2, TriangleAlert, User } from "lucide-react";
import { Link, useLocation } from "react-router";

import type { Task } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, isOverdue } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { PRIORITY_CLASS, PRIORITY_ICON, PRIORITY_LABEL, STATUS_ICON, STATUS_LABEL } from "@/lib/vocab";

export function TaskCard({
  task,
  busy = false,
  onComplete,
  onEdit,
  onDelete,
}: {
  task: Task;
  busy?: boolean;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { search } = useLocation();
  const done = task.status === "done";
  const overdue = isOverdue(task);
  const StatusIcon = STATUS_ICON[task.status];
  const PriorityIcon = PRIORITY_ICON[task.priority];

  return (
    <li
      aria-busy={busy || undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-card-foreground shadow-xs transition-colors hover:border-foreground/30",
        busy && "pointer-events-none opacity-60",
      )}
    >
      <Checkbox
        checked={done}
        disabled={done || busy}
        aria-label={`Mark “${task.title}” complete`}
        onCheckedChange={() => onComplete(task)}
        className="relative z-10"
      />

      <div className="min-w-0 flex-1">
        {/* The whole card is one click target: the title link stretches over it. */}
        <Link
          to={{ pathname: `/tasks/${task.id}`, search }}
          className={cn(
            "block truncate text-sm font-medium before:absolute before:inset-0 before:content-['']",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </Link>

        {task.description && !done ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{task.description}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Badge variant="secondary">
            <StatusIcon />
            {STATUS_LABEL[task.status]}
          </Badge>

          {task.dueDate ? (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                overdue && "font-medium text-amber-600 dark:text-amber-400",
              )}
            >
              {overdue ? <TriangleAlert className="size-3.5" /> : <Calendar className="size-3.5" />}
              {overdue ? `Overdue · ${formatDate(task.dueDate)}` : formatDate(task.dueDate)}
            </span>
          ) : null}

          {task.assignee ? (
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" />
              {task.assignee}
            </span>
          ) : null}

          {done && task.completedAt ? (
            <span className="inline-flex items-center gap-1">
              <CircleCheck className="size-3.5" />
              Completed {formatDate(task.completedAt)}
            </span>
          ) : null}
        </div>
      </div>

      <span
        className={cn("inline-flex shrink-0 items-center gap-1 font-mono text-xs uppercase", PRIORITY_CLASS[task.priority])}
      >
        <PriorityIcon className="size-4" strokeWidth={2.5} />
        {PRIORITY_LABEL[task.priority]}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="More actions" className="relative z-10 shrink-0">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {!done ? (
            <DropdownMenuItem onSelect={() => onComplete(task)}>
              <CircleCheck />
              Mark complete
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={() => onEdit(task)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(task)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
