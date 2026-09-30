import { CircleAlert, Layers, ListTodo, Loader2, Plus } from "lucide-react";

import type { Task, TaskStatus } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STATUS_ICON } from "@/lib/vocab";

import { useNewTask } from "./new-task-context";
import { TaskCard } from "./task-card";

const FILTER_EMPTY: Record<TaskStatus, { title: string; body: string }> = {
  todo: { title: "Nothing to do", body: "Every task is either in progress or done." },
  in_progress: { title: "Nothing in progress", body: "Edit a task to move it here." },
  done: { title: "No completed tasks yet", body: "Tasks you mark complete will show up here." },
};

export function TaskList({
  tasks,
  isLoading,
  isDimmed,
  isError,
  error,
  activeStatus,
  busyId,
  onComplete,
  onEdit,
  onDelete,
  onAddSamples,
  samplesLoading,
  onShowAll,
  onRetry,
}: {
  tasks: Task[];
  isLoading: boolean;
  isDimmed: boolean;
  isError: boolean;
  error: string | null;
  activeStatus: TaskStatus | null;
  busyId: string | null;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSamples: () => void;
  samplesLoading: boolean;
  onShowAll: () => void;
  onRetry: () => void;
}) {
  const openNewTask = useNewTask();

  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading tasks" className="mt-3 flex flex-col gap-2">
        {["45%", "60%", "38%", "52%", "70%"].map((width) => (
          <div key={width} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5">
            <Skeleton className="size-4 rounded-sm" />
            <div className="flex-1">
              <Skeleton className="h-3.5" style={{ width }} />
              <div className="mt-2.5 flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Empty className="mt-3 border py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <CircleAlert />
          </EmptyMedia>
          <EmptyTitle>Couldn't load tasks</EmptyTitle>
          <EmptyDescription>
            {error ? `The server returned an error: ${error}` : "Something went wrong while loading tasks."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (tasks.length === 0 && activeStatus) {
    const Icon = STATUS_ICON[activeStatus];
    const copy = FILTER_EMPTY[activeStatus];
    return (
      <Empty className="mt-3 border py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
          <EmptyTitle>{copy.title}</EmptyTitle>
          <EmptyDescription>{copy.body}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={onShowAll}>
            Show all tasks
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (tasks.length === 0) {
    return (
      <Empty className="mt-3 border py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListTodo />
          </EmptyMedia>
          <EmptyTitle>No tasks yet</EmptyTitle>
          <EmptyDescription>
            The API keeps tasks in memory, so a fresh server always starts empty. Add your first task,
            or load a few examples to look around.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button onClick={openNewTask}>
            <Plus data-icon="inline-start" />
            New task
          </Button>
          <Button variant="outline" disabled={samplesLoading} onClick={onAddSamples}>
            {samplesLoading ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Layers data-icon="inline-start" />}
            Add sample tasks
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ul
      aria-busy={isDimmed || undefined}
      className={cn("mt-3 flex flex-col gap-2 transition-opacity", isDimmed && "opacity-60")}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          busy={busyId === task.id}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
