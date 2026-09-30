import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";
import { IconButton } from "./IconButton";

describe("Button", () => {
  it("renders its label and calls onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>New task</Button>);
    await userEvent.click(screen.getByRole("button", { name: "New task" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps the label and blocks clicks while loading", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>New task</Button>);
    const button = screen.getByRole("button", { name: /New task/ });
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("marks a disabled button aria-disabled rather than dropping it from the tree, and blocks clicks", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>New task</Button>);
    const button = screen.getByRole("button", { name: "New task" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the amber mark chip on a primary button", () => {
    render(<Button variant="primary" mark leadingIcon={Plus}>New task</Button>);
    expect(document.querySelector(".bg-mark")).not.toBeNull();
  });

  it("refuses the mark chip on any other variant", () => {
    render(<Button variant="secondary" mark leadingIcon={Plus}>New task</Button>);
    expect(document.querySelector(".bg-mark")).toBeNull();
  });

  it("keeps the mark chip while loading so the button does not shrink", () => {
    render(<Button variant="primary" mark loading leadingIcon={Plus}>New task</Button>);
    expect(document.querySelector(".bg-mark")).not.toBeNull();
    expect(screen.getByRole("button", { name: /New task/ })).toHaveAttribute("aria-busy", "true");
  });
});

describe("IconButton", () => {
  it("exposes its label to assistive technology", () => {
    render(<IconButton label="More actions" icon={Plus} />);
    expect(screen.getByRole("button", { name: "More actions" })).toBeInTheDocument();
  });

  it("marks a disabled icon button aria-disabled rather than dropping it from the tree, and blocks clicks", async () => {
    const onClick = vi.fn();
    render(<IconButton label="More actions" icon={Plus} disabled onClick={onClick} />);
    const button = screen.getByRole("button", { name: "More actions" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("disabled");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
