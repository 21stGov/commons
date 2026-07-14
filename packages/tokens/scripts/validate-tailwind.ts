// SPDX-License-Identifier: MIT
/**
 * validate-tailwind.ts — compiles the BUILT dist/css/tailwind.css bridge with
 * the real Tailwind v4 compiler and asserts that:
 *
 *  1. The bridge parses (valid @theme / @theme inline syntax).
 *  2. Every bridged color token produces a utility whose declaration inlines
 *     the underlying var(--cui-*) reference (runtime theme switching intact).
 *  3. One utility per non-color namespace (spacing, type scale, weights,
 *     leading, measure, radius, shadow, easing) resolves to its --cui-* var.
 *  4. Tailwind's default palette is actually gone (--color-*: initial holds):
 *     stock utilities like bg-red-500 emit nothing.
 *
 * Pure Node — no shelling out, cross-platform. Exits 1 on any failure.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIDGE = join(__dirname, '..', 'dist', 'css', 'tailwind.css');

const bridgeCss = readFileSync(BRIDGE, 'utf8');

// Every color token declared by the bridge: tailwind name -> --cui-* reference.
const colorTokens = new Map<string, string>();
for (const m of bridgeCss.matchAll(/--color-([\w-]+):\s*(var\(--cui-[\w-]+\));/g)) {
  colorTokens.set(m[1], m[2]);
}

const failures: string[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

assert(colorTokens.size >= 120, `Expected 120+ bridged color tokens, found ${colorTokens.size}`);

const compiler = await compile(`${bridgeCss}\n@tailwind utilities;\n`, {
  base: dirname(BRIDGE),
});

// --- 2. Every color token -> one bg-* utility inlining its --cui-* var -------
const colorCandidates = [...colorTokens.keys()].map((name) => `bg-${name}`);
const colorOut = compiler.build(colorCandidates);
for (const [name, cuiRef] of colorTokens) {
  assert(
    colorOut.includes(`.bg-${name}`) && colorOut.includes(cuiRef),
    `bg-${name} did not compile to ${cuiRef}`
  );
}

// --- 3. One utility per non-color namespace ----------------------------------
const SPOT_CHECKS: { candidate: string; expect: string }[] = [
  { candidate: 'p-2', expect: 'var(--cui-spacing-2)' },
  { candidate: 'gap-105', expect: 'var(--cui-spacing-105)' },
  { candidate: 'font-sans', expect: 'var(--cui-font-family-sans)' },
  { candidate: 'text-md', expect: 'var(--cui-font-size-md)' },
  { candidate: 'text-md', expect: 'var(--cui-font-line-height-4)' }, // paired default leading
  { candidate: 'font-semibold', expect: 'var(--cui-font-weight-semibold)' },
  { candidate: 'leading-4', expect: 'var(--cui-font-line-height-4)' },
  { candidate: 'max-w-measure-md', expect: 'var(--cui-font-measure-md)' },
  { candidate: 'rounded-pill', expect: 'var(--cui-radius-pill)' },
  { candidate: 'shadow-2', expect: 'var(--cui-shadow-2)' },
  { candidate: 'ease-standard', expect: 'var(--cui-motion-easing-standard)' },
  { candidate: 'ring-ring', expect: 'var(--cui-focus-ring)' },
  { candidate: 'border-error-border', expect: 'var(--cui-state-error-border)' },
  { candidate: 'text-muted-foreground', expect: 'var(--cui-text-muted)' },
];
for (const { candidate, expect } of SPOT_CHECKS) {
  const out = compiler.build([candidate]);
  assert(out.includes(expect), `${candidate} did not compile to a declaration using ${expect}`);
}

// --- 4. Stock Tailwind palette is really gone ---------------------------------
for (const stock of ['bg-red-500', 'text-slate-900', 'border-zinc-200']) {
  const out = compiler.build([stock]);
  assert(
    !out.includes(`.${stock}`),
    `Stock palette utility ${stock} still compiles — --color-*: initial reset is not working`
  );
}

// --- Report -------------------------------------------------------------------
console.log('Commons Tailwind v4 bridge audit (compiled from dist/ output)');
console.log('==============================================================');
console.log(`Color tokens bridged and compiled: ${colorTokens.size}`);
console.log(`Namespace spot checks: ${SPOT_CHECKS.length}`);
if (failures.length > 0) {
  console.error(`\nFAILURES (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('All Tailwind bridge checks hold.');
