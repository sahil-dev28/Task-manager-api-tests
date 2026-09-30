/// <reference types="node" />
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const here = import.meta.dirname;
const read = (p: string) => readFileSync(resolve(here, p), "utf8");

/** Hex values inside the given "### N.N" sections of DESIGN.md. */
function designHexes(sections: [string, string][]): Set<string> {
  const design = read("../../DESIGN.md");
  const found = new Set<string>();
  for (const [from, to] of sections) {
    const start = design.indexOf(from);
    const end = design.indexOf(to);
    expect(start, `missing section ${from}`).toBeGreaterThan(-1);
    expect(end, `missing section ${to}`).toBeGreaterThan(start);
    for (const m of design.slice(start, end).matchAll(/#[0-9A-F]{6}\b/g)) {
      found.add(m[0].toUpperCase());
    }
  }
  return found;
}

describe("design tokens", () => {
  it("emits every colour from DESIGN's semantic token tables", () => {
    const expected = designHexes([
      ["### 2.2 Semantic neutral tokens", "### 2.3 Accent (ink)"],
      ["### 2.3 Accent (ink)", "### 2.4 Semantic colors"],
      ["### 2.4 Semantic colors", "### 2.5 Status pairings"],
      ["### 2.14 Avatar", "### 2.15 Watermark"],
    ]);
    const css = read("./index.css").toUpperCase();

    const missing = [...expected].filter((hex) => !css.includes(hex));
    expect(missing, `hexes in DESIGN but not in index.css: ${missing.join(", ")}`).toEqual([]);
  });

  it("declares every themed token in both :root and .dark", () => {
    const css = read("./index.css");
    // Locate the blocks by their braces: the bare substring ".dark" first matches
    // inside `@custom-variant dark (&:where(.dark, .dark *))` above them.
    const rootAt = css.indexOf(":root {");
    const darkAt = css.indexOf(".dark {");
    const themeAt = css.indexOf("@theme");
    expect(rootAt).toBeGreaterThan(-1);
    expect(darkAt).toBeGreaterThan(rootAt);
    expect(themeAt).toBeGreaterThan(darkAt);

    const root = css.slice(rootAt, darkAt);
    const dark = css.slice(darkAt, themeAt);

    const names = [...root.matchAll(/(--c-[a-z0-9-]+):/g)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(20);

    const missing = names.filter((n) => !dark.includes(`${n}:`));
    expect(missing, `themed tokens missing a .dark value: ${missing.join(", ")}`).toEqual([]);
  });
});
