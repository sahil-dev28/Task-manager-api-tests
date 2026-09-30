import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeStats } from "@/test/fixtures";

import { StatsRow } from "./StatsRow";

const setup = (props: Partial<Parameters<typeof StatsRow>[0]> = {}) => {
  const onSelectStatus = vi.fn();
  render(
    <StatsRow
      stats={makeStats({ todo: 7, in_progress: 3, done: 12, overdue: 2 })}
      isLoading={false}
      isError={false}
      activeStatus={null}
      onSelectStatus={onSelectStatus}
      onRetry={() => {}}
      {...props}
    />,
  );
  return { onSelectStatus };
};

describe("StatsRow", () => {
  it("renders the four counts", () => {
    setup();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("makes the three status tiles buttons and leaves overdue inert", () => {
    setup();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByLabelText("2 overdue tasks, past due and not done")).toBeInTheDocument();
  });

  it("selects a status when a tile is activated", async () => {
    const { onSelectStatus } = setup();
    await userEvent.click(screen.getByRole("button", { name: /To do/ }));
    expect(onSelectStatus).toHaveBeenCalledWith("todo");
  });

  it("clears the filter when the selected tile is activated again", async () => {
    const { onSelectStatus } = setup({ activeStatus: "todo" });
    await userEvent.click(screen.getByRole("button", { name: /To do/ }));
    expect(onSelectStatus).toHaveBeenCalledWith(null);
  });

  it("marks the active tile pressed", () => {
    setup({ activeStatus: "done" });
    expect(screen.getByRole("button", { name: /Done/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the zero footnote when nothing is overdue", () => {
    setup({ stats: makeStats() });
    expect(screen.getByText("NOTHING PAST DUE")).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    setup({ isLoading: true, stats: undefined });
    expect(screen.queryByText("7")).not.toBeInTheDocument();
  });

  it("offers a retry when stats fail", async () => {
    const onRetry = vi.fn();
    setup({ isError: true, stats: undefined, onRetry });
    expect(screen.getAllByText("Couldn't load").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
