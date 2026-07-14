// SPDX-License-Identifier: MIT

import { afterEach, describe, expect, it, vi } from "vitest";
import { formatSearch, matchesEntry, runSearch } from "../src/commands/search.js";
import { EXIT } from "../src/output.js";
import type { RegistryIndexEntry } from "../src/registry/schema.js";
import { BASE, cleanupProjects, makeProject, stubRegistry } from "./helpers.js";

const catalog: RegistryIndexEntry[] = [
  {
    name: "date-picker",
    type: "registry:ui",
    title: "Date picker",
    description: "Select a single date.",
    status: "experimental",
    useWhen: ["Collecting a known calendar date"],
  },
  {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "Initiates an immediate action.",
    status: "stable",
  },
  { name: "cn", type: "registry:lib" },
];

afterEach(() => {
  vi.unstubAllGlobals();
  cleanupProjects();
});

describe("matchesEntry", () => {
  it("matches case-insensitively across name, title, description, and useWhen", () => {
    const entry = catalog[0]!;
    expect(matchesEntry(entry, "DATE")).toBe(true);
    expect(matchesEntry(entry, "picker")).toBe(true);
    expect(matchesEntry(entry, "single date")).toBe(true);
    expect(matchesEntry(entry, "calendar")).toBe(true);
    expect(matchesEntry(entry, "button")).toBe(false);
  });
});

describe("runSearch", () => {
  it("returns matching catalog entries", async () => {
    stubRegistry({}, catalog);
    const cwd = makeProject();

    const result = await runSearch({ cwd, term: "date" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.registry).toBe(BASE);
    expect(result.data.results.map((entry) => entry.name)).toEqual(["date-picker"]);
  });

  it("accepts an object catalog with an items array", async () => {
    stubRegistry({}, { items: catalog });
    const cwd = makeProject();

    const result = await runSearch({ cwd, term: "action" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.results.map((entry) => entry.name)).toEqual(["button"]);
  });

  it("returns an empty result list with exit 0 when nothing matches", async () => {
    stubRegistry({}, catalog);
    const cwd = makeProject();

    const result = await runSearch({ cwd, term: "zzz-no-match" });

    expect(result.ok).toBe(true);
    expect(result.exitCode).toBe(EXIT.OK);
    if (!result.ok) return;
    expect(result.data.results).toEqual([]);
  });

  it("exits 2 when the catalog is missing (404)", async () => {
    stubRegistry({});
    const cwd = makeProject();

    const result = await runSearch({ cwd, term: "date" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.REGISTRY);
    expect(result.error.code).toBe("NOT_FOUND");
  });

  it("exits 3 when the catalog fails schema validation", async () => {
    stubRegistry({}, [{ title: "no name" }]);
    const cwd = makeProject();

    const result = await runSearch({ cwd, term: "date" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("INVALID_SCHEMA");
  });

  it("exits 1 on an empty search term", async () => {
    const cwd = makeProject();
    const result = await runSearch({ cwd, term: "   " });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.USER);
  });
});

describe("formatSearch", () => {
  it("renders a simple aligned table", () => {
    const text = formatSearch({
      registry: BASE,
      term: "date",
      results: [catalog[0]!, catalog[2]!],
    });
    const lines = text.split("\n");
    expect(lines[0]).toMatch(/^NAME\s+STATUS\s+DESCRIPTION$/);
    expect(lines[1]).toContain("date-picker");
    expect(lines[1]).toContain("experimental");
    expect(lines[2]).toContain("cn");
  });

  it("says when nothing matched", () => {
    const text = formatSearch({ registry: BASE, term: "zzz", results: [] });
    expect(text).toContain('"zzz"');
  });
});
