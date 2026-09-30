import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider, useToast } from "./toast";

function Probe() {
  const toast = useToast();
  return (
    <>
      <button onClick={() => toast.success("Task created")}>Success</button>
      <button onClick={() => toast.error("Couldn't save", { detail: "Title is required" })}>Error</button>
      <button onClick={() => toast.info("Heads up", { action: { label: "View", onClick: () => {} } })}>
        Info
      </button>
    </>
  );
}

const setup = () =>
  render(
    <ToastProvider>
      <Probe />
    </ToastProvider>,
  );

const click = (text: string) => fireEvent.click(screen.getByText(text));

// Only the timeout pair is faked: React's own scheduling must keep running.
beforeEach(() => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] }));
afterEach(() => vi.useRealTimers());

describe("toasts", () => {
  it("mounts a labelled notifications region", () => {
    setup();
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
  });

  it("announces success politely and errors assertively, with the detail line", () => {
    setup();
    click("Success");
    expect(screen.getByRole("status")).toHaveTextContent("Task created");
    click("Error");
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save");
    expect(screen.getByRole("alert")).toHaveTextContent("Title is required");
  });

  it("dismisses a success toast after four seconds and an error after eight", () => {
    setup();
    click("Success");
    click("Error");
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("holds the toast while the pointer is over it", () => {
    setup();
    click("Success");
    fireEvent.mouseEnter(screen.getByRole("status"));
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.mouseLeave(screen.getByRole("status"));
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("dismisses on the close button and when the action is taken", () => {
    setup();
    click("Success");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    click("Info");
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps at most three toasts, dropping the oldest", () => {
    setup();
    for (let i = 0; i < 4; i += 1) click("Success");
    expect(screen.getAllByRole("status")).toHaveLength(3);
  });

  it("throws when used outside the provider", () => {
    const spy = console.error;
    console.error = () => {};
    try {
      expect(() => render(<Probe />)).toThrow(/inside ToastProvider/);
    } finally {
      console.error = spy;
    }
  });
});
