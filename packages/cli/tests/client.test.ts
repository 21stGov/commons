// SPDX-License-Identifier: MIT

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RegistryError,
  fetchRegistryIndex,
  fetchRegistryItem,
  registryIndexUrl,
  registryItemUrl,
} from "../src/registry/client.js";

const BASE = "https://commonsui.com/r";

const validItem = {
  name: "button",
  type: "registry:ui",
  title: "Button",
  files: [
    {
      path: "ui/button.tsx",
      content: "export function Button() {}\n",
      type: "registry:ui",
      target: "@/components/ui/button.tsx",
    },
  ],
  dependencies: ["@base-ui-components/react"],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("registryItemUrl", () => {
  it("builds {base}/{name}.json", () => {
    expect(registryItemUrl(BASE, "button")).toBe("https://commonsui.com/r/button.json");
  });

  it("strips trailing slashes from the base URL", () => {
    expect(registryItemUrl("https://commonsui.com/r/", "button")).toBe(
      "https://commonsui.com/r/button.json",
    );
  });

  it("URL-encodes item names so they cannot traverse the registry path", () => {
    expect(registryItemUrl(BASE, "../evil")).toBe("https://commonsui.com/r/..%2Fevil.json");
  });
});

describe("registryIndexUrl", () => {
  it("builds {base}/index.json", () => {
    expect(registryIndexUrl(`${BASE}/`)).toBe("https://commonsui.com/r/index.json");
  });
});

describe("fetchRegistryItem", () => {
  it("fetches and validates a registry item (happy path)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(validItem));
    vi.stubGlobal("fetch", fetchMock);

    const item = await fetchRegistryItem(BASE, "button");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://commonsui.com/r/button.json",
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );
    expect(item.name).toBe("button");
    expect(item.files?.[0]?.content).toContain("Button");
  });

  it("throws NOT_FOUND with a helpful message on 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 404 })));

    const error = await fetchRegistryItem(BASE, "no-such-thing").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RegistryError);
    expect((error as RegistryError).code).toBe("NOT_FOUND");
    expect((error as RegistryError).message).toContain('"no-such-thing"');
    expect((error as RegistryError).message).toContain("https://commonsui.com/r/no-such-thing.json");
  });

  it("throws HTTP on non-404 server errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 500 })));

    const error = await fetchRegistryItem(BASE, "button").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RegistryError);
    expect((error as RegistryError).code).toBe("HTTP");
    expect((error as RegistryError).message).toContain("500");
  });

  it("throws INVALID_SCHEMA when the payload does not match the registry-item schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ name: "button", type: "registry:widget" })),
    );

    const error = await fetchRegistryItem(BASE, "button").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RegistryError);
    expect((error as RegistryError).code).toBe("INVALID_SCHEMA");
    expect((error as RegistryError).message).toContain("registry-item schema");
  });

  it("throws INVALID_JSON when the payload is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>not json</html>", { status: 200 })),
    );

    const error = await fetchRegistryItem(BASE, "button").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RegistryError);
    expect((error as RegistryError).code).toBe("INVALID_JSON");
  });

  it("throws NETWORK when fetch itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const error = await fetchRegistryItem(BASE, "button").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RegistryError);
    expect((error as RegistryError).code).toBe("NETWORK");
    expect((error as RegistryError).message).toContain("commons.json");
  });
});

describe("fetchRegistryIndex", () => {
  const entries = [{ name: "button", title: "Button" }, { name: "cn" }];

  it("fetches a bare-array catalog", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(entries)));
    const index = await fetchRegistryIndex(BASE);
    expect(index.map((entry) => entry.name)).toEqual(["button", "cn"]);
  });

  it("fetches an object catalog with an items array", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ items: entries })));
    const index = await fetchRegistryIndex(BASE);
    expect(index).toHaveLength(2);
  });

  it("throws NOT_FOUND when the catalog is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 404 })));
    const error = await fetchRegistryIndex(BASE).catch((e: unknown) => e);
    expect((error as RegistryError).code).toBe("NOT_FOUND");
  });

  it("throws INVALID_SCHEMA on a malformed catalog", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ items: [{ title: "x" }] })));
    const error = await fetchRegistryIndex(BASE).catch((e: unknown) => e);
    expect((error as RegistryError).code).toBe("INVALID_SCHEMA");
  });
});
