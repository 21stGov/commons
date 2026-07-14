// SPDX-License-Identifier: MIT

import { describe, expect, it } from "vitest";
import {
  registryFileBasename,
  sha256Hex,
  targetDirFor,
  unsafePathReason,
} from "../src/plan.js";

describe("unsafePathReason", () => {
  it("accepts ordinary relative paths, including Unicode and spaces", () => {
    expect(unsafePathReason("ui/button.tsx")).toBeNull();
    expect(unsafePathReason("ui/knapp åäö.tsx")).toBeNull();
    expect(unsafePathReason("lib/my utils.ts")).toBeNull();
    expect(unsafePathReason("a.tsx")).toBeNull();
  });

  it("rejects traversal, absolute, drive-letter, and UNC paths", () => {
    expect(unsafePathReason("../x")).not.toBeNull();
    expect(unsafePathReason("ui/../../x")).not.toBeNull();
    expect(unsafePathReason("..\\..\\x")).not.toBeNull();
    expect(unsafePathReason("/abs")).not.toBeNull();
    expect(unsafePathReason("\\abs")).not.toBeNull();
    expect(unsafePathReason("C:\\evil")).not.toBeNull();
    expect(unsafePathReason("c:/evil")).not.toBeNull();
    expect(unsafePathReason("\\\\server\\share\\x")).not.toBeNull();
    expect(unsafePathReason("//server/share/x")).not.toBeNull();
    expect(unsafePathReason("")).not.toBeNull();
  });

  it("allows single dots and dot-prefixed names", () => {
    expect(unsafePathReason("./ui/button.tsx")).toBeNull();
    expect(unsafePathReason("ui/.keep")).toBeNull();
  });

  it("rejects Windows-reserved device names, any case, with or without extension", () => {
    expect(unsafePathReason("CON")).not.toBeNull();
    expect(unsafePathReason("con")).not.toBeNull();
    expect(unsafePathReason("nul.txt")).not.toBeNull();
    expect(unsafePathReason("ui/NUL")).not.toBeNull();
    expect(unsafePathReason("AUX/button.tsx")).not.toBeNull();
    expect(unsafePathReason("COM1")).not.toBeNull();
    expect(unsafePathReason("lib/lpt9.ts")).not.toBeNull();
    expect(unsafePathReason("Prn.tar.gz")).not.toBeNull();
    // Not reserved: two-digit device numbers and mere prefixes.
    expect(unsafePathReason("COM10.ts")).toBeNull();
    expect(unsafePathReason("console.ts")).toBeNull();
    expect(unsafePathReason("nullable.ts")).toBeNull();
  });

  it("rejects segments with trailing dots or spaces", () => {
    expect(unsafePathReason("ui/button.tsx.")).not.toBeNull();
    expect(unsafePathReason("ui./button.tsx")).not.toBeNull();
    expect(unsafePathReason("ui/button.tsx ")).not.toBeNull();
    expect(unsafePathReason("dir /file.ts")).not.toBeNull();
    // Interior dots and spaces stay fine.
    expect(unsafePathReason("lib/my utils.ts")).toBeNull();
    expect(unsafePathReason("lib/v1.2/../x")).not.toBeNull(); // still traversal
  });
});

describe("registryFileBasename", () => {
  it("takes the last segment with either separator", () => {
    expect(registryFileBasename("ui/button.tsx")).toBe("button.tsx");
    expect(registryFileBasename("ui\\button.tsx")).toBe("button.tsx");
    expect(registryFileBasename("button.tsx")).toBe("button.tsx");
    expect(registryFileBasename("deep/nested/dir/file.ts")).toBe("file.ts");
  });
});

describe("targetDirFor", () => {
  const paths = { ui: "src/components/ui", components: "src/components", lib: "src/lib" };

  it("maps registry:ui to paths.ui and registry:lib to paths.lib", () => {
    expect(targetDirFor("registry:ui", paths)).toBe("src/components/ui");
    expect(targetDirFor("registry:lib", paths)).toBe("src/lib");
  });

  it("maps everything else to paths.components", () => {
    expect(targetDirFor("registry:component", paths)).toBe("src/components");
    expect(targetDirFor("registry:block", paths)).toBe("src/components");
    expect(targetDirFor("registry:hook", paths)).toBe("src/components");
  });
});

describe("sha256Hex", () => {
  it("hashes UTF-8 content to lowercase hex", () => {
    // sha256("abc")
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
