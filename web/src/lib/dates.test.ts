import { describe, expect, it } from "vitest";

import { formatDateTime, formatRelativeDate, isOverdue, toDateInputValue, toDueDateIso } from "./dates";

const NOW = new Date(2026, 8, 30, 12, 0, 0); // 30 Sep 2026, local

describe("toDueDateIso", () => {
  it("converts a picker date to the end of that local day", () => {
    const iso = toDueDateIso("2026-09-30");
    const d = new Date(iso);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(30);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
    expect(d.getSeconds()).toBe(59);
    expect(d.getMilliseconds()).toBe(999);
  });

  it("produces a value that is not overdue on the day itself", () => {
    // DESIGN 4.6: a midnight timestamp would mark a task due today as overdue all day.
    expect(isOverdue({ dueDate: toDueDateIso("2026-09-30"), status: "todo" }, NOW)).toBe(false);
  });
});

describe("toDateInputValue", () => {
  it("round-trips with toDueDateIso", () => {
    expect(toDateInputValue(toDueDateIso("2026-09-30"))).toBe("2026-09-30");
  });

  it("returns an empty string for null", () => {
    expect(toDateInputValue(null)).toBe("");
  });
});

describe("formatRelativeDate", () => {
  it.each([
    ["2026-09-30", "Today"],
    ["2026-10-01", "Tomorrow"],
    ["2026-09-29", "Yesterday"],
    ["2026-09-28", "Sep 28"],
    ["2027-09-28", "Sep 28, 2027"],
  ])("formats %s as %s", (day, expected) => {
    expect(formatRelativeDate(toDueDateIso(day), NOW)).toBe(expected);
  });
});

describe("formatDateTime", () => {
  it("formats an ISO string as date at 24-hour time", () => {
    expect(formatDateTime(new Date(2026, 8, 30, 14, 5).toISOString())).toBe("Sep 30, 2026 at 14:05");
  });
});

describe("isOverdue", () => {
  it("is true for a past due date on an unfinished task", () => {
    expect(isOverdue({ dueDate: toDueDateIso("2026-09-29"), status: "todo" }, NOW)).toBe(true);
  });

  it("is false when the task is done", () => {
    expect(isOverdue({ dueDate: toDueDateIso("2026-09-29"), status: "done" }, NOW)).toBe(false);
  });

  it("is false when there is no due date", () => {
    expect(isOverdue({ dueDate: null, status: "todo" }, NOW)).toBe(false);
  });
});
