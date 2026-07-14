// SPDX-License-Identifier: MIT

// Build script for @21stgov/commons-core.
// 1. Bundles src/index.css (inlining its @imports) into dist/index.css via
//    lightningcss.
// 2. Copies the individual source files into dist/ so consumers can pull a
//    single layer via the "@21stgov/commons-core/css/*" export.

import { bundle } from 'lightningcss';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(pkgDir, 'src');
const distDir = join(pkgDir, 'dist');

const sourceFiles = ['index.css', 'reset.css', 'base.css', 'a11y.css'];
const header = '/* SPDX-License-Identifier: MIT */\n';

async function main() {
  await mkdir(distDir, { recursive: true });

  const { code, warnings } = bundle({
    filename: join(srcDir, 'index.css'),
    minify: false,
    errorRecovery: false,
  });

  for (const warning of warnings ?? []) {
    console.warn(`[lightningcss] ${warning.message}`);
  }

  await writeFile(join(distDir, 'index.css'), header + code.toString());

  // Individual layers keep their @imports intact (copied verbatim), except
  // index.css which is the bundled artifact written above.
  await Promise.all(
    sourceFiles
      .filter((file) => file !== 'index.css')
      .map((file) => copyFile(join(srcDir, file), join(distDir, file))),
  );

  console.log('@21stgov/commons-core: built dist/index.css (bundled) + copied source layers to dist/.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
