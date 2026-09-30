import { useQueryClient } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { ApiError, NetworkError } from "@/api/client";
import { completeTask, createTask, updateTask } from "@/api/tasks";
import { taskPriorities, taskStatuses, type Task, type TaskPriority, type TaskStatus } from "@/api/types";
import { useToast } from "@/app/toast";
import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { toDateInputValue, toDueDateIso } from "@/lib/dates";
import { PRIORITY_ICON, STATUS_ICON, STATUS_LABEL } from "@/lib/vocab";

import { describeFailure, invalidateTasks } from "./mutations";

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;

const PRIORITY_OPTION: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };
const PRIORITY_TONE: Record<TaskPriority, string> = {
  low: "text-secondary",
  medium: "text-warning",
  high: "text-danger-text",
};
const STATUS_TONE: Record<TaskStatus, string> = {
  todo: "text-secondary",
  in_progress: "text-blue-text",
  done: "text-success",
};

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

const todayValue = () => toDateInputValue(new Date().toISOString());

type Values = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

const valuesOf = (task: Task | null | undefined): Values => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  status: task?.status ?? "todo",
  priority: task?.priority ?? "medium",
  dueDate: toDateInputValue(task?.dueDate ?? null),
});

/**
 * DESIGN 5.3 and 5.4: create and edit share one form. Everything typed waits
 * for the server (DESIGN 7.1); a rejected request keeps the modal open with
 * the API's own message in the banner.
 */
export function TaskFormModal({
  open,
  task = null,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Editing when set; creating when null. */
  task?: Task | null;
  onClose: () => void;
  onSaved: (task: Task, mode: "create" | "edit") => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const editing = task !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit task" : "New task"}
      initialFocus={titleRef}
      footer={
        <>
          <span className="hidden text-caption text-tertiary lg:block">
            {isMac ? "⌘ Enter" : "Ctrl Enter"} to save
          </span>
          <span className="ml-auto flex items-center gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" form="task-form" loading={submitting}>
              {editing ? "Save changes" : "Create task"}
            </Button>
          </span>
        </>
      }
    >
      <TaskForm
        task={task}
        titleRef={titleRef}
        submitting={submitting}
        setSubmitting={setSubmitting}
        onClose={onClose}
        onSaved={onSaved}
      />
    </Modal>
  );
}

// Mounted fresh on every open (Modal renders nothing while closed), so the
// state below always starts from the task being edited.
function TaskForm({
  task,
  titleRef,
  submitting,
  setSubmitting,
  onClose,
  onSaved,
}: {
  task: Task | null;
  titleRef: React.RefObject<HTMLInputElement | null>;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  onClose: () => void;
  onSaved: (task: Task, mode: "create" | "edit") => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const id = useId();

  const [values, setValues] = useState<Values>(() => valuesOf(task));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === "title" && String(value).trim()) setTitleError(null);
  };

  const pastDue = values.dueDate !== "" && values.dueDate < todayValue();

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (submitting) return;

    const title = values.title.trim();
    if (!title) {
      setTitleError("Add a title to create the task.");
      titleRef.current?.focus();
      return;
    }

    const description = values.description.trim();
    const dueDate = values.dueDate ? toDueDateIso(values.dueDate) : null;

    setSubmitting(true);
    setBanner(null);
    try {
      if (task) {
        const unchanged =
          title === task.title &&
          description === task.description &&
          values.status === task.status &&
          values.priority === task.priority &&
          dueDate === task.dueDate;
        if (unchanged) {
          onClose();
          return;
        }
        // PUT stamps completedAt itself when the status moves to done, so one
        // request covers the whole edit.
        const saved = await updateTask(task.id, {
          title,
          description,
          status: values.status,
          priority: values.priority,
          dueDate,
        });
        await invalidateTasks(queryClient);
        onSaved(saved, "edit");
        return;
      }

      // DESIGN 5.3: POST does not stamp completedAt, so a task created as done
      // is created as todo and completed in a second step.
      const created = await createTask({
        title,
        description,
        status: values.status === "done" ? "todo" : values.status,
        priority: values.priority,
        ...(dueDate ? { dueDate } : {}),
      });
      let final = created;
      if (values.status === "done") {
        try {
          final = await completeTask(created.id);
        } catch (error) {
          toast.error("Task created, but couldn't mark it complete", { detail: describeFailure(error).message });
        }
      }
      await invalidateTasks(queryClient);
      onSaved(final, "create");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const gone = describeFailure(error);
        toast.info(gone.message, { detail: gone.detail });
        await invalidateTasks(queryClient);
        onClose();
        return;
      }
      setBanner(
        error instanceof NetworkError
          ? "Couldn't reach the server. Check that the API is running on localhost:3000."
          : describeFailure(error).message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  }

  const StatusIcon = STATUS_ICON[values.status];
  const PriorityIcon = PRIORITY_ICON[values.priority];

  return (
    <form id="task-form" onSubmit={submit} onKeyDown={onKeyDown} className="flex flex-col gap-5" noValidate>
      {banner ? (
        <p role="alert" className="flex items-start gap-2 rounded-md bg-danger-subtle px-3 py-2.5 text-small text-danger-subtle-text">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {banner}
        </p>
      ) : null}

      <Field
        id={`${id}-title`}
        label="Title"
        error={titleError}
        counter={
          values.title.length >= 100 ? `${values.title.length}/${TITLE_MAX}` : undefined
        }
      >
        {(field) => (
          <TextInput
            ref={titleRef}
            id={field.id}
            value={values.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="What needs to be done?"
            maxLength={TITLE_MAX}
            readOnly={submitting}
            invalid={field.invalid}
            aria-describedby={field.describedBy}
            autoComplete="off"
          />
        )}
      </Field>

      <Field
        id={`${id}-description`}
        label="Description"
        counter={
          values.description.length >= 1800 ? `${values.description.length}/${DESCRIPTION_MAX}` : undefined
        }
      >
        {(field) => (
          <Textarea
            id={field.id}
            value={values.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="Add details, links or context (optional)"
            maxLength={DESCRIPTION_MAX}
            readOnly={submitting}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-status`} label="Status">
          {(field) => (
            <Select
              id={field.id}
              value={values.status}
              onChange={(event) => set("status", event.target.value as TaskStatus)}
              disabled={submitting}
              icon={StatusIcon}
              iconClassName={STATUS_TONE[values.status]}
            >
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field id={`${id}-priority`} label="Priority">
          {(field) => (
            <Select
              id={field.id}
              value={values.priority}
              onChange={(event) => set("priority", event.target.value as TaskPriority)}
              disabled={submitting}
              icon={PriorityIcon}
              iconClassName={PRIORITY_TONE[values.priority]}
            >
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_OPTION[priority]}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field
        id={`${id}-due`}
        label="Due date"
        warning={pastDue ? "This date is in the past, so the task will show as overdue." : undefined}
      >
        {(field) => (
          <DateInput
            id={field.id}
            value={values.dueDate}
            onChange={(value) => set("dueDate", value)}
            onClear={() => set("dueDate", "")}
            readOnly={submitting}
            aria-describedby={field.describedBy}
          />
        )}
      </Field>
    </form>
  );
}

