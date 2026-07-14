// SPDX-License-Identifier: MIT
/**
 * generate-palette.ts — deterministic, re-runnable generator for the Commons
 * graded color palette (USWDS-style "magic number" contrast contract).
 *
 * THE CONTRACT
 * ------------
 * Every grade g maps to a fixed WCAG relative-luminance target Y(g) that is
 * identical across all families. Targets follow a geometric progression of
 * t(g) = Y(g) + 0.05 so that for ANY two colors from ANY families:
 *
 *   grade delta >= 40  ->  contrast >= 3:1
 *   grade delta >= 50  ->  contrast >= 4.5:1
 *   grade delta >= 70  ->  contrast >= 7:1
 *   grade 50           ->  >= 4.5:1 against BOTH pure white and pure black
 *
 * Derivation: WCAG contrast = (Y1+0.05)/(Y2+0.05) = t1/t2. With
 * t(g) = t50 * r^((g-50)/10), a delta of d*10 grades yields exactly r^-d.
 * We need r^-4 >= 3, r^-5 >= 4.5, r^-7 >= 7; the binding constraint is
 * r <= 4.5^(-1/5) ≈ 0.7401. We pick r = 0.72 for margin, leaving headroom
 * for the +/- Y_TOLERANCE quantization error of 8-bit hex output
 * (worst-case delta-50 pair still >= 4.97:1, delta-40 >= 3.57:1,
 * delta-70 >= 9.6:1, grade-50 vs white/black >= 4.53:1).
 *
 * For each (family, grade) we binary-search OKLCH lightness (culori) to hit
 * the target Y, then fine-scan around the solution so the *hex-quantized*
 * color lands within Y_TOLERANCE of the target. Chroma tapers toward the
 * extremes and is gamut-clamped with culori's clampChroma.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clampChroma, converter, formatHex } from 'culori';
import type { Oklch, Rgb } from 'culori';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'src', 'tokens', 'color.primitives.tokens.json');

// ---------------------------------------------------------------------------
// Contract constants
// ---------------------------------------------------------------------------

export const GRADES = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

const RATIO_PER_10_GRADES = 0.72; // r: t shrinks by this factor per 10 grades
const T_50 = 0.229; // t = Y + 0.05 at grade 50 (>=4.5:1 vs white AND black)
const Y_TOLERANCE = 0.002; // max |Y(hex) - Y(target)| allowed after quantization

/** Target WCAG relative luminance for a grade. Identical across families. */
export function targetLuminance(grade: number): number {
  const t = T_50 * Math.pow(RATIO_PER_10_GRADES, (grade - 50) / 10);
  return t - 0.05;
}

// ---------------------------------------------------------------------------
// Families: OKLCH hue + peak chroma. Gray carries a whisper of blue so its
// channels de-correlate, which lets the quantized-hex fine-scan hit the
// luminance target much more precisely than a pure achromatic ramp could.
// ---------------------------------------------------------------------------

interface Family {
  name: string;
  hue: number;
  peakChroma: number;
}

const FAMILIES: Family[] = [
  { name: 'gray', hue: 255, peakChroma: 0.008 },
  { name: 'blue', hue: 255, peakChroma: 0.12 },
  { name: 'indigo', hue: 275, peakChroma: 0.13 },
  { name: 'cyan', hue: 215, peakChroma: 0.1 },
  { name: 'green', hue: 150, peakChroma: 0.13 },
  { name: 'gold', hue: 85, peakChroma: 0.11 },
  { name: 'orange', hue: 55, peakChroma: 0.14 },
  { name: 'red', hue: 27, peakChroma: 0.15 },
  { name: 'violet', hue: 305, peakChroma: 0.14 },
];

/** Chroma taper: keep midtones vivid, ease off near white/black so the
 *  gamut-clamped result stays tasteful. */
const CHROMA_TAPER: Record<number, number> = {
  5: 0.18,
  10: 0.4,
  20: 0.65,
  30: 0.85,
  40: 1,
  50: 1,
  60: 0.95,
  70: 0.85,
  80: 0.65,
  90: 0.45,
};

// ---------------------------------------------------------------------------
// WCAG relative luminance (sRGB), computed from the quantized 8-bit channels
// so the value we optimize is exactly the value the shipped hex will have.
// ---------------------------------------------------------------------------

