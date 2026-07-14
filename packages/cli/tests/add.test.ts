// SPDX-License-Identifier: MIT

import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runAdd } from "../src/commands/add.js";
import { EXIT } from "../src/output.js";
import { sha256Hex } from "../src/plan.js";
import { BASE, cleanupProjects, makeProject, stubRegistry } from "./helpers.js";

const CN_CONTENT = "// SPDX-License-Identifier: MIT\nexport function cn() {}\n";
const BUTTON_CONTENT = "// SPDX-License-Identifier: MIT\nexport function Button() {}\n";

const cnItem = {
  name: "cn",
  type: "registry:lib",
  files: [{ path: "lib/cn.ts", content: CN_CONTENT, type: "registry:lib" }],
  dependencies: ["clsx", "tailwind-merge"],
};

const buttonItem = {
  name: "button",
  type: "registry:ui",
  registryDependencies: ["cn"],
  files: [{ path: "ui/button.tsx", content: BUTTON_CONTENT, type: "registry:ui" }],
  dependencies: ["@base-ui-components/react", "clsx"],
};

afterEach(() => {
  vi.unstubAllGlobals();
  cleanupProjects();
});

function addDefaults(cwd: string, names: string[]) {
  return { cwd, names, dryRun: false, overwrite: false };
}

describe("runAdd — happy path", () => {
  it("writes files into type-mapped paths (works in dirs with spaces and Unicode)", async () => {
    stubRegistry({ cn: cnItem, button: buttonItem });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["button"]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.written).toBe(2);
    expect(readFileSync(join(cwd, "src/components/ui/button.tsx"), "utf8")).toBe(BUTTON_CONTENT);
    expect(readFileSync(join(cwd, "src/lib/cn.ts"), "utf8")).toBe(CN_CONTENT);
  });

  it("resolves registryDependencies transitively in topological order (button -> cn)", async () => {
    stubRegistry({ cn: cnItem, button: buttonItem });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["button"]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items).toEqual(["cn", "button"]);
  });

  it("dedupes items requested twice and survives dependency cycles", async () => {
    const a = {
      name: "a",
      type: "registry:component",
      registryDependencies: ["b"],
      files: [{ path: "a.tsx", content: "// a\n", type: "registry:component" }],
    };
    const b = {
      name: "b",
      type: "registry:component",
      registryDependencies: ["a"],
      files: [{ path: "b.tsx", content: "// b\n", type: "registry:component" }],
    };
    stubRegistry({ a, b });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["a", "a", "b"]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items).toEqual(["b", "a"]);
    expect(existsSync(join(cwd, "src/components/a.tsx"))).toBe(true);
    expect(existsSync(join(cwd, "src/components/b.tsx"))).toBe(true);
  });

  it("collects and dedupes npm dependencies and prints, never runs, the install command", async () => {
    stubRegistry({ cn: cnItem, button: buttonItem });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["button"]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.dependencies).toEqual([
      "clsx",
      "tailwind-merge",
      "@base-ui-components/react",
    ]);
    expect(result.data.installCommand).toBe(
      "pnpm add clsx tailwind-merge @base-ui-components/react",
    );
  });

  it("preserves CRLF content byte-for-byte", async () => {
    const crlf = "line one\r\nline two\r\n";
    stubRegistry({
      crlf: {
        name: "crlf",
        type: "registry:lib",
        files: [{ path: "lib/crlf.ts", content: crlf, type: "registry:lib" }],
      },
    });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["crlf"]));

    expect(result.ok).toBe(true);
    const bytes = readFileSync(join(cwd, "src/lib/crlf.ts"));
    expect(bytes.equals(Buffer.from(crlf, "utf8"))).toBe(true);
  });

  it("uses default registry and non-src paths when there is no commons.json", async () => {
    const item = {
      name: "cn",
      type: "registry:lib",
      files: [{ path: "lib/cn.ts", content: CN_CONTENT, type: "registry:lib" }],
    };
    const fetchMock = stubRegistry({}); // default registry is not BASE
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(item), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const cwd = makeProject({ config: null });

    const result = await runAdd(addDefaults(cwd, ["cn"]));

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://commonsui.com/r/cn.json",
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );
    expect(existsSync(join(cwd, "lib/cn.ts"))).toBe(true);
  });
});

