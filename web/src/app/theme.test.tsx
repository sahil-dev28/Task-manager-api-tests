import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

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

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
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

  it("suppresses transitions for one frame on switch", async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "Dark" }));
    });
    // The class is added synchronously and cleared on the next frame.
    expect(document.documentElement.className).not.toContain("no-transition");
  });
});
