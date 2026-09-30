import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { makeTask } from "@/test/fixtures";

import { TaskList } from "./TaskList";

type Props = Parameters<typeof TaskList>[0];

const setup = (props: Partial<Props> = {}) => {
  const handlers = {
    onComplete: vi.fn(),
    onNewTask: vi.fn(),
    onAddSamples: vi.fn(),
    onShowAll: vi.fn(),
    onRetry: vi.fn(),
  };
  const { container } = render(
    <MemoryRouter>
      <TaskList
        tasks={[makeTask(), makeTask()]}
        isLoading={false}
        isDimmed={false}
        isError={false}
        error={null}
        activeStatus={null}
        {...handlers}
        {...props}
      />
    </MemoryRouter>,
  );
  return { ...handlers, container };
};

describe("TaskList", () => {
  it("renders one card per task", () => {
    setup();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("shows skeletons and marks the region busy while first loading", () => {
    const { container } = setup({ isLoading: true, tasks: [] });
    expect(screen.getByLabelText("Loading tasks")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(container.querySelector("#tasks")).not.toBeNull();
    expect(screen.getByLabelText("Loading tasks").children).toHaveLength(5);
  });

  it("keeps the skip-link target present when there are no tasks", () => {
    const { container } = setup({ tasks: [] });
    expect(container.querySelector("#tasks")).not.toBeNull();
  });

  it("shows the no-tasks empty state with both actions", async () => {
    const { onAddSamples } = setup({ tasks: [] });
    expect(screen.getByRole("heading", { name: "No tasks yet" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Add sample tasks/ }));
    expect(onAddSamples).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Show all tasks" })).not.toBeInTheDocument();
  });

  it.each([
    ["todo", "Nothing to do", "Every task is either in progress or done."],
    ["in_progress", "Nothing in progress", "Move a task here from its menu with Set status."],
    ["done", "No completed tasks yet", "Tasks you mark complete will show up here."],
  ] as const)("shows the %s filter-empty copy", async (status, title, body) => {
    const { onShowAll } = setup({ tasks: [], activeStatus: status });
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByText(body)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add sample tasks/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^New task$/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show all tasks" }));
    expect(onShowAll).toHaveBeenCalledOnce();
  });

  it("shows the API error message in the load-error state", async () => {
    const { onRetry } = setup({ tasks: [], isError: true, error: "Bad page" });
    expect(screen.getByRole("heading", { name: "Couldn't load tasks" })).toBeInTheDocument();
    expect(screen.getByText("The server returned an error: Bad page")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("falls back to generic copy when the error has no message", () => {
    setup({ tasks: [], isError: true, error: null });
    expect(screen.getByText("Something went wrong while loading tasks.")).toBeInTheDocument();
  });

  it("dims the list without unmounting the cards while refetching", () => {
    setup({ isDimmed: true });
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
  });
});
