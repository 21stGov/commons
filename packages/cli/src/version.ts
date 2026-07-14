// SPDX-License-Identifier: MIT

import { readFileSync } from "node:fs";

/**
 * The @21stgov/commons package version, read from package.json.
 *
 * The `../package.json` URL resolves correctly both from `src/` (tests
 * run TypeScript directly) and from the bundled `dist/index.js`.
 */
export const CLI_VERSION = (
  JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    version: string;
  }
).version;
