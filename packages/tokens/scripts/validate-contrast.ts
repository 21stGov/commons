// SPDX-License-Identifier: MIT
/**
 * validate-contrast.ts — independent WCAG 2.x contrast audit of the BUILT
 * dist/ output (not the token sources). Exits 1 on any failure.
 *
 * Checks:
 *  1. The palette "magic number" contract, for EVERY pair of graded colors
 *     across ALL families (grade delta >= 40 -> 3:1, >= 50 -> 4.5:1,
 *     >= 70 -> 7:1).
 *  2. Grade 50 of every family >= 4.5:1 against pure white AND pure black.
 *  3. Every semantic text/bg pairing in every theme (light + dark >= 4.5:1,
 *     high-contrast >= 7:1), including disabled text — held to the same bar
 *     as regular text even though WCAG 1.4.3 exempts disabled controls.
 *  4. Every border vs its background >= 3:1 in every theme, including
 *     disabled borders (WCAG 1.4.11 exempts them; our contract does not).
 *  5. Focus ring vs bg.default AND bg.emphasis >= 3:1 in every theme.
 *
 * WCAG relative luminance and contrast are implemented here from the spec
 * (https://www.w3.org/TR/WCAG22/#dfn-relative-luminance) as an independent
 * check — deliberately NOT shared with the generator's color library.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

// ---------------------------------------------------------------------------
// WCAG math (independent implementation)
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h.split('').map((c) => c + c).join('')
      : h.slice(0, 6); // ignore alpha nibbles if present
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c8) => {
    const c = c8 / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hexA: string, hexB: string): number {
  const ya = relativeLuminance(hexA);
  const yb = relativeLuminance(hexB);
  const [hi, lo] = ya >= yb ? [ya, yb] : [yb, ya];
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------------------
// Parse built CSS
// ---------------------------------------------------------------------------

function parseCssVars(file: string): Map<string, string> {
  const css = readFileSync(join(DIST, 'css', file), 'utf8');
  const vars = new Map<string, string>();
  for (const m of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    vars.set(m[1], m[2].trim());
  }
  return vars;
}

/** Resolve a value that may be `var(--cui-...)` (possibly chained) to hex. */
function resolve(value: string, ...scopes: Map<string, string>[]): string {
  let v = value;
  for (let i = 0; i < 10; i++) {
    const ref = v.match(/^var\(--([\w-]+)\)$/);
    if (!ref) return v;
    const next = scopes.map((s) => s.get(ref[1])).find((x) => x !== undefined);
    if (next === undefined) throw new Error(`Unresolvable reference: ${value}`);
    v = next;
  }
  throw new Error(`Reference chain too deep: ${value}`);
}

// ---------------------------------------------------------------------------
// Check runner
// ---------------------------------------------------------------------------

interface Result {
  label: string;
  required: number;
  actual: number;
  pass: boolean;
}

const results: Result[] = [];

function check(label: string, hexA: string, hexB: string, required: number): void {
  const actual = contrast(hexA, hexB);
  results.push({ label, required, actual, pass: actual >= required });
}

const primitives = parseCssVars('primitives.css');

// --- 1. Magic-number contract across every graded pair -----------------------
const graded: { family: string; grade: number; hex: string }[] = [];
for (const [name, value] of primitives) {
  const m = name.match(/^cui-color-([a-z]+)-(\d+)$/);
  if (m) graded.push({ family: m[1], grade: Number(m[2]), hex: value });
}
if (graded.length !== 90) {
  console.error(`Expected 90 graded palette colors in primitives.css, found ${graded.length}`);
  process.exit(1);
}

let magicChecks = 0;
// Worst pair at each contract boundary, for the summary table.
const worstAtBoundary = new Map<number, Result>();
for (const a of graded) {
  for (const b of graded) {
    const delta = b.grade - a.grade;
    if (delta < 40) continue;
    const required = delta >= 70 ? 7 : delta >= 50 ? 4.5 : 3;
    const actual = contrast(a.hex, b.hex);
    magicChecks++;
    const r: Result = {
      label: `${a.family}.${a.grade} vs ${b.family}.${b.grade} (delta ${delta})`,
      required,
      actual,
      pass: actual >= required,
    };
    if (!r.pass) results.push(r);
    const prev = worstAtBoundary.get(required);
    if (!prev || actual < prev.actual) worstAtBoundary.set(required, r);
  }
}

// --- 2. Grade 50 vs white and black ------------------------------------------
const white = '#ffffff';
const black = '#000000';
for (const c of graded.filter((g) => g.grade === 50)) {
  check(`${c.family}.50 vs white`, c.hex, white, 4.5);
  check(`${c.family}.50 vs black`, c.hex, black, 4.5);
}

