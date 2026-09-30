import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDocumentTitle } from "./useDocumentTitle";

describe("useDocumentTitle", () => {
  it("is just the product name when nothing is overdue", () => {
    renderHook(() => useDocumentTitle(0));
    expect(document.title).toBe("Tasks");
  });

  it("leads with the overdue count when there is one", () => {
    renderHook(() => useDocumentTitle(3));
    expect(document.title).toBe("(3 overdue) Tasks");
  });

  it("is just the product name while stats are unknown", () => {
    renderHook(() => useDocumentTitle(undefined));
    expect(document.title).toBe("Tasks");
  });
});
