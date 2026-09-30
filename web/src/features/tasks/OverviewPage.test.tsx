import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { makeStats, makeTask } from "@/test/fixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/server";

import { OverviewPage } from "./OverviewPage";

const base = "http://localhost:3000";

function apiWith(pages: Record<string, ReturnType<typeof makeTask>[]>, stats = makeStats({ todo: 2 })) {
  const seen: URLSearchParams[] = [];
  server.use(
    http.get(`${base}/tasks/stats`, () => HttpResponse.json(stats)),
    http.get(`${base}/tasks`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      seen.push(params);
      const key = `${params.get("status") ?? "all"}:${params.get("page") ?? "1"}`;
      return HttpResponse.json(pages[key] ?? []);
    }),
  );
  return seen;
}

describe("OverviewPage", () => {
  it("renders stats and the first page", async () => {
    apiWith({ "all:1": [makeTask({ title: "Ship it" })], "all:2": [] }, makeStats({ todo: 7, in_progress: 3, done: 12, overdue: 2 }));
    renderWithProviders(<OverviewPage />);

    expect(await screen.findByText("Ship it")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("filters by status and resets to page 1", async () => {
    const seen = apiWith({ "all:1": [makeTask()], "all:2": [], "done:1": [makeTask({ title: "Done one", status: "done" })], "done:2": [] });
    renderWithProviders(<OverviewPage />, { route: "/?page=2" });

    await screen.findByRole("radiogroup");
    await userEvent.click(screen.getByRole("radio", { name: /Done/ }));

    await waitFor(() => {
      const last = seen[seen.length - 1]!;
      expect(last.get("status")).toBe("done");
    });
    expect(seen.some((p) => p.get("status") === "done" && p.get("page") === "1")).toBe(true);
  });

  it("enables Next only when the lookahead finds a next page", async () => {
    apiWith({ "all:1": Array.from({ length: 10 }, () => makeTask()), "all:2": [makeTask()], "all:3": [] });
    renderWithProviders(<OverviewPage />);

    const next = await screen.findByRole("button", { name: /Next/ });
    await waitFor(() => expect(next).not.toHaveAttribute("aria-disabled"));
  });

  it("disables Next on the last page", async () => {
    apiWith({ "all:1": Array.from({ length: 10 }, () => makeTask()), "all:2": [] });
    renderWithProviders(<OverviewPage />);

    const next = await screen.findByRole("button", { name: /Next/ });
    await waitFor(() => expect(next).toHaveAttribute("aria-disabled", "true"));
  });

  it("shows the no-tasks empty state when the API is empty and no filter is active", async () => {
    apiWith({ "all:1": [], "all:2": [] }, makeStats());
    renderWithProviders(<OverviewPage />);

    expect(await screen.findByRole("heading", { name: "No tasks yet" })).toBeInTheDocument();
  });

  it("shows the filter-empty state when a filter matches nothing", async () => {
    apiWith({ "done:1": [], "done:2": [] }, makeStats({ todo: 5 }));
    renderWithProviders(<OverviewPage />, { route: "/?status=done" });

    expect(await screen.findByRole("heading", { name: "No completed tasks yet" })).toBeInTheDocument();
  });

  it("shows the API error message when the page fails to load", async () => {
    server.use(
      http.get(`${base}/tasks/stats`, () => HttpResponse.json(makeStats())),
      http.get(`${base}/tasks`, () => HttpResponse.json({ error: "Bad page" }, { status: 400 })),
    );
    renderWithProviders(<OverviewPage />);

    expect(await screen.findByRole("heading", { name: "Couldn't load tasks" })).toBeInTheDocument();
    expect(screen.getByText("The server returned an error: Bad page")).toBeInTheDocument();
  });

  it("shows the range text for the current page", async () => {
    apiWith({ "all:1": Array.from({ length: 10 }, () => makeTask()), "all:2": [] });
    renderWithProviders(<OverviewPage />);

    expect(await screen.findByText("Showing 1–10")).toBeInTheDocument();
  });

  it("keeps the overdue tile inert and labelled", async () => {
    apiWith({ "all:1": [makeTask()], "all:2": [] }, makeStats({ overdue: 3 }));
    renderWithProviders(<OverviewPage />);

    expect(await screen.findByLabelText("3 overdue tasks, past due and not done")).toBeInTheDocument();
    const tiles = screen.getAllByRole("button");
    expect(tiles.every((t) => !within(t).queryByText("Overdue"))).toBe(true);
  });
});
