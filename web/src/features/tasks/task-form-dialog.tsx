import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { completeTask, createTask, updateTask } from "@/api/tasks";
import { taskPriorities, taskStatuses, type Task } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue, toDueDateIso } from "@/lib/dates";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/vocab";

import { failureMessage, invalidateTasks, isGone } from "./mutations";

const schema = z.object({
  title: z.string().trim().min(1, "Add a title to save the task.").max(120, "Keep the title under 120 characters."),
  description: z.string().trim().max(2000, "Keep the description under 2000 characters."),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  dueDate: z.string(),
});

type FormValues = z.infer<typeof schema>;

const today = () => toDateInputValue(new Date().toISOString());

/** One dialog for both create and edit: pass a task to edit it. */
export function TaskFormDialog({
  open,
  task = null,
  onOpenChange,
}: {
  open: boolean;
  task?: Task | null;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = task !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {editing ? "Changes are saved when you submit." : "Only a title is required."}
          </DialogDescription>
        </DialogHeader>
        {open ? <TaskForm task={task} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

// Mounted fresh each time the dialog opens, so the form always starts from the task in hand.
function TaskForm({ task, onDone }: { task: Task | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "todo",
      priority: task?.priority ?? "medium",
      dueDate: toDateInputValue(task?.dueDate ?? null),
    },
  });
  const { isSubmitting, errors } = form.formState;
  const dueDate = form.watch("dueDate");
  const pastDue = dueDate !== "" && dueDate < today();

  async function onSubmit(values: FormValues) {
    const due = values.dueDate ? toDueDateIso(values.dueDate) : null;
    try {
      if (task) {
        await updateTask(task.id, {
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          dueDate: due,
        });
        toast.success("Changes saved");
      } else {
        // POST does not stamp completedAt, so a task created as done is created
        // as todo and completed in a second step.
        const created = await createTask({
          title: values.title,
          description: values.description,
          status: values.status === "done" ? "todo" : values.status,
          priority: values.priority,
          ...(due ? { dueDate: due } : {}),
        });
        if (values.status === "done") await completeTask(created.id);
        toast.success("Task created");
      }
      await invalidateTasks(queryClient);
      onDone();
    } catch (error) {
      if (isGone(error)) {
        toast.info("This task no longer exists", { description: "The server may have restarted." });
        await invalidateTasks(queryClient);
        onDone();
        return;
      }
      form.setError("root", { message: failureMessage(error) });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {errors.root ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </p>
      ) : null}

      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                {...field}
                id="task-title"
                placeholder="What needs to be done?"
                maxLength={120}
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <Textarea
                {...field}
                id="task-description"
                rows={4}
                placeholder="Add details, links or context (optional)"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="task-status">Status</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="task-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="task-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskPriorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {PRIORITY_LABEL[priority]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <Controller
          name="dueDate"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="task-due">Due date</FieldLabel>
              <Input {...field} id="task-due" type="date" />
              {pastDue ? (
                <FieldDescription className="text-amber-600 dark:text-amber-400">
                  This date is in the past, so the task will show as overdue.
                </FieldDescription>
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
          {task ? "Save changes" : "Create task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
