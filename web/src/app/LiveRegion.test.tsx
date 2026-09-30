import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LiveRegionProvider, listAnnouncement, useAnnounce } from "./LiveRegion";

function Probe() {
  const announce = useAnnounce();
  return <button onClick={() => announce("4 tasks shown, To do")}>Announce</button>;
}

describe("LiveRegion", () => {
  it("mounts a polite status region", () => {
    render(
      <LiveRegionProvider>
        <Probe />
      </LiveRegionProvider>,
    );
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("puts the announced message into the region", async () => {
    render(
      <LiveRegionProvider>
        <Probe />
      </LiveRegionProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Announce" }));
    expect(screen.getByRole("status")).toHaveTextContent("4 tasks shown, To do");
  });

  it("throws when used outside the provider", () => {
    // Suppress React's error boundary noise for the expected throw.
    const spy = console.error;
    console.error = () => {};
    try {
      expect(() => render(<Probe />)).toThrow(/inside LiveRegionProvider/);
    } finally {
      console.error = spy;
    }
  });
});

describe("listAnnouncement", () => {
  it("announces loading before anything has arrived", () => {
    expect(listAnnouncement({ isLoading: true, count: 0, status: null, page: 1 })).toBe("Loading tasks");
  });

  it("names the filter and the count on page 1", () => {
    expect(listAnnouncement({ isLoading: false, count: 4, status: "todo", page: 1 })).toBe(
      "4 tasks shown, To do",
    );
  });

  it("uses the All label when no filter is active", () => {
    expect(listAnnouncement({ isLoading: false, count: 10, status: null, page: 1 })).toBe(
      "10 tasks shown, All",
    );
  });

  it("announces the range on later pages", () => {
    expect(listAnnouncement({ isLoading: false, count: 10, status: null, page: 2 })).toBe(
      "Page 2, tasks 11 to 20",
    );
  });

  it("announces an empty filter result", () => {
    expect(listAnnouncement({ isLoading: false, count: 0, status: "done", page: 1 })).toBe(
      "No tasks match this filter",
    );
  });

  it("says nothing when the list is empty with no filter", () => {
    expect(listAnnouncement({ isLoading: false, count: 0, status: null, page: 1 })).toBe("");
  });

  it("uses the singular for exactly one task", () => {
    expect(listAnnouncement({ isLoading: false, count: 1, status: "todo", page: 1 })).toBe(
      "1 task shown, To do",
    );
  });
});
