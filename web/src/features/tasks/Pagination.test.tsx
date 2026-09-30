import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./Pagination";

type Props = Parameters<typeof Pagination>[0];

const setup = (props: Partial<Props> = {}) => {
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  const { container } = render(
    <Pagination page={1} hasNext count={10} onPrevious={onPrevious} onNext={onNext} {...props} />,
  );
  return { onPrevious, onNext, container };
};

describe("Pagination", () => {
  it("labels the current page in mono uppercase", () => {
    setup({ page: 2 });
    expect(screen.getByText("PAGE 2")).toBeInTheDocument();
  });

  it("does not render at all when the whole result fits one page", () => {
    const { container } = setup({ page: 1, hasNext: false, count: 4 });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders when page one is full even without a next page", () => {
    setup({ page: 1, hasNext: false, count: 10 });
    expect(screen.getByText("PAGE 1")).toBeInTheDocument();
  });

  it("disables Previous on the first page but keeps it in the tab order", () => {
    setup({ page: 1 });
    expect(screen.getByRole("button", { name: /Previous/ })).toHaveAttribute("aria-disabled", "true");
  });

  it("disables Next on the last page", () => {
    setup({ page: 3, hasNext: false, count: 4 });
    const next = screen.getByRole("button", { name: /Next/ });
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).toHaveAttribute("title", "You're on the last page");
  });

  it("moves between pages", async () => {
    const { onPrevious, onNext } = setup({ page: 2 });
    await userEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(onNext).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: /Previous/ }));
    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it("does not move when a disabled control is activated", async () => {
    const { onPrevious } = setup({ page: 1 });
    await userEvent.click(screen.getByRole("button", { name: /Previous/ }));
    expect(onPrevious).not.toHaveBeenCalled();
  });
});
