// SPDX-License-Identifier: MIT

import { afterEach, describe, expect, it, vi } from "vitest";

import { getComponent, getSetup, planInstall, searchComponents } from "../src/tools.js";

const REGISTRY = "https://registry.test/r";

// A tiny fake registry: catalog + two items where `button` depends on `cn`.
const CATALOG = [
  { name: "button", type: "registry:ui", title: "Button", description: "A clickable button", useWhen: ["trigger an action"] },
  { name: "cn", type: "registry:lib", title: "cn", description: "class name helper" },
  { name: "card", type: "registry:ui", title: "Card", description: "A surface" },
];

const ITEMS: Record<string, unknown> = {
  button: {
    name: "button",
    type: "registry:ui",
    files: [{ path: "ui/button.tsx", content: "// button", type: "registry:ui" }],
    dependencies: ["class-variance-authority", "clsx"],
    registryDependencies: ["cn"],
  },
  cn: {
    name: "cn",
    type: "registry:lib",
    files: [{ path: "lib/cn.ts", content: "// cn", type: "registry:lib" }],
    dependencies: ["clsx", "tailwind-merge"],
  },
};

/** Stub global fetch with the fake registry. Unknown items → 404. */
function stubRegistry() {
  vi.stubGlobal("fetch", async (input: string | URL) => {
    const url = String(input);
    if (url.endsWith("/index.json")) {
      return new Response(JSON.stringify(CATALOG), { headers: { "content-type": "application/json" } });
    }
    const match = url.match(/\/r\/([^/]+)\.json$/);
    const name = match?.[1];
    if (name && ITEMS[name]) {
      return new Response(JSON.stringify(ITEMS[name]), { headers: { "content-type": "application/json" } });
    }
    return new Response("not found", { status: 404 });
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("searchComponents", () => {
  it("matches on name/title/description/useWhen and honors the limit", async () => {
    stubRegistry();
    const result = await searchComponents(REGISTRY, "action", 10); // matches button.useWhen
    expect(result.results.map((r) => r.name)).toEqual(["button"]);
    expect(result.schemaVersion).toBe("1");
    expect(result.registry).toBe(REGISTRY);
  });

  it("returns an empty list for no match (not an error)", async () => {
    stubRegistry();
    const result = await searchComponents(REGISTRY, "zzz-nothing", 10);
    expect(result.results).toEqual([]);
  });

  it("caps results at the limit", async () => {
    stubRegistry();
    const result = await searchComponents(REGISTRY, "a", 1); // several entries contain "a"
    expect(result.results).toHaveLength(1);
  });
});

describe("getComponent", () => {
  it("returns the validated registry item", async () => {
    stubRegistry();
    const result = await getComponent(REGISTRY, "button");
    expect(result.item.name).toBe("button");
    expect(result.item.files?.[0]?.path).toBe("ui/button.tsx");
  });

  it("throws a NOT_FOUND registry error for a missing component", async () => {
    stubRegistry();
    await expect(getComponent(REGISTRY, "nope")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("planInstall", () => {
  it("resolves transitive deps in install order and aggregates npm deps", async () => {
    stubRegistry();
    const result = await planInstall(REGISTRY, ["button"]);
    // cn is a registryDependency of button → installed first.
    expect(result.items).toEqual(["cn", "button"]);
    expect(result.files.map((f) => f.path)).toEqual(["lib/cn.ts", "ui/button.tsx"]);
    expect(result.dependencies).toEqual(["class-variance-authority", "clsx", "tailwind-merge"]);
    expect(result.command).toBe("npx @21stgov/commons add button");
  });
});

describe("getSetup", () => {
  it("returns the five CSS imports, alias, and init command", () => {
    const result = getSetup(REGISTRY);
    expect(result.cssImports).toHaveLength(5);
    expect(result.registryUrl).toBe(REGISTRY);
    expect(result.initCommand).toBe("npx @21stgov/commons init");
  });
});
