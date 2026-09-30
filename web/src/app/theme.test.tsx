import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, useTheme } from "./theme";

function Probe() {
  const { theme, resolved, setTheme } = useTheme();
  return (
    <>
      <span data-testid="pref">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("light")}>Light</button>
    </>
  );
}

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
  return {
    change(next: boolean) {
      for (const cb of listeners) cb({ matches: next } as MediaQueryListEvent);
    },
  };
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ThemeProvider", () => {
  it("defaults to the system preference", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("pref")).toHaveTextContent("system");
  });

  it("adds the dark class to <html> when dark is chosen", async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });

  it("removes the dark class when light is chosen", async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Dark" }));
    await userEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("persists the choice under tasks-theme", async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(localStorage.getItem("tasks-theme")).toBe("dark");
  });

  it("restores a stored preference on mount", () => {
    localStorage.setItem("tasks-theme", "dark");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("pref")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("adds the no-transition class synchronously on switch", async () => {
    // Stub rAF so the cleanup never runs; the class must still be on <html>.
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0 as unknown as number);
    try {
      render(<ThemeProvider><Probe /></ThemeProvider>);
      await userEvent.click(screen.getByRole("button", { name: "Dark" }));
      expect(document.documentElement).toHaveClass("no-transition");
      expect(raf).toHaveBeenCalled();
    } finally {
      raf.mockRestore();
    }
  });

  it("clears the no-transition class on the next frame", async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Dark" }));
    await waitFor(() => expect(document.documentElement).not.toHaveClass("no-transition"));
  });

  it("resolves to dark when the system prefers dark", () => {
    stubMatchMedia(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("resolves to light when the system does not prefer dark", () => {
    stubMatchMedia(false);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("follows a live system preference change while the preference is system", async () => {
    const media = stubMatchMedia(false);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");

    media.change(true);

    await waitFor(() => expect(screen.getByTestId("resolved")).toHaveTextContent("dark"));
    expect(document.documentElement).toHaveClass("dark");
  });

  it("still renders when localStorage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("pref")).toHaveTextContent("system");

    // A write that throws must not break the switch.
    await userEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement).toHaveClass("dark");
  });
});
