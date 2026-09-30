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

  it("marks a disabled button aria-disabled rather than dropping it from the tree", () => {
    render(<Button disabled>New task</Button>);
    expect(screen.getByRole("button", { name: "New task" })).toHaveAttribute("aria-disabled", "true");
  });

  it("renders the amber mark chip only when asked", () => {
    const { rerender } = render(<Button mark leadingIcon={Plus}>New task</Button>);
    expect(document.querySelector(".bg-mark")).not.toBeNull();
    rerender(<Button leadingIcon={Plus}>New task</Button>);
    expect(document.querySelector(".bg-mark")).toBeNull();
  });

  it("keeps the mark chip while loading so the button does not shrink", () => {
    render(<Button mark loading leadingIcon={Plus}>New task</Button>);
    expect(document.querySelector(".bg-mark")).not.toBeNull();
    expect(screen.getByRole("button", { name: /New task/ })).toHaveAttribute("aria-busy", "true");
  });
});

describe("IconButton", () => {
  it("exposes its label to assistive technology", () => {
    render(<IconButton label="More actions" icon={Plus} />);
    expect(screen.getByRole("button", { name: "More actions" })).toBeInTheDocument();
  });
});
