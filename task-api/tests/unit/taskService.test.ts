import type { Task, TaskStatus } from "@/schema/task";
import * as service from "@/services/taskService";

const PAST = "2020-01-01T00:00:00.000Z";
const FUTURE = "2999-01-01T00:00:00.000Z";
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const UUID =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Seeds a fixed store: 3 todo, 1 in_progress, 1 done.
// T2 and T5 are past due, but T5 is done, so only T2 counts as overdue.
const seed = () => ({
	t1: service.create({
		title: "T1",
		status: "todo",
		priority: "high",
		dueDate: FUTURE,
	}),
	t2: service.create({
		title: "T2",
		status: "todo",
		priority: "low",
		dueDate: PAST,
	}),
	t3: service.create({
		title: "T3",
		status: "in_progress",
		priority: "medium",
	}),
	t4: service.create({ title: "T4" }),
	t5: service.create({
		title: "T5",
		status: "done",
		priority: "high",
		dueDate: PAST,
	}),
});

// findById returns `Task | undefined`, and the fixtures below always exist, so
// this keeps the tests about behaviour instead of about narrowing the type.
const found = (id: string): Task => {
	const task = service.findById(id);
	if (!task) throw new Error(`expected a task with id ${id}`);
	return task;
};

beforeEach(() => {
	service._reset();
});

describe("getAll", () => {
	it("returns an empty array when the store is empty", () => {
		expect(service.getAll()).toEqual([]);
	});

	it("returns every task in insertion order", () => {
		seed();
		expect(service.getAll().map((t) => t.title)).toEqual([
			"T1",
			"T2",
			"T3",
			"T4",
			"T5",
		]);
	});

	it("returns a new array, so pushing to the result does not grow the store", () => {
		seed();
		service.getAll().push({ title: "injected" } as unknown as Task);
		expect(service.getAll()).toHaveLength(5);
	});

	// BUG-08 (fixed): getAll copied the array but not the tasks inside it, so a
	// caller could change the store's own objects.
	it("does not expose the stored task objects for mutation", () => {
		seed();
		service.getAll()[0].title = "hijacked";
		expect(service.getAll()[0].title).toBe("T1");
	});
});

describe("findById", () => {
	it("returns the task with the matching id", () => {
		const { t3 } = seed();
		expect(service.findById(t3.id)).toMatchObject({
			title: "T3",
			status: "in_progress",
		});
	});

	it("returns undefined for an id that does not exist", () => {
		seed();
		expect(service.findById("no-such-id")).toBeUndefined();
	});
});

describe("getByStatus", () => {
	it("returns only the tasks with the given status", () => {
		seed();
		expect(service.getByStatus("todo").map((t) => t.title)).toEqual([
			"T1",
			"T2",
			"T4",
		]);
	});

	it("returns an empty array when no task has that status", () => {
		seed();
		expect(service.getByStatus("archived")).toEqual([]);
	});

	// BUG-02 (fixed): getByStatus used String.prototype.includes, so it matched
	// substrings instead of whole statuses. "o" is in all three.
	it("does not match a status fragment", () => {
		seed();
		expect(service.getByStatus("o")).toEqual([]);
	});
});

describe("getPaginated", () => {
	// BUG-01 (fixed): the offset was page * limit, so page 1 skipped the first
	// page of results. It is (page - 1) * limit now.
	it("returns the first page for page 1", () => {
		seed();
		expect(service.getPaginated(1, 2).map((t) => t.title)).toEqual([
			"T1",
			"T2",
		]);
	});

	it("returns the second page for page 2", () => {
		seed();
		expect(service.getPaginated(2, 2).map((t) => t.title)).toEqual([
			"T3",
			"T4",
		]);
	});

	it("returns an empty array for a page past the end of the store", () => {
		seed();
		expect(service.getPaginated(99, 10)).toEqual([]);
	});
});

describe("getStats", () => {
	it("returns zeroed counts for an empty store", () => {
		expect(service.getStats()).toEqual({
			todo: 0,
			in_progress: 0,
			done: 0,
			overdue: 0,
		});
	});

	it("counts tasks by status and flags overdue ones", () => {
		seed();
		expect(service.getStats()).toEqual({
			todo: 3,
			in_progress: 1,
			done: 1,
			overdue: 1,
		});
	});

	it("does not count a done task as overdue even when its dueDate has passed", () => {
		service.create({
			title: "late but finished",
			status: "done",
			dueDate: PAST,
		});
		expect(service.getStats().overdue).toBe(0);
	});

	it("ignores a status outside the known vocabulary", () => {
		// Not a real TaskStatus: the store is typed, but a caller could still reach
		// it with an unknown status at runtime.
		service.create({ title: "weird", status: "archived" as TaskStatus });
		expect(service.getStats()).toEqual({
			todo: 0,
			in_progress: 0,
			done: 0,
			overdue: 0,
		});
	});
});

describe("create", () => {
	it("returns the created task with a generated id and timestamps", () => {
		const task = service.create({ title: "write tests" });
		expect(task.id).toMatch(UUID);
		expect(task.createdAt).toMatch(ISO);
		expect(task.completedAt).toBeNull();
	});

	it("applies defaults for every omitted field", () => {
		expect(service.create({ title: "bare" })).toMatchObject({
			description: "",
			status: "todo",
			priority: "medium",
			dueDate: null,
			assignee: null,
		});
	});

	it("keeps the values that were supplied", () => {
		expect(
			service.create({
				title: "full",
				description: "details",
				status: "in_progress",
				priority: "high",
				dueDate: FUTURE,
			}),
		).toMatchObject({
			title: "full",
			description: "details",
			status: "in_progress",
			priority: "high",
			dueDate: FUTURE,
		});
	});

	// BUG-09 (fixed): the validator trimmed the title only to check it, and the
	// store then kept the raw string.
	it("trims surrounding whitespace from the title", () => {
		expect(service.create({ title: "  padded  " }).title).toBe("padded");
	});

	// Reads return copies since BUG-08, so compare by value and not by identity.
	// The point is that the created task is the one in the store.
	it("adds the task to the store", () => {
		const task = service.create({ title: "stored" });
		expect(service.getAll()).toHaveLength(1);
		expect(service.findById(task.id)).toEqual(service.getAll()[0]);
	});

	it("gives each task a distinct id", () => {
		const a = service.create({ title: "a" });
		const b = service.create({ title: "b" });
		expect(a.id).not.toBe(b.id);
	});
});

