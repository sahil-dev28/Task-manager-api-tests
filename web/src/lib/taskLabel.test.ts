import { describe, expect, it } from "vitest";

import { makeTask } from "@/test/fixtures";

import { toDueDateIso } from "./dates";
import { taskAccessibleName } from "./taskLabel";

const NOW = new Date(2026, 8, 30, 12, 0, 0);

describe("taskAccessibleName", () => {
  it("matches DESIGN's worked example", () => {
    const task = makeTask({
      title: "Fix the flaky checkout test",
      status: "todo",
      priority: "high",
      dueDate: toDueDateIso("2026-09-29"),
      assignee: "Alex Chen",
    });
    expect(taskAccessibleName(task, NOW)).toBe(
      "Fix the flaky checkout test, To do, High priority, overdue, due Yesterday, assigned to Alex Chen",
    );
  });

  it("omits the optional clauses when the fields are empty", () => {
    const task = makeTask({ title: "Book a venue", status: "todo", priority: "low" });
    expect(taskAccessibleName(task, NOW)).toBe("Book a venue, To do, Low priority");
  });

  it("does not call a done task overdue", () => {
    const task = makeTask({
      title: "Write release notes",
      status: "done",
      priority: "medium",
      dueDate: toDueDateIso("2026-09-29"),
    });
    expect(taskAccessibleName(task, NOW)).toBe(
      "Write release notes, Done, Medium priority, due Yesterday",
    );
  });
});
