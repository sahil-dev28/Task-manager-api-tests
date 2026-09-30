import { useMutation, useQueryClient } from "@tanstack/react-query";

import { assignTask, completeTask, createTask } from "@/api/tasks";
import type { CreateTaskInput } from "@/api/types";
import { useToast } from "@/app/toast";
import { toDateInputValue, toDueDateIso } from "@/lib/dates";

import { describeFailure, invalidateTasks } from "./mutations";

const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDueDateIso(toDateInputValue(d.toISOString()));
};

/** DESIGN 6.2, in the order listed there. */
function sampleInputs(): CreateTaskInput[] {
  return [
    {
      title: "Draft the Q4 roadmap review",
      description: "Summarize what shipped, what slipped and why.",
      status: "in_progress",
      priority: "high",
      dueDate: daysFromNow(0),
    },
    { title: "Fix the flaky checkout test", status: "todo", priority: "high", dueDate: daysFromNow(-1) },
    {
      title: "Update the onboarding checklist",
      description: "Add the new VPN setup steps.",
      status: "todo",
      priority: "medium",
      dueDate: daysFromNow(3),
    },
    { title: "Book a venue for the team offsite", status: "todo", priority: "low" },
    {
      title: "Write release notes for v2.4",
      description: "Cover the new status filter and the dark theme.",
      status: "todo",
      priority: "medium",
      dueDate: daysFromNow(-1),
    },
  ];
}

class SampleTasksError extends Error {
  constructor(
    readonly added: number,
    cause: unknown,
  ) {
    super(describeFailure(cause).message);
  }
}

async function addSampleTasks(): Promise<void> {
  const ids: string[] = [];
  try {
    for (const input of sampleInputs()) ids.push((await createTask(input)).id);
    await completeTask(ids[4]!);
    await assignTask(ids[0]!, "Priya Sharma");
    await assignTask(ids[1]!, "Alex Chen");
  } catch (error) {
    throw new SampleTasksError(ids.length, error);
  }
}

export function useAddSampleTasks() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: addSampleTasks,
    onSuccess: () => toast.success("Added 5 sample tasks"),
    onError: (error) => {
      const added = error instanceof SampleTasksError ? error.added : 0;
      toast.error("Couldn't add all sample tasks", { detail: `${added} of 5 were added. ${error.message}` });
    },
    onSettled: () => invalidateTasks(queryClient),
  });
}