describe("update", () => {
	it("applies a partial update and leaves the other fields alone", () => {
		const { t1 } = seed();
		const updated = service.update(t1.id, { title: "renamed" });
		expect(updated).toMatchObject({
			title: "renamed",
			status: "todo",
			priority: "high",
		});
	});

	it("persists the update in the store", () => {
		const { t1 } = seed();
		service.update(t1.id, { status: "in_progress" });
		expect(found(t1.id).status).toBe("in_progress");
	});

	it("returns null for an id that does not exist", () => {
		seed();
		expect(service.update("no-such-id", { title: "x" })).toBeNull();
	});

	// BUG-03 (fixed): update used to copy every field from the body onto the task,
	// so a body carrying an id overwrote the task's id and the task could not be
	// found again. update copies only the writable fields now.
	it("refuses to overwrite the id and createdAt", () => {
		const { t1 } = seed();
		service.update(t1.id, { id: "stolen", createdAt: PAST });
		expect(service.findById(t1.id)).toBeDefined();
		expect(found(t1.id).createdAt).toBe(t1.createdAt);
	});

	it("refuses to overwrite completedAt", () => {
		const { t1 } = seed();
		service.update(t1.id, { completedAt: PAST });
		expect(found(t1.id).completedAt).toBeNull();
	});

	it("drops a field that is not part of the task shape", () => {
		const { t1 } = seed();
		service.update(t1.id, { bogus: "x" });
		expect((found(t1.id) as Record<string, unknown>).bogus).toBeUndefined();
	});

	// Covers the `!== undefined` check in the loop: a truthy check would skip this
	// and make it impossible to clear a due date.
	it("still clears dueDate when null is sent explicitly", () => {
		const { t1 } = seed();
		expect(service.update(t1.id, { dueDate: null })?.dueDate).toBeNull();
	});

	// BUG-05 (fixed): reaching "done" through update left completedAt null, so the
	// same state looked different depending on the endpoint used.
	it("stamps completedAt when the status is set to done", () => {
		const { t1 } = seed();
		expect(service.update(t1.id, { status: "done" })?.completedAt).toMatch(ISO);
	});

	it("leaves an existing completedAt alone when the task is already done", () => {
		const { t5 } = seed();
		const before = service.completeTask(t5.id)?.completedAt;
		expect(service.update(t5.id, { title: "renamed" })?.completedAt).toBe(
			before,
		);
	});
});

describe("remove", () => {
	it("drops the task and leaves the surrounding ones in order", () => {
		const { t3 } = seed();
		expect(service.remove(t3.id)).toBe(true);
		expect(service.getAll().map((t) => t.title)).toEqual([
			"T1",
			"T2",
			"T4",
			"T5",
		]);
	});

	it("returns false for an id that does not exist", () => {
		seed();
		expect(service.remove("no-such-id")).toBe(false);
		expect(service.getAll()).toHaveLength(5);
	});
});

describe("completeTask", () => {
	it("marks the task done and stamps completedAt", () => {
		const { t3 } = seed();
		const completed = service.completeTask(t3.id);
		expect(completed?.status).toBe("done");
		expect(completed?.completedAt).toMatch(ISO);
	});

	it("persists the completion in the store", () => {
		const { t3 } = seed();
		service.completeTask(t3.id);
		expect(found(t3.id).status).toBe("done");
	});

	it("returns null for an id that does not exist", () => {
		seed();
		expect(service.completeTask("no-such-id")).toBeNull();
	});

	it("is idempotent on status for an already done task", () => {
		const { t5 } = seed();
		expect(service.completeTask(t5.id)?.status).toBe("done");
	});

	// BUG-04 (fixed): completeTask set priority to "medium", so finishing a task
	// changed how urgent it was.
	it("preserves the priority of the completed task", () => {
		const { t1 } = seed();
		expect(service.completeTask(t1.id)?.priority).toBe("high");
	});
});

describe("assign", () => {
	it("sets the assignee and returns the updated task", () => {
		const { t1 } = seed();
		expect(service.assign(t1.id, "Sam")?.assignee).toBe("Sam");
	});

	it("persists the assignment in the store", () => {
		const { t1 } = seed();
		service.assign(t1.id, "Sam");
		expect(found(t1.id).assignee).toBe("Sam");
	});

	it("trims surrounding whitespace from the name", () => {
		const { t1 } = seed();
		expect(service.assign(t1.id, "  Sam  ")?.assignee).toBe("Sam");
	});

	// Reassigning is allowed, so the last write wins.
	it("overwrites an existing assignee", () => {
		const { t1 } = seed();
		service.assign(t1.id, "Sam");
		expect(service.assign(t1.id, "Alex")?.assignee).toBe("Alex");
	});

	it("leaves the other fields alone", () => {
		const { t1 } = seed();
		expect(service.assign(t1.id, "Sam")).toMatchObject({
			title: "T1",
			status: "todo",
			priority: "high",
		});
	});

	it("returns null for an id that does not exist", () => {
		seed();
		expect(service.assign("no-such-id", "Sam")).toBeNull();
	});
});
