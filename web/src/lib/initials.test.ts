import { describe, expect, it } from "vitest";

import { getInitials } from "./initials";

describe("getInitials", () => {
  it.each([
    ["Priya Sharma", "PS"],
    ["alex", "A"],
    ["Mary Jane Watson", "MW"],
    ["  Ada  Lovelace  ", "AL"],
    ["7 of nine", "7N"],
  ])("maps %s to %s", (name, expected) => {
    expect(getInitials(name)).toEqual({ kind: "text", value: expected });
  });

  it("falls back to the icon when the first character is not alphanumeric", () => {
    expect(getInitials("@ops")).toEqual({ kind: "icon" });
  });

  it("falls back to the icon for an empty string", () => {
    expect(getInitials("   ")).toEqual({ kind: "icon" });
  });
});
