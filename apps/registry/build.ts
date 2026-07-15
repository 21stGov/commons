// SPDX-License-Identifier: MIT

/** Entry point: `pnpm build` (tsx build.ts). Emits the static registry to dist/r. */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildRegistry } from "./src/registry-build.ts";

const packageDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(packageDir, "..", "..");
const reactDir = join(repoRoot, "packages", "react");
const demosDir = join(repoRoot, "apps", "html-playground", "src", "generated", "demos");

const reactPackage = JSON.parse(readFileSync(join(reactDir, "package.json"), "utf8")) as {
  version: string;
};

const result = buildRegistry({
  reactDir,
  demosDir,
  outDir: join(packageDir, "dist", "r"),
  version: reactPackage.version,
});

console.log(
  `registry: wrote ${result.files.length} files to dist/r ` +
    `(${result.items.map((item) => item.name).join(", ")})`,
);