// --- 3/4/5. Semantic pairings per theme --------------------------------------
const STATES = ['info', 'warning', 'error', 'success', 'emergency'] as const;

const THEMES = [
  { name: 'light', file: 'theme-light.css', text: 4.5, disabled: 4.5 },
  { name: 'dark', file: 'theme-dark.css', text: 4.5, disabled: 4.5 },
  { name: 'high-contrast', file: 'theme-high-contrast.css', text: 7, disabled: 7 },
] as const;

for (const theme of THEMES) {
  const vars = parseCssVars(theme.file);
  const hex = (semantic: string): string => {
    const raw = vars.get(`cui-${semantic}`);
    if (raw === undefined) throw new Error(`Missing --cui-${semantic} in ${theme.file}`);
    return resolve(raw, vars, primitives);
  };
  const t = (label: string, fg: string, bg: string, required: number) =>
    check(`[${theme.name}] ${label}`, hex(fg), hex(bg), required);

  // Text on backgrounds
  for (const bg of ['bg-default', 'bg-subtle']) {
    t(`text-default on ${bg}`, 'text-default', bg, theme.text);
    t(`text-muted on ${bg}`, 'text-muted', bg, theme.text);
    t(`link-default on ${bg}`, 'link-default', bg, theme.text);
    t(`link-visited on ${bg}`, 'link-visited', bg, theme.text);
    t(`link-hover on ${bg}`, 'link-hover', bg, theme.text);
  }
  t('text-on-emphasis on bg-emphasis', 'text-on-emphasis', 'bg-emphasis', theme.text);
  for (const s of STATES) {
    t(`state-${s}-text on state-${s}-bg`, `state-${s}-text`, `state-${s}-bg`, theme.text);
  }
  t('disabled-text on disabled-bg', 'disabled-text', 'disabled-bg', theme.disabled);

  // Action tokens: text must clear the bar against EVERY state fill
  for (const a of ['primary', 'secondary', 'danger'] as const) {
    for (const state of ['bg', 'hover', 'active'] as const) {
      t(`action-${a}-text on action-${a}-${state}`, `action-${a}-text`, `action-${a}-${state}`, theme.text);
    }
  }

  // Borders (UI components: >= 3:1 in every theme)
  for (const bg of ['bg-default', 'bg-subtle']) {
    t(`border-default vs ${bg}`, 'border-default', bg, 3);
    t(`border-strong vs ${bg}`, 'border-strong', bg, 3);
  }
  for (const s of STATES) {
    t(`state-${s}-border vs state-${s}-bg`, `state-${s}-border`, `state-${s}-bg`, 3);
  }
  t('disabled-border vs disabled-bg', 'disabled-border', 'disabled-bg', 3);
  t('disabled-border vs bg-default', 'disabled-border', 'bg-default', 3);

  // Focus ring
  t('focus-ring vs bg-default', 'focus-ring', 'bg-default', 3);
  t('focus-ring vs bg-emphasis', 'focus-ring', 'bg-emphasis', 3);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const failures = results.filter((r) => !r.pass);

function row(label: string, required: number, actual: number, pass: boolean): string {
  const status = pass ? 'PASS' : 'FAIL';
  return `  ${status}  ${actual.toFixed(2).padStart(6)} (needs ${String(required).padStart(3)})  ${label}`;
}

console.log('Commons token contrast audit (recomputed from dist/ output)');
console.log('============================================================');
console.log(`\nMagic-number contract: ${magicChecks} graded pairs checked across 9 families`);
console.log('Worst pair at each contract boundary:');
for (const required of [3, 4.5, 7]) {
  const w = worstAtBoundary.get(required);
  if (w) console.log(row(w.label, w.required, w.actual, w.pass));
}

const grade50 = results.filter((r) => r.label.includes('.50 vs'));
const worst50 = grade50.reduce((a, b) => (b.actual < a.actual ? b : a));
console.log(`\nGrade 50 vs white/black: ${grade50.length} checks; worst:`);
console.log(row(worst50.label, worst50.required, worst50.actual, worst50.pass));

for (const theme of THEMES) {
  const themed = results.filter((r) => r.label.startsWith(`[${theme.name}]`));
  const worst = [...themed].sort((a, b) => a.actual / a.required - b.actual / b.required).slice(0, 3);
  console.log(`\nTheme '${theme.name}': ${themed.length} semantic checks; tightest margins:`);
  for (const w of worst) console.log(row(w.label, w.required, w.actual, w.pass));
}

const totalChecks = magicChecks + results.length;
console.log(`\nTotal: ${totalChecks} checks, ${failures.length} failures`);

if (failures.length > 0) {
  console.error('\nFAILURES:');
  for (const f of failures) console.error(row(f.label, f.required, f.actual, f.pass));
  process.exit(1);
}
console.log('All contrast guarantees hold.');
