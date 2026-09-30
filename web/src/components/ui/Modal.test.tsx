import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";
import { Modal } from "./Modal";

function Host({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const second = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal
        open={open}
        title="New task"
        initialFocus={second}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        footer={<button ref={second}>Save</button>}
      >
        <input aria-label="Title" />
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("renders nothing while closed", () => {
    render(<Host />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("labels the dialog with its title and focuses the requested element", async () => {
    render(<Host />);
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("dialog", { name: "New task" })).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Save")).toHaveFocus();
  });

  it("closes on Escape and returns focus to the opener", async () => {
    const onClose = vi.fn();
    render(<Host onClose={onClose} />);
    const opener = screen.getByText("Open");
    await userEvent.click(opener);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("closes on a scrim click and on the Close button", async () => {
    const onClose = vi.fn();
    render(<Host onClose={onClose} />);
    await userEvent.click(screen.getByText("Open"));
    await userEvent.click(document.querySelector("[data-scrim]")!);
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByText("Open"));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("keeps Tab inside the dialog, with Close as the last stop", async () => {
    render(<Host />);
    await userEvent.click(screen.getByText("Open"));
    // Focus starts on Save (initialFocus); Close follows it, then wraps to Title.
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByLabelText("Title")).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("marks the page behind it inert while open", async () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
    try {
      render(<Host />);
      await userEvent.click(screen.getByText("Open"));
      expect(root).toHaveAttribute("inert");
      await userEvent.keyboard("{Escape}");
      expect(root).not.toHaveAttribute("inert");
    } finally {
      root.remove();
    }
  });
});

describe("ConfirmDialog", () => {
  const setup = (props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Delete this task?"
        body="It will be gone."
        confirmLabel="Delete task"
        onCancel={onCancel}
        onConfirm={onConfirm}
        {...props}
      />,
    );
    return { onCancel, onConfirm };
  };

  it("is an alertdialog with Cancel focused on open", () => {
    setup();
    expect(screen.getByRole("alertdialog", { name: "Delete this task?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("confirms and cancels through its buttons", async () => {
    const { onCancel, onConfirm } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Delete task" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("ignores Escape and disables Cancel while the confirmation is in flight", async () => {
    const { onCancel } = setup({ loading: true });
    await userEvent.keyboard("{Escape}");
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: /Delete task/ })).toHaveAttribute("aria-busy", "true");
  });

  it("shows the error line and stays open", () => {
    setup({ error: "Task is locked" });
    expect(screen.getByRole("alert")).toHaveTextContent("Task is locked");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});
