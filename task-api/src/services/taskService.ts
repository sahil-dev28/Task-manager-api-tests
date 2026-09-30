import { randomUUID } from "node:crypto";

import type {
	CreateTaskInput,
	Task,
	TaskStats,
	TaskStatus,
} from "@/schema/task";
import { paginate } from "@/utils/pagination";

let tasks: Task[] = [];

// BUG-08: the store used to return its own task objects, so a caller could
// change them directly and skip all the checks below. Reads return copies now,
// and the real objects never leave this file.
const clone = (task: Task): Task => ({ ...task });

export const getAll = (): Task[] => tasks.map(clone);

export const findById = (id: string): Task | undefined => {
	const task = tasks.find((t) => t.id === id);
	return task ? clone(task) : undefined;
};

// BUG-02: this used `status.includes(...)`, which is a substring match, so "o"
// matched todo, in_progress and done. Compare the whole status instead.
export const getByStatus = (status: string): Task[] =>
	tasks.filter((t) => t.status === status).map(clone);

export const getPaginated = (page: number, limit: number): Task[] =>
	paginate(getAll(), page, limit);

export const getStats = (): TaskStats => {
	const now = new Date();
	const counts: Record<TaskStatus, number> = {
		todo: 0,
		in_progress: 0,
		done: 0,
	};
	let overdue = 0;

	for (const t of tasks) {
		// A status that is not one of the three known ones is not counted.
		if (counts[t.status] !== undefined) counts[t.status]++;
		if (t.dueDate && t.status !== "done" && new Date(t.dueDate) < now) {
			overdue++;
		}
	}

	return { ...counts, overdue };
};

export const create = ({
	title,
	description = "",
	status = "todo",
	priority = "medium",
	dueDate = null,
}: CreateTaskInput): Task => {
	const task: Task = {
		id: randomUUID(),
		// BUG-09: the title was trimmed only to validate it and then stored raw, so
		// the spaces ended up in the store and in every response. Trim it here.
		title: title.trim(),
		description,
		status,
		priority,
		dueDate,
		// Only assign() sets this. create() never takes it from the body, same as
		// completedAt.
		assignee: null,
		completedAt: null,
		createdAt: new Date().toISOString(),
	};
	tasks.push(task);
	return clone(task);
};

// BUG-03: update used to copy every field from the body straight onto the task.
// These are the only fields a client may change. The rest belongs to the
// server: `id` and `createdAt` identify the task, and `completedAt` is set from
// the status change rather than sent in. The list lives here, not in the route,
// so it still applies to a caller that skips validation.
const WRITABLE_FIELDS = [
	"title",
	"description",
	"status",
	"priority",
	"dueDate",
] as const;

export const update = (
	id: string,
	fields: Record<string, unknown>,
): Task | null => {
	const index = tasks.findIndex((t) => t.id === id);
	const current = tasks[index];
	if (index === -1 || !current) return null;

	const patch: Partial<Task> = {};
	for (const key of WRITABLE_FIELDS) {
		// Check for undefined instead of truthiness, so `{ dueDate: null }` still
		// clears the due date instead of being ignored.
		if (fields[key] !== undefined) Object.assign(patch, { [key]: fields[key] });
	}
	if (typeof patch.title === "string") patch.title = patch.title.trim();

	const updated: Task = { ...current, ...patch };

	// BUG-05: moving to "done" through PUT left completedAt null, so the same task
	// state looked different depending on which endpoint set it. Set the timestamp
	// here too, the same way completeTask does.
	if (updated.status === "done" && current.status !== "done") {
		updated.completedAt = new Date().toISOString();
	}

	tasks[index] = updated;
	return clone(updated);
};

export const remove = (id: string): boolean => {
	const index = tasks.findIndex((t) => t.id === id);
	if (index === -1) return false;

	tasks.splice(index, 1);
	return true;
};

export const completeTask = (id: string): Task | null => {
	const index = tasks.findIndex((t) => t.id === id);
	const current = tasks[index];
	if (index === -1 || !current) return null;

	const updated: Task = {
		...current,
		// BUG-04: this used to set `priority: "medium"`, so finishing a task changed
		// how urgent it was. Leave the priority alone.
		status: "done",
		completedAt: new Date().toISOString(),
	};

	tasks[index] = updated;
	return clone(updated);
};

// Assigning has its own endpoint instead of being a normal field edit, so
// `assignee` is not in WRITABLE_FIELDS and this is the only way to set it. The
// trim stays in one place, so the store never keeps a name with spaces around it.
export const assign = (id: string, assignee: string): Task | null => {
	const index = tasks.findIndex((t) => t.id === id);
	const current = tasks[index];
	if (index === -1 || !current) return null;

	const updated: Task = { ...current, assignee: assignee.trim() };
	tasks[index] = updated;
	return clone(updated);
};

export const _reset = (): void => {
	tasks = [];
};
