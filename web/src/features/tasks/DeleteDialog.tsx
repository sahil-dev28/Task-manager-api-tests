import { useState } from "react";

import { ApiError } from "@/api/client";
import type { Task } from "@/api/types";
import { useToast } from "@/app/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { describeFailure, useDeleteTask } from "./mutations";

const shorten = (title: string) => (title.length > 60 ? `${title.slice(0, 60)}…` : title);

/** DESIGN 5.6. Not optimistic: the card leaves only once the server says 204. */
export function DeleteDialog({
  task,
  onClose,
  onDeleted,
}: {
  task: Task | null;
  onClose: () => void;
  onDeleted: (task: Task) => void;
}) {
  const toast = useToast();
  const remove = useDeleteTask();
  const [error, setError] = useState<string | null>(null);

  function close() {
    setError(null);
    onClose();
  }

  function confirm() {
    if (!task) return;
    setError(null);
    remove.mutate(task, {
      onSuccess: () => {
        toast.success("Task deleted");
        onDeleted(task);
        close();
      },
      onError: (failure) => {
        if (failure instanceof ApiError && failure.status === 404) {
          toast.info("This task was already deleted");
          onDeleted(task);
          close();
          return;
        }
        setError(describeFailure(failure).message);
      },
    });
  }

  return (
    <ConfirmDialog
      open={task !== null}
      title="Delete this task?"
      body={`“${shorten(task?.title ?? "")}” will be permanently removed. This can't be undone.`}
      confirmLabel="Delete task"
      onCancel={close}
      onConfirm={confirm}
      loading={remove.isPending}
      error={error}
    />
  );
}
