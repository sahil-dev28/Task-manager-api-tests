export const taskStatuses = ["todo", "in_progress", "done"] as const;
export const taskPriorities = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

/** Nine keys, always all present. Mirrored from task-api/src/schema/task.ts. */
export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignee: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type TaskStats = Record<TaskStatus, number> & { overdue: number };

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export type UpdateTaskInput = Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}>;

export type ListTasksParams = {
  status?: TaskStatus | null;
  page?: number;
  limit?: number;
};
