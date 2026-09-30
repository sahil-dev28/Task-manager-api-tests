import type { Task, TaskStats } from "@/api/types";

let seq = 0;

export function makeTask(overrides: Partial<Task> = {}): Task {
  seq += 1;
  return {
    id: `task-${seq}`,
    title: `Task ${seq}`,
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: null,
    assignee: null,
    completedAt: null,
    createdAt: new Date(2026, 8, 30, 9, 0).toISOString(),
    ...overrides,
  };
}

export const makeStats = (overrides: Partial<TaskStats> = {}): TaskStats => ({
  todo: 0,
  in_progress: 0,
  done: 0,
  overdue: 0,
  ...overrides,
});
