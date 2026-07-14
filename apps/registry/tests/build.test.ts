// SPDX-License-Identifier: MIT

/**
 * Registry builder tests. Cross-platform by construction: node:path /
 * node:fs / node:os only, temp output via os.tmpdir(), no shelling out.
 */

import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { registryIndexSchema, registryItemSchema } from "@21stgov/commons/src/registry/schema.ts";
import {
  assertAgentContract,
  assertNoCaseCollisions,
  assertShippedImportsResolve,
  buildRegistry,
  destinationPath,
  extractAliasImports,
  sha256Hex,
  THEME_CSS_IMPORTS,
  type BuildResult,
} from "../src/registry-build.ts";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const reactDir = join(packageDir, "..", "..", "packages", "react");

const FRAGMENT_ITEM_NAMES = [
  "accordion",
  "alert",
  "alert-dialog",
  "ambient-direction",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "character-count",
  "checkbox",
  "checkbox-group",
  "cn",
  "collapsible",
  "collection",
  "combo-box",
  "command-palette",
  "context-menu",
  "custom-select",
  "data-table",
  "date-picker",
  "date-range-picker",
  "dialog",
  "drawer",
  "dropdown-menu",
  "empty-state",
  "field",
  "file-input",
  "footer",
  "form",
  "gov-banner",
  "header",
  "hover-card",
  "icon",
  "icon-list",
  "identifier",
  "in-page-navigation",
  "input",
  "input-group",
  "input-mask",
  "input-otp",
  "item",
  "kbd",
  "language-selector",
  "link",
  "list",
  "memorable-date",
  "menubar",
  "meter",
  "navigation-menu",
  "number-field",
  "pagination",
  "popover",
  "process-list",
  "progress",
  "prose",
  "radio-group",
  "resizable-panels",
  "scroll-area",
  "search",
  "select",
  "separator",
  "sidebar",
  "site-alert",
  "skeleton",
  "slider",
  "spinner",
  "step-indicator",
  "summary-box",
  "switch",
  "table",
  "tabs",
  "time-picker",
  "toast",
  "toggle",
  "toggle-group",
  "toolbar",
  "tooltip",
  "validation",
];
const ALL_ITEM_NAMES = [...FRAGMENT_ITEM_NAMES, "theme"].sort();

let outDir: string;
let result: BuildResult;

function readItem(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(outDir, `${name}.json`), "utf8")) as Record<string, unknown>;
}

beforeAll(() => {
  outDir = mkdtempSync(join(tmpdir(), "commons-registry-"));
  result = buildRegistry({
    reactDir,
    outDir,
    version: "0.0.1",
    generated: "2026-07-11T00:00:00.000Z",
  });
});

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});

describe("buildRegistry output", () => {
  it("emits one JSON file per item plus index.json", () => {
    const emitted = readdirSync(outDir).sort();
    expect(emitted).toEqual([...ALL_ITEM_NAMES.map((name) => `${name}.json`), "index.json"].sort());
    expect(result.items.map((item) => item.name)).toEqual(ALL_ITEM_NAMES);
  });

  it("every emitted item validates against the CLI registry-item schema", () => {
    for (const name of ALL_ITEM_NAMES) {
      const parsed = registryItemSchema.safeParse(readItem(name));
      expect(parsed.success, `${name}.json should validate: ${parsed.error?.message ?? ""}`).toBe(
        true,
      );
    }
  });
});

describe("button.json", () => {
  it("carries fragment fields plus provenance fields", () => {
    const button = readItem("button");
    expect(button.$schema).toBe("https://commonsui.com/schema/registry-item.v1.json");
    expect(button.schemaVersion).toBe("1");
    expect(button.name).toBe("button");
    expect(button.type).toBe("registry:ui");
    expect(button.version).toBe("0.0.1");
    expect(button.license).toBe("MIT");
    expect(button.docs).toBe("https://commonsui.com/components/button");
    expect(button.registryDependencies).toEqual(["cn"]);
    expect(button.dependencies).toEqual(["class-variance-authority"]);
    expect((button.accessibility as Record<string, unknown>).standard).toBe("WCAG 2.2 AA");
  });

  it("ships the source file verbatim at the stable consumer path", () => {
    const button = readItem("button");
    const files = button.files as Array<{ path: string; type: string; content: string }>;
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe("components/ui/button.tsx");
    expect(files[0].type).toBe("registry:ui");

    const source = readFileSync(
      join(reactDir, "src", "components", "button", "button.tsx"),
      "utf8",
    );
    expect(files[0].content).toBe(source); // byte-for-byte
  });

  it("integrity map verifies against the shipped content", () => {
    const button = readItem("button");
    const files = button.files as Array<{ path: string; content: string }>;
    const integrity = button.integrity as Record<string, string>;
    for (const file of files) {
      expect(integrity[file.path]).toBe(`sha256-${sha256Hex(file.content)}`);
    }
    expect(Object.keys(integrity).sort()).toEqual(files.map((file) => file.path).sort());
  });
});

