// SPDX-License-Identifier: MIT

import { afterEach, describe, expect, it, vi } from "vitest";
import { formatInspect, runInspect } from "../src/commands/inspect.js";
import { EXIT } from "../src/output.js";
import { cleanupProjects, makeProject, stubRegistry } from "./helpers.js";

const buttonItem = {
  $schema: "https://commonsui.com/schema/registry-item.v1.json",
  schemaVersion: "1",
  name: "button",
  type: "registry:ui",
  title: "Button",
  version: "0.1.0",
  status: "experimental",
  description: "Initiates an immediate action.",
  useWhen: ["Submitting a form"],
  avoidWhen: ["Navigating to another page"],
  dependencies: ["@base-ui-components/react"],
  registryDependencies: ["cn"],
  files: [{ path: "ui/button.tsx", content: "export {}\n", type: "registry:ui" }],
  accessibility: {
    standard: "WCAG 2.2 AA",
    keyboard: ["Enter or Space activates"],
    nameRequired: true,
    targetSize: "44px project default",
  },
  docs: "https://commonsui.com/docs/components/button",
  futureField: "kept as-is",
};

afterEach(() => {
  vi.unstubAllGlobals();
  cleanupProjects();
});

describe("runInspect", () => {
  it("returns the full validated item, preserving unknown fields", async () => {
    stubRegistry({ button: buttonItem });
    const cwd = makeProject();

    const result = await runInspect({ cwd, name: "button" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("button");
    expect(result.data.status).toBe("experimental");
    expect((result.data as Record<string, unknown>).futureField).toBe("kept as-is");
  });

  it("exits 2 for an unknown item (404)", async () => {
    stubRegistry({});
    const cwd = makeProject();

    const result = await runInspect({ cwd, name: "nope" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.REGISTRY);
    expect(result.error.code).toBe("NOT_FOUND");
  });

  it("exits 3 for an item that fails schema validation", async () => {
    stubRegistry({ bad: { name: "bad", type: "registry:widget" } });
    const cwd = makeProject();

    const result = await runInspect({ cwd, name: "bad" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.VALIDATION);
    expect(result.error.code).toBe("INVALID_SCHEMA");
  });

  it("exits 1 on an empty name", async () => {
    const cwd = makeProject();
    const result = await runInspect({ cwd, name: "" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.exitCode).toBe(EXIT.USER);
  });
});

describe("formatInspect", () => {
  it("summarizes title, status, guidance, accessibility, files, and deps", async () => {
    stubRegistry({ button: buttonItem });
    const cwd = makeProject();
    const result = await runInspect({ cwd, name: "button" });
    if (!result.ok) throw new Error("expected success");

    const text = formatInspect(result.data);
    expect(text).toContain("Button (button) [registry:ui]");
    expect(text).toContain("status: experimental");
    expect(text).toContain("version: 0.1.0");
    expect(text).toContain("use when:");
    expect(text).toContain("avoid when:");
    expect(text).toContain("WCAG 2.2 AA");
    expect(text).toContain("ui/button.tsx");
    expect(text).toContain("@base-ui-components/react");
    expect(text).toContain("registry dependencies: cn");
  });
});
