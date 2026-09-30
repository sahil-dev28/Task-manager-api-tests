import { render, screen } from "@testing-library/react";
import { ListTodo } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders its title, body and actions", () => {
    render(
      <EmptyState
        icon={ListTodo}
        title="No tasks yet"
        body="The API keeps tasks in memory."
        actions={<Button size="lg">New task</Button>}
      />,
    );
    expect(screen.getByRole("heading", { name: "No tasks yet" })).toBeInTheDocument();
    expect(screen.getByText("The API keeps tasks in memory.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New task" })).toBeInTheDocument();
  });

  it("renders without actions", () => {
    render(<EmptyState icon={ListTodo} title="Nothing to do" body="Every task is done." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("tints the icon disc for the error tone", () => {
    const { container, rerender } = render(
      <EmptyState icon={ListTodo} title="Couldn't load tasks" body="The server returned an error." tone="error" />,
    );
    const disc = container.querySelector("span");
    expect(disc?.className).toContain("bg-danger-subtle");

    rerender(<EmptyState icon={ListTodo} title="No tasks yet" body="Nothing here." />);
    expect(container.querySelector("span")?.className).toContain("bg-subtle");
  });

  it("renders its icon", () => {
    const { container } = render(<EmptyState icon={ListTodo} title="No tasks yet" body="Nothing here." />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