describe("lib items", () => {
  it("cn ships to lib/<basename> with matching integrity", () => {
    const cn = readItem("cn");
    expect(cn.type).toBe("registry:lib");
    const files = cn.files as Array<{ path: string; content: string }>;
    expect(files[0].path).toBe("lib/cn.ts");
    const source = readFileSync(join(reactDir, "src", "lib", "cn.ts"), "utf8");
    expect(files[0].content).toBe(source);
    expect((cn.integrity as Record<string, string>)["lib/cn.ts"]).toBe(
      `sha256-${sha256Hex(source)}`,
    );
  });

  it("multi-file items ship every referenced file", () => {
    const field = readItem("field");
    const paths = (field.files as Array<{ path: string }>).map((file) => file.path).sort();
    expect(paths).toEqual(["components/ui/context.ts", "components/ui/field.tsx"]);
  });
});

describe("theme.json", () => {
  it("is a registry:theme item whose docs are the five CSS import lines, with no files", () => {
    const theme = readItem("theme");
    expect(theme.type).toBe("registry:theme");
    expect(theme.files).toBeUndefined();
    expect(theme.docs).toBe(THEME_CSS_IMPORTS.join("\n"));
    // Order must match apps/playground/src/index.css: fonts, tokens, core, the
    // tailwindcss engine, then the tokens tailwind.css bridge (the bridge
    // only clears Tailwind's stock palette when it comes after).
    expect(THEME_CSS_IMPORTS).toEqual([
      '@import "@21stgov/commons-fonts/index.css";',
      '@import "@21stgov/commons-tokens/index.css";',
      '@import "@21stgov/commons-core/index.css";',
      '@import "tailwindcss";',
      '@import "@21stgov/commons-tokens/tailwind.css";',
    ]);
    expect(theme.license).toBe("MIT");
  });

  it("carries the agent contract fields (useWhen/avoidWhen/accessibility/compatibility)", () => {
    const theme = readItem("theme");
    expect(Array.isArray(theme.useWhen)).toBe(true);
    expect((theme.useWhen as string[]).length).toBeGreaterThan(0);
    expect(Array.isArray(theme.avoidWhen)).toBe(true);
    expect(theme.compatibility).toEqual({ rtl: true, forcedColors: true });
    expect((theme.accessibility as Record<string, unknown>).standard).toBe("not-applicable");
  });
});

describe("index.json catalog", () => {
  it("validates against the CLI index schema and lists every item", () => {
    const catalog = JSON.parse(readFileSync(join(outDir, "index.json"), "utf8")) as Record<
      string,
      unknown
    >;
    const parsed = registryIndexSchema.safeParse(catalog);
    expect(parsed.success, parsed.error?.message ?? "").toBe(true);

    expect(catalog.$schema).toBe("https://commonsui.com/schema/catalog.v1.json");
    expect(catalog.schemaVersion).toBe("1");
    expect(catalog.name).toBe("commons");
    expect(catalog.homepage).toBe("https://commonsui.com");
    expect(catalog.generated).toBe("2026-07-11T00:00:00.000Z");

    const entries = catalog.items as Array<Record<string, unknown>>;
    expect(entries.map((entry) => entry.name)).toEqual(ALL_ITEM_NAMES);

    const button = entries.find((entry) => entry.name === "button");
    expect(button).toMatchObject({
      type: "registry:ui",
      title: "Button",
      status: "experimental",
      framework: "react",
    });
    expect(typeof button?.description).toBe("string");

    const cn = entries.find((entry) => entry.name === "cn");
    expect(cn?.framework).toBe("css");
    const theme = entries.find((entry) => entry.name === "theme");
    expect(theme?.framework).toBe("css");

    // Catalog entries stay compact: no file contents in the index.
    for (const entry of entries) {
      expect(entry.files).toBeUndefined();
      expect(entry.integrity).toBeUndefined();
    }
  });

  it("carries useWhen and avoidWhen so `commons search` can match use cases", () => {
    const catalog = JSON.parse(readFileSync(join(outDir, "index.json"), "utf8")) as {
      items: Array<Record<string, unknown>>;
    };
    for (const entry of catalog.items) {
      expect(Array.isArray(entry.useWhen), `${String(entry.name)} must carry useWhen`).toBe(true);
      expect(Array.isArray(entry.avoidWhen), `${String(entry.name)} must carry avoidWhen`).toBe(
        true,
      );
    }
    const button = catalog.items.find((entry) => entry.name === "button");
    expect(button?.useWhen).toContain("Submitting a form");
  });
});