function srgbChannelToLinear(c8: number): number {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminanceOfQuantized(r8: number, g8: number, b8: number): number {
  return (
    0.2126 * srgbChannelToLinear(r8) +
    0.7152 * srgbChannelToLinear(g8) +
    0.0722 * srgbChannelToLinear(b8)
  );
}

const toRgb = converter('rgb');

function quantize(x: number): number {
  return Math.min(255, Math.max(0, Math.round(x * 255)));
}

/** OKLCH(l, c, h) -> gamut-clamped, 8-bit-quantized sRGB channels. */
function oklchToQuantizedRgb(l: number, c: number, h: number): [number, number, number] {
  const raw: Oklch = { mode: 'oklch', l, c, h };
  const inGamut = clampChroma(raw, 'oklch');
  const rgb = toRgb(inGamut) as Rgb;
  return [quantize(rgb.r), quantize(rgb.g), quantize(rgb.b)];
}

function luminanceAt(l: number, c: number, h: number): number {
  const [r8, g8, b8] = oklchToQuantizedRgb(l, c, h);
  return luminanceOfQuantized(r8, g8, b8);
}

// ---------------------------------------------------------------------------
// Solver: binary search OKLCH L for the target Y, then fine-scan the
// quantized result to land within Y_TOLERANCE.
// ---------------------------------------------------------------------------

function solveColor(family: Family, grade: number): { hex: string; y: number; err: number } {
  const targetY = targetLuminance(grade);
  const baseChroma = family.peakChroma * CHROMA_TAPER[grade];

  // First try at the family's nominal chroma. Near the gamut extremes the
  // quantized luminance levels can be sparse (channels move in lockstep), so
  // if we miss the tolerance we deterministically re-scan across small chroma
  // offsets — visually imperceptible, but it unlocks many more quantized
  // R/G/B combinations near the target.
  let best = solveAtChroma(family.hue, baseChroma, targetY);
  if (best.err <= Y_TOLERANCE) return best;

  // Walk chroma DOWNWARD from just above nominal so the first in-tolerance
  // candidate is the most chromatic one. (An earlier low-to-high scan with an
  // early break shipped chroma-collapse artifacts: a nominally violet grade 10
  // landed as near-neutral gray because a near-achromatic candidate hit the
  // tolerance first.)
  const cMax = baseChroma + 0.012;
  for (let chroma = cMax; chroma >= 0.002 - 1e-9; chroma -= 0.0005) {
    const candidate = solveAtChroma(family.hue, chroma, targetY);
    if (candidate.err <= Y_TOLERANCE) return candidate;
    if (candidate.err < best.err) best = candidate;
  }

  throw new Error(
    `Could not hit luminance target for ${family.name}.${grade}: ` +
      `target=${targetY.toFixed(5)} err=${best.err.toFixed(5)} (tolerance ${Y_TOLERANCE})`
  );
}

function solveAtChroma(
  hue: number,
  chroma: number,
  targetY: number
): { hex: string; y: number; err: number } {
  // Phase 1: coarse binary search on L (Y is monotonic in OKLCH L).
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (luminanceAt(mid, chroma, hue) < targetY) lo = mid;
    else hi = mid;
  }
  const lCenter = (lo + hi) / 2;

  // Phase 2: fine scan of quantized outputs around the solution. Different
  // RGB channels flip at different L values, so scanning finely exposes many
  // quantized luminance levels between full-pixel steps.
  const SCAN = 0.02;
  const STEP = 0.00001;
  let bestErr = Infinity;
  let best: [number, number, number] = oklchToQuantizedRgb(lCenter, chroma, hue);
  for (let l = Math.max(0, lCenter - SCAN); l <= Math.min(1, lCenter + SCAN); l += STEP) {
    const rgb8 = oklchToQuantizedRgb(l, chroma, hue);
    const err = Math.abs(luminanceOfQuantized(...rgb8) - targetY);
    if (err < bestErr) {
      bestErr = err;
      best = rgb8;
      if (bestErr < 1e-6) break;
    }
  }

  const hex = formatHex({
    mode: 'rgb',
    r: best[0] / 255,
    g: best[1] / 255,
    b: best[2] / 255,
  } as Rgb);
  return { hex, y: luminanceOfQuantized(...best), err: bestErr };
}

// ---------------------------------------------------------------------------
// DTCG output
// ---------------------------------------------------------------------------

interface DtcgColorToken {
  $value: string;
  $description?: string;
}

function main(): void {
  const color: Record<string, Record<string, DtcgColorToken> | DtcgColorToken | string> = {
    $type: 'color',
  } as never;

  let worst = { name: '', err: 0 };

  for (const family of FAMILIES) {
    const grades: Record<string, DtcgColorToken> = {};
    for (const grade of GRADES) {
      const { hex, y, err } = solveColor(family, grade);
      grades[String(grade)] = {
        $value: hex,
        $description: `${family.name} grade ${grade}; WCAG relative luminance ${y.toFixed(4)} (target ${targetLuminance(grade).toFixed(4)})`,
      };
      if (err > worst.err) worst = { name: `${family.name}.${grade}`, err };
    }
    (color as Record<string, unknown>)[family.name] = grades;
  }

  // Absolute anchors used by semantic/theme layers.
  (color as Record<string, unknown>)['white'] = {
    $value: '#ffffff',
    $description: 'Pure white anchor (grade 0 equivalent)',
  };
  (color as Record<string, unknown>)['black'] = {
    $value: '#000000',
    $description: 'Pure black anchor (grade 100 equivalent)',
  };

  const doc = {
    $description:
      'GENERATED FILE — do not edit by hand. Run `pnpm generate` (scripts/generate-palette.ts). ' +
      'Grades encode WCAG contrast: delta >= 40 -> 3:1, >= 50 -> 4.5:1, >= 70 -> 7:1, across ALL families.',
    color,
  };

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(doc, null, 2) + '\n');

  console.log(`Wrote ${OUT_FILE}`);
  console.log(
    `${FAMILIES.length} families x ${GRADES.length} grades = ${FAMILIES.length * GRADES.length} colors (+ white/black anchors)`
  );
  console.log(`Worst luminance error: ${worst.err.toExponential(3)} at ${worst.name} (tolerance ${Y_TOLERANCE})`);
}

main();
