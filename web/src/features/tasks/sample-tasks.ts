import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { assignTask, completeTask, createTask } from "@/api/tasks";
import type { CreateTaskInput } from "@/api/types";
import { toDateInputValue, toDueDateIso } from "@/lib/dates";

import { failureMessage, invalidateTasks } from "./mutations";

const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDueDateIso(toDateInputValue(d.toISOString()));
};

const SAMPLES: () => CreateTaskInput[] = () => [
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

/** Seeds five tasks so an empty in-memory API has something to show, including one overdue and one done. */
async function addSampleTasks() {
  const ids: string[] = [];
  for (const input of SAMPLES()) ids.push((await createTask(input)).id);
  await completeTask(ids[4]!);
  await assignTask(ids[0]!, "Priya Sharma");
  await assignTask(ids[1]!, "Alex Chen");
}

export function useAddSampleTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSampleTasks,
    onSuccess: () => toast.success("Added 5 sample tasks"),
    onError: (error) => toast.error("Couldn't add all sample tasks", { description: failureMessage(error) }),
    onSettled: () => invalidateTasks(queryClient),
  });
}
