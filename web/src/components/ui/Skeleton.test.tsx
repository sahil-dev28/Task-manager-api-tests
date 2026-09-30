import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton, SkeletonLine } from "./Skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<Skeleton className="h-8 w-14" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("SkeletonLine", () => {
  it("applies width and height as inline styles, not classes", () => {
    const { container } = render(<SkeletonLine width="45%" height={12} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("45%");
    expect(el.style.height).toBe("12px");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts a numeric width", () => {
    const { container } = render(<SkeletonLine width={96} />);
    expect((container.firstElementChild as HTMLElement).style.width).toBe("96px");
  });
});
