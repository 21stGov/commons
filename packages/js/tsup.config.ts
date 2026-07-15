// SPDX-License-Identifier: MIT

import { defineConfig } from 'tsup'

// Two builds from one entry:
//   - ESM (dist/index.js): for bundlers / `import { enhance } from '@21stgov/commons-js'`.
//   - IIFE (dist/index.global.js): a self-contained `window.Commons` for a plain
//     `<script src=".../index.global.js">` (auto-enhances on load — see index.ts).
// No dependencies, so the IIFE is the whole runtime with nothing to externalize.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'iife'],
  globalName: 'Commons',
  dts: true,
  sourcemap: false,
  clean: true,
  target: 'es2022',
})
