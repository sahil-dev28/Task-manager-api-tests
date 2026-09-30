import { Circle, CircleAlert, CircleCheck, CircleDashed, Layers, ListTodo, Plus } from "lucide-react";

import type { TaskStatus } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const NoTasksEmpty = ({
  onNewTask,
  onAddSamples,
  samplesLoading = false,
}: {
  onNewTask: () => void;
  onAddSamples: () => void;
  samplesLoading?: boolean;
}) => (
  <EmptyState
    icon={ListTodo}
    title="No tasks yet"
    body="The API keeps tasks in memory, so a fresh server always starts empty. Add your first task, or load a few examples to look around."
    actions={
      <>
        <Button variant="primary" size="lg" leadingIcon={Plus} onClick={onNewTask}>
          New task
        </Button>
        <Button size="lg" leadingIcon={Layers} loading={samplesLoading} onClick={onAddSamples}>
          Add sample tasks
        </Button>
      </>
    }
  />
);

const FILTER_COPY: Record<TaskStatus, { icon: typeof Circle; title: string; body: string }> = {
  todo: { icon: Circle, title: "Nothing to do", body: "Every task is either in progress or done." },
  in_progress: {
    icon: CircleDashed,
    title: "Nothing in progress",
    body: "Move a task here from its menu with Set status.",
  },
  done: {
    icon: CircleCheck,
    title: "No completed tasks yet",
    body: "Tasks you mark complete will show up here.",
  },
};

export const FilterEmpty = ({ status, onShowAll }: { status: TaskStatus; onShowAll: () => void }) => {
  const copy = FILTER_COPY[status];
  return (
    <EmptyState
      icon={copy.icon}
      title={copy.title}
      body={copy.body}
      actions={<Button onClick={onShowAll}>Show all tasks</Button>}
    />
  );
};

export const LoadErrorEmpty = ({ message, onRetry }: { message: string | null; onRetry: () => void }) => (
  <EmptyState
    tone="error"
    icon={CircleAlert}
    title="Couldn't load tasks"
    body={
      message ? `The server returned an error: ${message}` : "Something went wrong while loading tasks."
    }
    actions={<Button onClick={onRetry}>Try again</Button>}
  />
);
