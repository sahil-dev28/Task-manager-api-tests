import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AssigneeChip } from "./AssigneeChip";
import { PriorityIndicator } from "./PriorityIndicator";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["todo", "To do"],
    ["in_progress", "In progress"],
    ["done", "Done"],
  ] as const)("labels %s as %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe("PriorityIndicator", () => {
  it("shows an uppercase label in the full variant", () => {
    render(<PriorityIndicator priority="high" />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("carries an accessible label in the compact variant", () => {
    render(<PriorityIndicator priority="high" variant="compact" />);
    expect(screen.getByLabelText("Priority: High")).toBeInTheDocument();
    expect(screen.queryByText("HIGH")).not.toBeInTheDocument();
  });

  it("gives the compact variant a tooltip as well as an accessible name", () => {
    render(<PriorityIndicator priority="high" variant="compact" />);
    const el = screen.getByLabelText("Priority: High");
    expect(el).toHaveAttribute("title", "High priority");
  });
});

describe("AssigneeChip", () => {
  it("shows the monogram and the name", () => {
    render(<AssigneeChip name="Priya Sharma" />);
    expect(screen.getByText("PS")).toBeInTheDocument();
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
  });

  it("falls back to an icon for a handle", () => {
    render(<AssigneeChip name="@ops" />);
    expect(screen.queryByText("@")).not.toBeInTheDocument();
    expect(screen.getByText("@ops")).toBeInTheDocument();
  });
});
