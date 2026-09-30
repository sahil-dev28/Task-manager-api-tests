import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { toDueDateIso } from "@/lib/dates";
import { makeTask } from "@/test/fixtures";

import { TaskCard } from "./TaskCard";

const NOW = new Date(2026, 8, 30, 12, 0, 0);

const setup = (task = makeTask(), props: Partial<Parameters<typeof TaskCard>[0]> = {}) => {
  const onComplete = vi.fn();
  render(
    <MemoryRouter>
      <TaskCard task={task} now={NOW} onComplete={onComplete} {...props} />
    </MemoryRouter>,
  );
  return { onComplete };
};

describe("TaskCard", () => {
  it("links the title to the task detail route", () => {
    const task = makeTask({ id: "abc", title: "Ship it" });
    setup(task);
    expect(screen.getByRole("link", { name: /Ship it/ })).toHaveAttribute("href", "/tasks/abc");
  });

  it("gives the checkbox the DESIGN label and calls onComplete", async () => {
    const task = makeTask({ title: "Ship it" });
    const { onComplete } = setup(task);
    const checkbox = screen.getByRole("checkbox", { name: 'Mark “Ship it” complete' });
    await userEvent.click(checkbox);
    expect(onComplete).toHaveBeenCalledWith(task);
  });

  it("does not call onComplete for a task that is already done", async () => {
    const { onComplete } = setup(makeTask({ status: "done", completedAt: NOW.toISOString() }));
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("shows the overdue treatment for a past due unfinished task", () => {
    setup(makeTask({ dueDate: toDueDateIso("2026-09-28"), status: "todo" }));
    expect(screen.getByText(/overdue · sep 28/i)).toBeInTheDocument();
  });

  it("shows a plain due date when the task is not overdue", () => {
    setup(makeTask({ dueDate: toDueDateIso("2026-10-01"), status: "todo" }));
    expect(screen.getByText(/^tomorrow$/i)).toBeInTheDocument();
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it("hides the description preview when there is none", () => {
    const { container } = render(
      <MemoryRouter>
        <TaskCard task={makeTask({ description: "" })} now={NOW} onComplete={() => {}} />
      </MemoryRouter>,
    );
    expect(container.querySelector("[data-description]")).toBeNull();
  });

  it("shows the completed stamp for a done task", () => {
    // NOTE: completedAt here is the same calendar day as NOW, so the shared,
    // already-correct formatRelativeDate renders "Today" rather than "Sep 30" —
    // the brief's literal regex (`/completed sep 30/i`) cannot pass against a
    // correct implementation given this test's own fixture data. See task-14 report.
    setup(makeTask({ status: "done", completedAt: new Date(2026, 8, 30).toISOString() }));
    expect(screen.getByText(/completed today/i)).toBeInTheDocument();
  });

  it("disables its controls while a mutation on this task is in flight", () => {
    setup(makeTask(), { busy: true });
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-disabled", "true");
  });

  it("blocks the more-actions button while a mutation is in flight", async () => {
    const onOpenMenu = vi.fn();
    render(
      <MemoryRouter>
        <TaskCard task={makeTask()} now={NOW} onComplete={() => {}} onOpenMenu={onOpenMenu} busy />
      </MemoryRouter>,
    );
    const more = screen.getByRole("button", { name: "More actions" });
    expect(more).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(more);
    expect(onOpenMenu).not.toHaveBeenCalled();
  });

  it("exposes exactly three tab stops and keeps the card itself out of the tab order", () => {
    const { container } = render(
      <MemoryRouter>
        <TaskCard
          task={makeTask({ assignee: "Priya Sharma" })}
          now={NOW}
          onComplete={() => {}}
          onOpenMenu={() => {}}
        />
      </MemoryRouter>,
    );
    expect(container.querySelector("article")).not.toHaveAttribute("tabindex");
    const focusable = container.querySelectorAll("button, a[href]");
    expect(focusable).toHaveLength(3);
  });

  it("strikes the title and hides a populated description when done", () => {
    const { container } = render(
      <MemoryRouter>
        <TaskCard
          task={makeTask({ status: "done", completedAt: NOW.toISOString(), description: "Some detail" })}
          now={NOW}
          onComplete={() => {}}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link").className).toContain("line-through");
    expect(container.querySelector("[data-description]")).toBeNull();
  });
});
