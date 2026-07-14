// SPDX-License-Identifier: MIT

import { describe, expect, it } from "vitest";
import {
  registryIndexSchema,
  registryItemFileSchema,
  registryItemSchema,
  registrySchema,
} from "../src/registry/schema.js";

const validButtonItem = {
  $schema: "https://commonsui.com/schema/registry-item.v1.json",
  schemaVersion: "1",
  name: "button",
  type: "registry:ui",
  title: "Button",
  version: "0.1.0",
  status: "experimental",
  description: "An accessible button with 44px default touch target.",
  useWhen: ["Submitting a form", "Confirming an explicit action"],
  avoidWhen: ["Navigating to another page"],
  dependencies: ["@base-ui-components/react"],
  registryDependencies: ["cn"],
  files: [
    {
      path: "ui/button.tsx",
      content: "// SPDX-License-Identifier: MIT\nexport function Button() {}\n",
      type: "registry:ui",
      target: "@/components/ui/button.tsx",
    },
  ],
  cssVars: {
    theme: { "commons-focus-ring-width": "0.1875rem" },
    light: { "commons-color-action-default": "var(--commons-blue-60)" },
    dark: { "commons-color-action-default": "var(--commons-blue-30)" },
    "high-contrast": { "commons-color-action-default": "var(--commons-blue-80)" },
  },
  compatibility: { react: ">=19", rtl: true, forcedColors: true },
  accessibility: {
    standard: "WCAG 2.2 AA",
    keyboard: ["Tab moves focus to the button", "Enter or Space activates"],
    nameRequired: true,
    targetSize: "44px project default",
    highContrastTested: true,
    screenReadersTested: [],
  },
  integrity: {
    "ui/button.tsx": "sha256-0000000000000000000000000000000000000000000000000000000000000000",
  },
  docs: "https://commonsui.com/docs/components/button",
};

describe("registryItemSchema", () => {
  it("accepts a fully populated v1 registry item", () => {
    const result = registryItemSchema.safeParse(validButtonItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("button");
      expect(result.data.files).toHaveLength(1);
      expect(result.data.status).toBe("experimental");
      expect(result.data.useWhen).toHaveLength(2);
      expect(result.data.accessibility?.standard).toBe("WCAG 2.2 AA");
      expect(result.data.cssVars?.["high-contrast"]).toBeDefined();
    }
  });

  it("accepts a minimal registry item (name + type only)", () => {
    const result = registryItemSchema.safeParse({
      name: "focus-ring",
      type: "registry:style",
    });
    expect(result.success).toBe(true);
  });

  it("does not fail on unknown fields (forward compatibility)", () => {
    const result = registryItemSchema.safeParse({
      ...validButtonItem,
      futureField: { anything: true },
      files: [{ ...validButtonItem.files[0], futureFileField: 1 }],
      accessibility: { ...validButtonItem.accessibility, futureA11yField: "x" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).futureField).toEqual({ anything: true });
    }
  });

  it("accepts a per-item integrity string", () => {
    const result = registryItemSchema.safeParse({
      ...validButtonItem,
      integrity: "sha256-abc123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts every documented registry item type", () => {
    const types = [
      "registry:ui",
      "registry:component",
      "registry:block",
      "registry:lib",
      "registry:hook",
      "registry:style",
      "registry:theme",
    ];
    for (const type of types) {
      expect(registryItemSchema.safeParse({ name: "x", type }).success).toBe(true);
    }
  });

  it("rejects an unknown registry item type", () => {
    const result = registryItemSchema.safeParse({
      name: "button",
      type: "registry:widget",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an item with no name", () => {
    expect(registryItemSchema.safeParse({ type: "registry:ui" }).success).toBe(false);
    expect(registryItemSchema.safeParse({ name: "", type: "registry:ui" }).success).toBe(false);
  });

  it("rejects files entries without a path", () => {
    const result = registryItemSchema.safeParse({
      name: "button",
      type: "registry:ui",
      files: [{ type: "registry:ui", content: "x" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects files entries without content (v1 requires inline content)", () => {
    const result = registryItemSchema.safeParse({
      name: "button",
      type: "registry:ui",
      files: [{ path: "ui/button.tsx", type: "registry:ui" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string css variable values", () => {
    const result = registryItemSchema.safeParse({
      name: "button",
      type: "registry:ui",
      cssVars: { light: { "commons-color-action-default": 42 } },
    });
    expect(result.success).toBe(false);
  });
});

describe("registryItemFileSchema", () => {
  it("accepts a file without a target", () => {
    const result = registryItemFileSchema.safeParse({
      path: "lib/utils.ts",
      content: "export {};\n",
      type: "registry:lib",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty path", () => {
    const result = registryItemFileSchema.safeParse({
      path: "",
      content: "x",
      type: "registry:lib",
    });
    expect(result.success).toBe(false);
  });
});

describe("registrySchema", () => {
  it("accepts a registry index with items", () => {
    const result = registrySchema.safeParse({
      $schema: "https://commonsui.com/schema/registry.json",
      name: "commons",
      homepage: "https://commonsui.com",
      items: [validButtonItem, { name: "alert", type: "registry:ui" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a registry index missing items", () => {
    expect(registrySchema.safeParse({ name: "commons" }).success).toBe(false);
  });

  it("rejects a registry index containing an invalid item", () => {
    const result = registrySchema.safeParse({
      name: "commons",
      items: [{ name: "button", type: "not-a-type" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("registryIndexSchema (catalog at index.json)", () => {
  const entries = [
    {
      name: "button",
      type: "registry:ui",
      title: "Button",
      description: "Initiates an immediate action.",
      status: "stable",
      useWhen: ["Submitting a form"],
    },
    { name: "cn" },
  ];

  it("accepts a bare array of entries", () => {
    expect(registryIndexSchema.safeParse(entries).success).toBe(true);
  });

  it("accepts an object with an items array and unknown fields", () => {
    const result = registryIndexSchema.safeParse({
      $schema: "https://commonsui.com/schema/registry-index.v1.json",
      generatedAt: "2026-07-11",
      items: entries,
    });
    expect(result.success).toBe(true);
  });

  it("rejects entries without a name", () => {
    expect(registryIndexSchema.safeParse([{ title: "Button" }]).success).toBe(false);
  });
});
