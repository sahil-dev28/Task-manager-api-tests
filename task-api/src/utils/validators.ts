import { taskPriorities, taskStatuses } from "@/schema/task";

const VALID_STATUSES: readonly string[] = taskStatuses;
const VALID_PRIORITIES: readonly string[] = taskPriorities;

// BUG-10: the message said ISO date string, but the check was just
// `Date.parse`, which also accepts formats like "January 1, 2020". Check the
// ISO 8601 shape first, then check it is a real date, so "2020-13-45" is
// rejected too.
const ISO_DATE =
	/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

const isIsoDate = (value: unknown): boolean =>
	typeof value === "string" &&
	ISO_DATE.test(value) &&
	!Number.isNaN(Date.parse(value));

/** A request body, before anything in it is trusted. */
export type ValidationBody = Record<string, unknown>;

/** The error message, or null when the body is fine. */
export type ValidationError = string | null;

export const validateCreateTask = (body: ValidationBody): ValidationError => {
	if (
		!body.title ||
		typeof body.title !== "string" ||
		body.title.trim() === ""
	) {
		return "title is required and must be a non-empty string";
	}
	if (body.status && !VALID_STATUSES.includes(body.status as string)) {
		return `status must be one of: ${VALID_STATUSES.join(", ")}`;
	}
	if (body.priority && !VALID_PRIORITIES.includes(body.priority as string)) {
		return `priority must be one of: ${VALID_PRIORITIES.join(", ")}`;
	}
	if (body.dueDate && !isIsoDate(body.dueDate)) {
		return "dueDate must be a valid ISO date string";
	}
	return null;
};

export const validateUpdateTask = (body: ValidationBody): ValidationError => {
	if (
		body.title !== undefined &&
		(typeof body.title !== "string" || body.title.trim() === "")
	) {
		return "title must be a non-empty string";
	}
	if (body.status && !VALID_STATUSES.includes(body.status as string)) {
		return `status must be one of: ${VALID_STATUSES.join(", ")}`;
	}
	if (body.priority && !VALID_PRIORITIES.includes(body.priority as string)) {
		return `priority must be one of: ${VALID_PRIORITIES.join(", ")}`;
	}
	if (body.dueDate && !isIsoDate(body.dueDate)) {
		return "dueDate must be a valid ISO date string";
	}
	return null;
};

// Same rule as `title` in validateCreateTask: a non-empty string once trimmed.
// There is no list of users to look the name up in, so this only checks the
// shape, not that the person exists.
export const validateAssignee = (body: ValidationBody): ValidationError => {
	if (
		!body.assignee ||
		typeof body.assignee !== "string" ||
		body.assignee.trim() === ""
	) {
		return "assignee is required and must be a non-empty string";
	}
	return null;
};
