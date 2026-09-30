import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { makeTask } from "@/test/fixtures";
import { makeTestQueryClient } from "@/test/renderWithProviders";
import { server } from "@/test/server";

import { PAGE_SIZE, taskKeys, useLookahead, useTasksPage } from "./queries";

const base = "http://localhost:3000";

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = makeTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("taskKeys", () => {
  it("keys a page by its status and page number", () => {
    expect(taskKeys.page("todo", 2)).toEqual(["tasks", { status: "todo", page: 2 }]);
    expect(taskKeys.page(null, 1)).toEqual(["tasks", { status: null, page: 1 }]);
  });
});

describe("useTasksPage", () => {
  it("requests the given page at the fixed page size", async () => {
    let seen: URLSearchParams | null = null;
    server.use(http.get(`${base}/tasks`, ({ request }) => {
      seen = new URL(request.url).searchParams;
      return HttpResponse.json([makeTask()]);
    }));

    const { result } = renderHook(() => useTasksPage(null, 3), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(seen!.get("page")).toBe("3");
    expect(seen!.get("limit")).toBe(String(PAGE_SIZE));
  });
});

describe("useLookahead", () => {
  it("reports a next page when page n+1 has at least one task", async () => {
    server.use(http.get(`${base}/tasks`, ({ request }) => {
      const page = new URL(request.url).searchParams.get("page");
      return HttpResponse.json(page === "2" ? [makeTask()] : []);
    }));

    const { result } = renderHook(() => useLookahead(null, 1), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNext).toBe(true);
  });

  it("reports no next page when page n+1 is empty", async () => {
    server.use(http.get(`${base}/tasks`, () => HttpResponse.json([])));

    const { result } = renderHook(() => useLookahead(null, 1), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNext).toBe(false);
  });

  it("reports no next page when the lookahead request fails", async () => {
    server.use(http.get(`${base}/tasks`, () => HttpResponse.json({ error: "nope" }, { status: 400 })));

    const { result } = renderHook(() => useLookahead(null, 1), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.hasNext).toBe(false);
  });
});
