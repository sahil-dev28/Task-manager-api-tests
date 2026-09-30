import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl";

const options = [
  { value: "all", label: "All", count: 22 },
  { value: "todo", label: "To do", count: 7 },
  { value: "in_progress", label: "In progress", count: 3 },
  { value: "done", label: "Done", count: 12 },
];

const setup = (value = "all") => {
  const onChange = vi.fn();
  render(<SegmentedControl label="Filter by status" options={options} value={value} onChange={onChange} />);
  return { onChange };
};

describe("SegmentedControl", () => {
  it("is a radiogroup with one radio per option", () => {
    setup();
    expect(screen.getByRole("radiogroup", { name: "Filter by status" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("marks only the selected option checked", () => {
    setup("todo");
    expect(screen.getByRole("radio", { name: /To do/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /All/ })).not.toBeChecked();
  });

  it("selects on click", async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByRole("radio", { name: /In progress/ }));
    expect(onChange).toHaveBeenCalledWith("in_progress");
  });

  it("moves and selects with arrow keys", async () => {
    const { onChange } = setup("all");
    screen.getByRole("radio", { name: /All/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("todo");
    expect(screen.getByRole("radio", { name: /To do/ })).toHaveFocus();
  });

  it("wraps from the last option to the first", async () => {
    const { onChange } = setup("done");
    screen.getByRole("radio", { name: /Done/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("all");
    expect(screen.getByRole("radio", { name: /All/ })).toHaveFocus();
  });

  it("jumps to the ends with Home and End", async () => {
    const { onChange } = setup("todo");
    screen.getByRole("radio", { name: /To do/ }).focus();
    await userEvent.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith("done");
    expect(screen.getByRole("radio", { name: /Done/ })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith("all");
    expect(screen.getByRole("radio", { name: /All/ })).toHaveFocus();
  });

  it("keeps exactly one segment tabbable, and it is the selected one", () => {
    setup("in_progress");
    const radios = screen.getAllByRole("radio");
    const tabbable = radios.filter((r) => r.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName(/In progress/);
  });

  it("shows a middot instead of a count while counts are unknown", () => {
    render(
      <SegmentedControl
        label="Filter by status"
        options={options.map((o) => ({ ...o, count: null }))}
        value="all"
        onChange={() => {}}
        disabled
      />,
    );
    expect(screen.getAllByText("·")).toHaveLength(4);
  });

  it("blocks interaction while disabled", async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl label="Filter by status" options={options} value="all" onChange={onChange} disabled />,
    );
    await userEvent.click(screen.getByRole("radio", { name: /To do/ }));
    screen.getByRole("radio", { name: /All/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");
  });
});
