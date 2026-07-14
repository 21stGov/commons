// SPDX-License-Identifier: MIT

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { formatInit, initNextSteps, runInit } from "../src/commands/init.js";
import { EXIT } from "../src/output.js";
import { cleanupProjects, makeProject } from "./helpers.js";

afterEach(() => {
  cleanupProjects();
});

describe("runInit", () => {
  it("previews without writing when --yes is not passed", () => {
    const cwd = makeProject({ config: null });
    const result = runInit({ cwd, yes: false, force: false });

    expect(result.ok).toBe(true);
    expect(result.exitCode).toBe(EXIT.OK);
    if (result.ok) {
      expect(result.data.written).toBe(false);
    }
    expect(existsSync(join(cwd, "commons.json"))).toBe(false);
  });

  it("writes the spec commons.json with --yes in a src project", () => {
    const cwd = makeProject({ config: null, src: true });
    const result = runInit({ cwd, yes: true, force: false });

    expect(result.ok).toBe(true);
    const written = JSON.parse(readFileSync(join(cwd, "commons.json"), "utf8")) as unknown;
    expect(written).toEqual({
      $schema: "https://commonsui.com/schema/commons.json",
      registry: "https://commonsui.com/r",
      paths: {
        ui: "src/components/ui",
        components: "src/components",
        lib: "src/lib",
      },
      theme: "light",
    });
  });

  it("uses non-src paths when the project has no src directory", () => {
    const cwd = makeProject({ config: null });
    const result = runInit({ cwd, yes: true, force: false });

    expect(result.ok).toBe(true);
    const written = JSON.parse(readFileSync(join(cwd, "commons.json"), "utf8")) as {
      paths: Record<string, string>;
    };
    expect(written.paths).toEqual({
      ui: "components/ui",
      components: "components",
      lib: "lib",
    });
  });

  it("refuses to overwrite an existing commons.json without --force (exit 1)", () => {
    const cwd = makeProject({ config: { registry: "https://example.test/r" } });
    const result = runInit({ cwd, yes: true, force: false });

    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(EXIT.USER);
    if (!result.ok) {
      expect(result.error.code).toBe("CONFLICT");
    }
    const kept = JSON.parse(readFileSync(join(cwd, "commons.json"), "utf8")) as {
      registry: string;
    };
    expect(kept.registry).toBe("https://example.test/r");
  });

  it("overwrites with --force", () => {
    const cwd = makeProject({ config: { registry: "https://example.test/r" } });
    writeFileSync(join(cwd, "commons.json"), "{}\n", "utf8");
    const result = runInit({ cwd, yes: true, force: true });

    expect(result.ok).toBe(true);
    const written = JSON.parse(readFileSync(join(cwd, "commons.json"), "utf8")) as {
      registry: string;
    };
    expect(written.registry).toBe("https://commonsui.com/r");
  });
});

describe("init human output", () => {
  it("preview names the --yes flag and shows the config", () => {
    const cwd = makeProject({ config: null });
    const result = runInit({ cwd, yes: false, force: false });
    if (!result.ok) throw new Error("expected preview success");

    const text = formatInit(result.data);
    expect(text).toContain("--yes");
    expect(text).toContain('"registry"');
  });

  it("next steps cover the tsconfig alias and all five CSS imports in order", () => {
    const text = initNextSteps();
    expect(text).toContain('"@/*"');
    // Order matters and must match apps/playground/src/index.css: fonts, tokens,
    // core, the tailwindcss engine, then the tokens tailwind.css bridge
    // (the bridge only clears Tailwind's stock palette when it comes after).
    const imports = [
      '@import "@21stgov/commons-fonts/index.css";',
      '@import "@21stgov/commons-tokens/index.css";',
      '@import "@21stgov/commons-core/index.css";',
      '@import "tailwindcss";',
      '@import "@21stgov/commons-tokens/tailwind.css";',
    ];
    const positions = imports.map((line) => text.indexOf(line));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});
