import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { Task } from "@/api/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { failureMessage, isGone, useDeleteTask } from "./mutations";

const shorten = (title: string) => (title.length > 60 ? `${title.slice(0, 60)}…` : title);

export function DeleteDialog({
  task,
  onOpenChange,
  onDeleted,
}: {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (task: Task) => void;
}) {
  const remove = useDeleteTask();
  const [error, setError] = useState<string | null>(null);

  function close() {
    setError(null);
    onOpenChange(false);
  }

  function confirm() {
    if (!task) return;
    setError(null);
    remove.mutate(task, {
      onSuccess: () => {
        toast.success("Task deleted");
        onDeleted?.(task);
        close();
      },
      onError: (failure) => {
        if (isGone(failure)) {
          toast.info("This task was already deleted");
          onDeleted?.(task);
          close();
          return;
        }
        setError(failureMessage(failure));
      },
    });
  }

  return (
    <AlertDialog open={task !== null} onOpenChange={(open) => !open && !remove.isPending && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            “{shorten(task?.title ?? "")}” will be permanently removed. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={remove.isPending} onClick={confirm}>
            {remove.isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
            Delete task
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
