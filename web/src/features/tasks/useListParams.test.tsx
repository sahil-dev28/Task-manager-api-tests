import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import { rangeText, useListParams } from "./useListParams";

const wrapperFor = (initial: string) =>
  ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>;

describe("useListParams", () => {
  it("defaults to no filter and page 1", () => {
    const { result } = renderHook(() => useListParams(), { wrapper: wrapperFor("/") });
    expect(result.current.status).toBeNull();
    expect(result.current.page).toBe(1);
  });

  it("reads status and page from the query string", () => {
    const { result } = renderHook(() => useListParams(), {
      wrapper: wrapperFor("/?status=in_progress&page=2"),
    });
    expect(result.current.status).toBe("in_progress");
    expect(result.current.page).toBe(2);
  });

  it("ignores an unknown status", () => {
    const { result } = renderHook(() => useListParams(), { wrapper: wrapperFor("/?status=nope") });
    expect(result.current.status).toBeNull();
  });

  it("falls back to page 1 for a non-numeric page", () => {
    const { result } = renderHook(() => useListParams(), { wrapper: wrapperFor("/?page=abc") });
    expect(result.current.page).toBe(1);
  });

  it("resets the page to 1 when the status changes", () => {
    const { result } = renderHook(
      () => ({ params: useListParams(), location: useLocation() }),
      { wrapper: wrapperFor("/?status=todo&page=3") },
    );
    act(() => result.current.params.setStatus("done"));
    expect(result.current.location.search).toBe("?status=done");
  });

  it("drops the status parameter entirely for the All filter", () => {
    const { result } = renderHook(
      () => ({ params: useListParams(), location: useLocation() }),
      { wrapper: wrapperFor("/?status=todo") },
    );
    act(() => result.current.params.setStatus(null));
    expect(result.current.location.search).toBe("");
  });
});

describe("rangeText", () => {
  it("numbers the first page from one", () => {
    expect(rangeText(1, 10)).toBe("Showing 1–10");
  });

  it("offsets later pages by the page size", () => {
    expect(rangeText(3, 4)).toBe("Showing 21–24");
  });
});