describe("guards", () => {
  it("destinationPath maps types to stable directories", () => {
    expect(destinationPath("registry:ui", "src/components/button/button.tsx")).toBe(
      "components/ui/button.tsx",
    );
    expect(destinationPath("registry:lib", "src/lib/cn.ts")).toBe("lib/cn.ts");
    expect(() => destinationPath("registry:hook", "src/hooks/use-thing.ts")).toThrow(
      /Unsupported registry file type/,
    );
  });

  it("fails on emitted paths that differ only by case", () => {
    expect(() =>
      assertNoCaseCollisions(
        ["components/ui/button.tsx", "components/ui/Button.tsx"],
        "registry item file destinations",
      ),
    ).toThrow(/Case collision/);
    expect(() =>
      assertNoCaseCollisions(["Alert.json", "alert.json"], "registry output files"),
    ).toThrow(/Case collision/);
  });

  it("fails on exact duplicate emitted paths", () => {
    expect(() => assertNoCaseCollisions(["lib/cn.ts", "lib/cn.ts"], "test")).toThrow(
      /Case collision/,
    );
  });

  it("accepts distinct paths", () => {
    expect(() =>
      assertNoCaseCollisions(["components/ui/button.tsx", "lib/cn.ts", "index.json"], "test"),
    ).not.toThrow();
  });

  it("assertAgentContract requires useWhen, avoidWhen, and accessibility on every item", () => {
    const complete = {
      name: "ok",
      useWhen: ["x"],
      avoidWhen: [],
      accessibility: { standard: "not-applicable" },
    };
    expect(() => assertAgentContract([complete])).not.toThrow();
    expect(() => assertAgentContract([{ ...complete, accessibility: undefined }])).toThrow(
      /missing required contract field\(s\): accessibility/,
    );
    expect(() =>
      assertAgentContract([{ name: "bare" }]),
    ).toThrow(/useWhen, avoidWhen, accessibility/);
  });
});

describe("shipped import resolution", () => {
  it("extracts static and dynamic @/ import specifiers", () => {
    const content = [
      'import { cn } from "@/lib/cn";',
      'import { useFieldControl } from "@/components/ui/context";',
      'const lazy = await import("@/components/ui/input");',
      'import notAlias from "./relative";',
      'import pkg from "react";',
    ].join("\n");
    expect(extractAliasImports(content)).toEqual([
      "@/lib/cn",
      "@/components/ui/context",
      "@/components/ui/input",
    ]);
  });

  it("accepts imports satisfied by the item itself or transitive registryDependencies", () => {
    expect(() =>
      assertShippedImportsResolve([
        {
          name: "cn",
          files: [{ path: "lib/cn.ts", content: "export const cn = () => '';" }],
        },
        {
          name: "field",
          registryDependencies: ["cn"],
          files: [
            {
              path: "components/ui/field.tsx",
              content:
                'import { cn } from "@/lib/cn";\nimport { FieldProvider } from "@/components/ui/context";',
            },
            { path: "components/ui/context.ts", content: "" },
          ],
        },
        {
          name: "checkbox",
          registryDependencies: ["cn", "field"],
          files: [
            {
              path: "components/ui/checkbox.tsx",
              content: 'import { useFieldControl } from "@/components/ui/context";',
            },
          ],
        },
      ]),
    ).not.toThrow();
  });

  it("fails on source-layout specifiers that cannot resolve in a consumer", () => {
    expect(() =>
      assertShippedImportsResolve([
        {
          name: "field",
          files: [
            {
              path: "components/ui/field.tsx",
              content: 'import { FieldProvider } from "@/components/field/context";',
            },
            { path: "components/ui/context.ts", content: "" },
          ],
        },
      ]),
    ).toThrow(/does not resolve/);
  });

  it("fails when the providing item is not a registryDependency", () => {
    expect(() =>
      assertShippedImportsResolve([
        {
          name: "field",
          files: [{ path: "components/ui/context.ts", content: "" }],
        },
        {
          name: "select",
          registryDependencies: [],
          files: [
            {
              path: "components/ui/select.tsx",
              content: 'import { useFieldControl } from "@/components/ui/context";',
            },
          ],
        },
      ]),
    ).toThrow(/does not resolve/);
  });

  it("every published item's shipped imports resolve for its consumers", () => {
    const items = ALL_ITEM_NAMES.map((name) => readItem(name));
    expect(() =>
      assertShippedImportsResolve(
        items as unknown as Parameters<typeof assertShippedImportsResolve>[0],
      ),
    ).not.toThrow();
  });
});
