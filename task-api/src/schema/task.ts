// Task types, plus the allowed values for status and priority. The lists live
// here and are imported everywhere else instead of being written out again, so
// `utils/validators.ts` and `services/taskService.ts` cannot go out of sync.

export const taskStatuses = ["todo", "in_progress", "done"] as const;
export const taskPriorities = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

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

export type AssignTaskInput = { assignee: string };
