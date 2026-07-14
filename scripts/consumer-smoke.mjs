// SPDX-License-Identifier: MIT
// Consumer-contract smoke test: install the packed Commons tarballs into a
// fresh temp project on the CURRENT Node (CI runs this on the minimum
// supported consumer version) and verify each package is usable.
// Cross-platform by design: node:path/os/fs only, argument-array spawns,
// no POSIX-only shell (docs/research/platform-support.md).

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const tarballDir = resolve(process.argv[2] ?? "");
if (!tarballDir || !existsSync(tarballDir)) {
  console.error("Usage: node scripts/consumer-smoke.mjs <tarball-dir>");
  process.exit(1);
}

const tarballs = readdirSync(tarballDir).filter((f) => f.endsWith(".tgz"));
if (tarballs.length === 0) {
  console.error(`No .tgz tarballs found in ${tarballDir}`);
  process.exit(1);
}
console.log(`Node ${process.version} — testing ${tarballs.length} tarballs`);

const work = mkdtempSync(join(tmpdir(), "commons-consumer-"));
writeFileSync(
  join(work, "package.json"),
  JSON.stringify({ name: "consumer-smoke", private: true, type: "module" }, null, 2),
);

// npm ships with Node on CI runners; install all tarballs at once.
execFileSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["install", "--no-audit", "--no-fund", ...tarballs.map((t) => join(tarballDir, t))],
  { cwd: work, stdio: "inherit", shell: false },
);

const require = (await import("node:module")).createRequire(join(work, "package.json"));
const checks = [];

// tokens: CSS + JSON exports resolve and parse.
checks.push(["tokens css", () => require.resolve("@21stgov/commons-tokens/index.css")]);
checks.push([
  "tokens json",
  () => {
    const tokens = require("@21stgov/commons-tokens/tokens.json");
    if (!tokens || typeof tokens !== "object") throw new Error("tokens.json unusable");
  },
]);
// core: CSS export resolves.
checks.push(["core css", () => require.resolve("@21stgov/commons-core/index.css")]);
// react: ESM import works and cn() behaves.
checks.push([
  "react cn()",
  async () => {
    const mod = await import(
      pathToFileURL(require.resolve("@21stgov/commons-react")).href
    );
    const out = mod.cn("a", { b: true, c: false });
    if (out !== "a b") throw new Error(`cn() returned ${JSON.stringify(out)}`);
  },
]);
// cli: bin runs on this Node and prints usage.
checks.push([
  "cli --help",
  () => {
    const binJs = require.resolve("@21stgov/commons/package.json");
    const bin = join(binJs, "..", "dist", "index.js");
    const out = execFileSync(process.execPath, [bin, "--help"], { encoding: "utf8" });
    if (!/commons/i.test(out)) throw new Error("cli --help output unexpected");
  },
]);

let failed = 0;
for (const [name, fn] of checks) {
  try {
    await fn();
    console.log(`  PASS ${name}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL ${name}: ${err.message}`);
  }
}
if (failed > 0) {
  console.error(`${failed} consumer smoke checks failed`);
  process.exit(1);
}
console.log("All consumer smoke checks passed.");
