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
});
