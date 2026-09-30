import { Router } from "express";

import {
	assignTask,
	completeTask,
	createTask,
	deleteTask,
	getTaskStats,
	getTasks,
	updateTask,
} from "@/controller/taskController";
import { validateBody } from "@/middleware/validationMiddleware";
import {
	validateAssignee,
	validateCreateTask,
	validateUpdateTask,
} from "@/utils/validators";

export const taskRouter: Router = Router();

// Declared before "/:id" so "stats" is not read as an id.
taskRouter.route("/stats").get(getTaskStats);

taskRouter
	.route("/")
	.get(getTasks)
	.post(validateBody(validateCreateTask), createTask);

taskRouter
	.route("/:id")
	.put(validateBody(validateUpdateTask), updateTask)
	.delete(deleteTask);

taskRouter.route("/:id/complete").patch(completeTask);

// Validation runs before the lookup, so a bad body gives 400 whether the id
// exists or not. Same order as PUT /:id.
taskRouter
	.route("/:id/assign")
	.patch(validateBody(validateAssignee), assignTask);
