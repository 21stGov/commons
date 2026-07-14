// SPDX-License-Identifier: MIT

import { defineConfig } from "tsup";

export default defineConfig([
  // The CLI binary — gets the node shebang.
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    target: "node22",
    platform: "node",
    clean: true,
    sourcemap: true,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
  // The Workers-safe registry library (@21stgov/commons/registry). No shebang,
  // no Node platform assumptions — it must import cleanly into a Cloudflare
  // Worker. Emits types so consumers get the full contract.
  {
    entry: { "registry/lib": "src/registry/lib.ts" },
    format: ["esm"],
    target: "es2022",
    platform: "neutral",
    dts: true,
    sourcemap: true,
    clean: false,
  },
]);