describe("runAdd — conflicts are atomic", () => {
  it("exits 1 and writes nothing when any file conflicts", async () => {
    stubRegistry({ cn: cnItem, button: buttonItem });
    const cwd = makeProject();
    mkdirSync(join(cwd, "src/lib"), { recursive: true });
    writeFileSync(join(cwd, "src/lib/cn.ts"), "// locally modified\n", "utf8");

    const result = await runAdd(addDefaults(cwd, ["button"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.USER);
    expect(result.error.code).toBe("CONFLICT");
    expect(result.error.message).toContain("src/lib/cn.ts");
    // Atomic: the non-conflicting file was not written either.
    expect(existsSync(join(cwd, "src/components/ui/button.tsx"))).toBe(false);
    expect(readFileSync(join(cwd, "src/lib/cn.ts"), "utf8")).toBe("// locally modified\n");
  });

  it("--overwrite replaces differing files", async () => {
    stubRegistry({ cn: cnItem, button: buttonItem });
    const cwd = makeProject();
    mkdirSync(join(cwd, "src/lib"), { recursive: true });
    writeFileSync(join(cwd, "src/lib/cn.ts"), "// locally modified\n", "utf8");

    const result = await runAdd({ ...addDefaults(cwd, ["button"]), overwrite: true });

    expect(result.ok).toBe(true);
    expect(readFileSync(join(cwd, "src/lib/cn.ts"), "utf8")).toBe(CN_CONTENT);
  });

  it("skips files that already match the registry content", async () => {
    stubRegistry({ cn: cnItem });
    const cwd = makeProject();
    mkdirSync(join(cwd, "src/lib"), { recursive: true });
    writeFileSync(join(cwd, "src/lib/cn.ts"), CN_CONTENT, "utf8");

    const result = await runAdd(addDefaults(cwd, ["cn"]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.files).toEqual([
      { path: "src/lib/cn.ts", action: "skip", item: "cn" },
    ]);
    expect(result.data.written).toBe(0);
  });
});

describe("runAdd — dry run", () => {
  it("returns the full plan (including conflicts) and writes nothing", async () => {
    stubRegistry({ cn: cnItem, button: buttonItem });
    const cwd = makeProject();
    mkdirSync(join(cwd, "src/lib"), { recursive: true });
    writeFileSync(join(cwd, "src/lib/cn.ts"), "// locally modified\n", "utf8");

    const result = await runAdd({ ...addDefaults(cwd, ["button"]), dryRun: true });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.exitCode).toBe(EXIT.OK);
    expect(result.data.dryRun).toBe(true);
    expect(result.data.written).toBe(0);
    expect(result.data.files).toEqual([
      { path: "src/lib/cn.ts", action: "conflict", item: "cn" },
      { path: "src/components/ui/button.tsx", action: "write", item: "button" },
    ]);
    expect(result.data.registry).toBe(BASE);
    expect(existsSync(join(cwd, "src/components/ui/button.tsx"))).toBe(false);
    expect(readFileSync(join(cwd, "src/lib/cn.ts"), "utf8")).toBe("// locally modified\n");
  });
});

describe("runAdd — error classes", () => {
  it("exits 2 when an item is missing from the registry (404)", async () => {
    stubRegistry({});
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["nope"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.REGISTRY);
    expect(result.error.code).toBe("NOT_FOUND");
  });

  it("exits 3 when an item fails schema validation", async () => {
    stubRegistry({ bad: { name: "bad", type: "registry:widget" } });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["bad"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("INVALID_SCHEMA");
  });

  it("exits 1 with no item names", async () => {
    const cwd = makeProject();
    const result = await runAdd(addDefaults(cwd, []));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.USER);
  });

  it("exits 1 when commons.json is malformed", async () => {
    const cwd = makeProject({ config: null });
    writeFileSync(join(cwd, "commons.json"), "{not json", "utf8");

    const result = await runAdd(addDefaults(cwd, ["button"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.USER);
    expect(result.error.code).toBe("INVALID_CONFIG");
  });
});

describe("runAdd — integrity", () => {
  it("passes when the per-file sha256 map matches", async () => {
    stubRegistry({
      cn: { ...cnItem, integrity: { "lib/cn.ts": `sha256-${sha256Hex(CN_CONTENT)}` } },
    });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["cn"]));
    expect(result.ok).toBe(true);
  });

  it("passes when the per-item combined sha256 string matches", async () => {
    stubRegistry({ cn: { ...cnItem, integrity: sha256Hex(CN_CONTENT) } });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["cn"]));
    expect(result.ok).toBe(true);
  });

  it("exits 3 when an integrity map is missing an entry for a shipped file", async () => {
    stubRegistry({
      partial: {
        name: "partial",
        type: "registry:lib",
        files: [
          { path: "lib/covered.ts", content: "// covered\n", type: "registry:lib" },
          { path: "lib/uncovered.ts", content: "// uncovered\n", type: "registry:lib" },
        ],
        integrity: { "lib/covered.ts": `sha256-${sha256Hex("// covered\n")}` },
      },
    });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["partial"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("INTEGRITY_MISMATCH");
    expect(result.error.message).toContain("lib/uncovered.ts");
    expect(existsSync(join(cwd, "src/lib/covered.ts"))).toBe(false);
  });

  it("exits 3 when an integrity map is empty but files are present", async () => {
    stubRegistry({ cn: { ...cnItem, integrity: {} } });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["cn"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("INTEGRITY_MISMATCH");
    expect(existsSync(join(cwd, "src/lib/cn.ts"))).toBe(false);
  });

  it("exits 3 and writes nothing on an integrity mismatch", async () => {
    stubRegistry({
      cn: { ...cnItem, integrity: { "lib/cn.ts": `sha256-${sha256Hex("tampered")}` } },
    });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["cn"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("INTEGRITY_MISMATCH");
    expect(existsSync(join(cwd, "src/lib/cn.ts"))).toBe(false);
  });
});

describe("runAdd — path traversal defenses", () => {
  const attacks = ["../x", "/abs", "C:\\evil", "..\\..\\x", "\\\\server\\share\\x"];

  for (const attack of attacks) {
    it(`rejects ${JSON.stringify(attack)} with exit 3 and zero writes`, async () => {
      stubRegistry({
        evil: {
          name: "evil",
          type: "registry:lib",
          files: [
            { path: attack, content: "// evil\n", type: "registry:lib" },
            { path: "lib/innocent.ts", content: "// fine\n", type: "registry:lib" },
          ],
        },
      });
      const cwd = makeProject();

      const result = await runAdd(addDefaults(cwd, ["evil"]));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.exitCode).toBe(EXIT.VALIDATION);
      expect(result.error.code).toBe("UNSAFE_PATH");
      expect(existsSync(join(cwd, "src/lib/innocent.ts"))).toBe(false);
    });
  }

  it("rejects destinations that escape the root through a symlinked directory", async () => {
    stubRegistry({ cn: cnItem });
    const outside = makeProject({ config: null }); // sibling temp dir outside the project
    const cwd = makeProject({
      config: {
        registry: BASE,
        paths: { ui: "src/components/ui", components: "src/components", lib: "escape" },
      },
    });
    try {
      symlinkSync(outside, join(cwd, "escape"), "dir");
    } catch {
      return; // Platform without symlink support (e.g. unprivileged Windows) — nothing to test.
    }

    const result = await runAdd(addDefaults(cwd, ["cn"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("UNSAFE_PATH");
    expect(result.error.message).toContain("symlink");
    expect(existsSync(join(outside, "cn.ts"))).toBe(false);
  });

  it("rejects commons.json paths that resolve outside the project root", async () => {
    stubRegistry({ cn: cnItem });
    const cwd = makeProject({
      config: {
        registry: BASE,
        paths: { ui: "../outside/ui", components: "../outside", lib: "../outside/lib" },
      },
    });

    const result = await runAdd(addDefaults(cwd, ["cn"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("UNSAFE_PATH");
  });
});

describe("runAdd — destination collisions", () => {
  it("exits 1 and writes nothing when two items collide case-insensitively", async () => {
    stubRegistry({
      button: {
        name: "button",
        type: "registry:ui",
        files: [{ path: "ui/button.tsx", content: "// lower\n", type: "registry:ui" }],
      },
      shouty: {
        name: "shouty",
        type: "registry:ui",
        files: [{ path: "ui/Button.tsx", content: "// upper\n", type: "registry:ui" }],
      },
    });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["button", "shouty"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.USER);
    expect(result.error.code).toBe("DESTINATION_COLLISION");
    expect(result.error.message).toContain("button (ui/button.tsx)");
    expect(result.error.message).toContain("shouty (ui/Button.tsx)");
    expect(existsSync(join(cwd, "src/components/ui/button.tsx"))).toBe(false);
    expect(existsSync(join(cwd, "src/components/ui/Button.tsx"))).toBe(false);
  });

  it("exits 1 when two items share a basename that lands on the same destination", async () => {
    stubRegistry({
      a: {
        name: "a",
        type: "registry:lib",
        files: [{ path: "lib/util.ts", content: "// a\n", type: "registry:lib" }],
      },
      b: {
        name: "b",
        type: "registry:lib",
        files: [{ path: "other/nested/util.ts", content: "// b\n", type: "registry:lib" }],
      },
    });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["a", "b"]));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("DESTINATION_COLLISION");
    expect(result.error.message).toContain("src/lib/util.ts");
    expect(existsSync(join(cwd, "src/lib/util.ts"))).toBe(false);
  });
});

describe("runAdd — package manager detection", () => {
  const matrix: Array<[string, string, string]> = [
    ["pnpm-lock.yaml", "pnpm", "pnpm add clsx tailwind-merge"],
    ["yarn.lock", "yarn", "yarn add clsx tailwind-merge"],
    ["package-lock.json", "npm", "npm install clsx tailwind-merge"],
    ["bun.lock", "bun", "bun add clsx tailwind-merge"],
    ["bun.lockb", "bun", "bun add clsx tailwind-merge"],
  ];

  for (const [lockfile, pm, command] of matrix) {
    it(`detects ${pm} from ${lockfile}`, async () => {
      stubRegistry({ cn: cnItem });
      const cwd = makeProject();
      writeFileSync(join(cwd, lockfile), "", "utf8");

      const result = await runAdd(addDefaults(cwd, ["cn"]));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.packageManager).toBe(pm);
      expect(result.data.installCommand).toBe(command);
    });
  }

  it("defaults to pnpm without a lockfile and omits the command with no deps", async () => {
    stubRegistry({
      bare: {
        name: "bare",
        type: "registry:lib",
        files: [{ path: "lib/bare.ts", content: "// bare\n", type: "registry:lib" }],
      },
    });
    const cwd = makeProject();

    const result = await runAdd(addDefaults(cwd, ["bare"]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.packageManager).toBe("pnpm");
    expect(result.data.installCommand).toBeNull();
  });
});
