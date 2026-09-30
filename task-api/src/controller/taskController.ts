import type { Request, Response } from "express";

import type { AssignTaskInput, CreateTaskInput } from "@/schema/task";
import * as taskService from "@/services/taskService";
import { paginate } from "@/utils/pagination";

const NOT_FOUND = "Task not found";

const failed = (error: unknown): string =>
	error instanceof Error ? error.message : "Unknown error";

const params = (req: Request): { id: string } => req.params as { id: string };

export const getTasks = (req: Request, res: Response): void => {
	try {
		const { status, page, limit } = req.query;

		const filtered =
			typeof status === "string"
				? taskService.getByStatus(status)
				: taskService.getAll();

		// BUG-06: filtering and paging used to be an if/else, so page and limit were
		// dropped whenever status was given. They are separate steps now and work
		// together.
		if (page === undefined && limit === undefined) {
			res.status(200).json(filtered);
			return;
		}

		const pageNum = Number.parseInt(String(page), 10) || 1;
		const limitNum = Number.parseInt(String(limit), 10) || 10;

		res.status(200).json(paginate(filtered, pageNum, limitNum));
	} catch (error) {
		res.status(400).json({ error: failed(error) });
	}
};

export const getTaskStats = (_req: Request, res: Response): void => {
	try {
		res.status(200).json(taskService.getStats());
	} catch (error) {
		res.status(400).json({ error: failed(error) });
	}
};

export const createTask = (req: Request, res: Response): void => {
	try {
		// The route already ran validateBody, so the body has the right shape here.
		const task = taskService.create(req.body as CreateTaskInput);
		res.status(201).json(task);
	} catch (error) {
		res.status(400).json({ error: failed(error) });
	}
};

export const updateTask = (req: Request, res: Response): void => {
	try {
		const task = taskService.update(
			params(req).id,
			(req.body ?? {}) as Record<string, unknown>,
		);

		if (!task) {
			res.status(404).json({ error: NOT_FOUND });
			return;
		}

		res.status(200).json(task);
	} catch (error) {
		res.status(400).json({ error: failed(error) });
	}
};

export const deleteTask = (req: Request, res: Response): void => {
	try {
		if (!taskService.remove(params(req).id)) {
			res.status(404).json({ error: NOT_FOUND });
			return;
		}

		res.status(204).send();
	} catch (error) {
		res.status(400).json({ error: failed(error) });
	}
};

export const completeTask = (req: Request, res: Response): void => {
	try {
		const task = taskService.completeTask(params(req).id);

		if (!task) {
			res.status(404).json({ error: NOT_FOUND });
			return;
		}

		res.status(200).json(task);
	} catch (error) {
		res.status(400).json({ error: failed(error) });
	}
};

export const assignTask = (req: Request, res: Response): void => {
	try {
		// Reassigning is allowed, so a task that already has an assignee is
		// overwritten instead of rejected.
		const { assignee } = req.body as AssignTaskInput;
		const task = taskService.assign(params(req).id, assignee);

		if (!task) {
			res.status(404).json({ error: NOT_FOUND });
			return;
		}

		res.status(200).json(task);
	} catch (error) {
		res.status(400).json({ error: failed(error) });
	}
};
