// SPDX-License-Identifier: MIT
/**
 * build.ts — compiles the DTCG token sources with Style Dictionary into:
 *
 *   dist/css/primitives.css           :root primitives (--cui-color-blue-60, ...)
 *   dist/css/theme-light.css          :root, [data-theme='light'] semantic vars -> var(--cui-*)
 *   dist/css/theme-dark.css           [data-theme='dark'] + prefers-color-scheme fallback
 *   dist/css/theme-high-contrast.css  [data-theme='high-contrast'] + prefers-contrast fallback
 *   dist/css/tailwind.css             Tailwind v4 @theme inline bridge (--cui-* -> theme tokens)
 *   dist/json/tokens.json             flat resolved token map
 *   dist/index.css                    imports all of the above in cascade order
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';
import type { Config, FormatFn } from 'style-dictionary/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'src', 'tokens');
const DIST = join(__dirname, 'dist');

const PREFIX = 'cui';

const PRIMITIVE_SOURCES = [
  join(SRC, 'color.primitives.tokens.json'),
  join(SRC, 'dimension.spacing.tokens.json'),
  join(SRC, 'typography.tokens.json'),
  join(SRC, 'radius.tokens.json'),
  join(SRC, 'shadow.tokens.json'),
  join(SRC, 'zindex.tokens.json'),
  join(SRC, 'motion.tokens.json'),
  join(SRC, 'breakpoint.tokens.json'),
  join(SRC, 'focus.tokens.json'),
];

const CSS_TRANSFORMS = [
  'name/kebab',
  'color/css',
  'fontFamily/css',
  'cubicBezier/css',
  'shadow/css/shorthand',
];

/** Only emit tokens that were (re)defined by the semantic/theme layer. */
const themeFilter = (filePathPart: string) => (token: { filePath: string }) =>
  token.filePath.includes(filePathPart);

/**
 * Custom format: semantic variables wrapped in an explicit data-theme selector
 * PLUS a media-query fallback for users who never picked a theme.
 */
const themedVariables =
  (selector: string, mediaQuery: string): FormatFn =>
  async ({ dictionary, file, options }) => {
    const header = await fileHeader({ file });
    const vars = formattedVariables({
      format: 'css',
      dictionary,
      outputReferences: options.outputReferences,
      usesDtcg: options.usesDtcg,
    });
    const indented = vars
      .split('\n')
      .map((line) => (line.trim().length > 0 ? `  ${line}` : line))
      .join('\n');
    return (
      header +
      `${selector} {\n${vars}\n}\n\n` +
      `@media ${mediaQuery} {\n  :root:not([data-theme]) {\n${indented}\n  }\n}\n`
    );
  };

StyleDictionary.registerFormat({
  name: 'css/variables-themed-dark',
  format: themedVariables("[data-theme='dark']", '(prefers-color-scheme: dark)'),
});

StyleDictionary.registerFormat({
  name: 'css/variables-themed-high-contrast',
  format: themedVariables("[data-theme='high-contrast']", '(prefers-contrast: more)'),
});

function themeConfig(theme: 'light' | 'dark' | 'high-contrast'): Config {
  const sources =
    theme === 'light'
      ? [join(SRC, 'semantic.tokens.json'), join(SRC, 'themes', 'light.tokens.json')]
      : [join(SRC, 'semantic.tokens.json'), join(SRC, 'themes', `${theme}.tokens.json`)];

  const format =
    theme === 'light'
      ? 'css/variables'
      : theme === 'dark'
        ? 'css/variables-themed-dark'
        : 'css/variables-themed-high-contrast';

  return {
    log: { verbosity: 'silent' },
    include: PRIMITIVE_SOURCES,
    source: sources,
    platforms: {
      css: {
        transforms: CSS_TRANSFORMS,
        prefix: PREFIX,
        buildPath: `${DIST}/css/`,
        files: [
          {
            destination: `theme-${theme}.css`,
            format,
            // Emit only the semantic layer; primitives stay in primitives.css.
            // For non-light themes the theme file overrides every semantic
            // token, so filtering on the theme dir alone would also work —
            // matching 'semantic'/'themes' keeps it robust either way.
            filter: (token) =>
              themeFilter('semantic.tokens.json')(token) || themeFilter(`themes/`)(token),
            options: {
              outputReferences: true,
              selector: theme === 'light' ? ":root, [data-theme='light']" : undefined,
            },
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Tailwind v4 theme bridge (dist/css/tailwind.css)
// ---------------------------------------------------------------------------

/**
 * Semantic --cui-* variables -> Tailwind v4 theme tokens, shadcn-style paired
 * naming. Keys are Tailwind theme variables (without the leading `--`),
 * values are --cui-* variable names (without the `--cui-` prefix).
 *
 * DRIFT GUARD: the build fails if theme-light.css declares a semantic
 * variable with no entry here, or if an entry references a semantic variable
 * that no longer exists. Keep this table in lockstep with
 * src/tokens/semantic.tokens.json.
 */
const SEMANTIC_BRIDGE: Readonly<Record<string, string>> = {
  // Base surface / text pair
  'color-background': 'bg-default',
  'color-foreground': 'text-default',
  // Muted surface / text pair
  'color-muted': 'bg-subtle',
  'color-muted-foreground': 'text-muted',
  // Emphasis surface pair (hero bands, selected list rows)
  'color-emphasis': 'bg-emphasis',
  'color-emphasis-foreground': 'text-on-emphasis',
  // Action tokens: filled controls with hover/active state fills.
  // Text stays >= 4.5:1 against every state fill (validated).
  'color-primary': 'action-primary-bg',
  'color-primary-foreground': 'action-primary-text',
  'color-primary-hover': 'action-primary-hover',
  'color-primary-active': 'action-primary-active',
  'color-secondary': 'action-secondary-bg',
  'color-secondary-foreground': 'action-secondary-text',
  'color-secondary-hover': 'action-secondary-hover',
  'color-secondary-active': 'action-secondary-active',
  'color-danger': 'action-danger-bg',
  'color-danger-foreground': 'action-danger-text',
  'color-danger-hover': 'action-danger-hover',
  'color-danger-active': 'action-danger-active',
  // Borders + focus ring
  'color-border': 'border-default',
  'color-border-strong': 'border-strong',
  'color-ring': 'focus-ring',
  // Links
  'color-link': 'link-default',
  'color-link-visited': 'link-visited',
  'color-link-hover': 'link-hover',
  // State trios: {state} / {state}-foreground / {state}-border
  'color-info': 'state-info-bg',
  'color-info-foreground': 'state-info-text',
  'color-info-border': 'state-info-border',
  'color-success': 'state-success-bg',
  'color-success-foreground': 'state-success-text',
  'color-success-border': 'state-success-border',
  'color-warning': 'state-warning-bg',
  'color-warning-foreground': 'state-warning-text',
  'color-warning-border': 'state-warning-border',
  'color-error': 'state-error-bg',
  'color-error-foreground': 'state-error-text',
  'color-error-border': 'state-error-border',
  'color-emergency': 'state-emergency-bg',
  'color-emergency-foreground': 'state-emergency-text',
  'color-emergency-border': 'state-emergency-border',
  // Disabled trio
  'color-disabled': 'disabled-bg',
  'color-disabled-foreground': 'disabled-text',
  'color-disabled-border': 'disabled-border',
};

/** One primitive family -> Tailwind theme namespace rule. */
interface NamespaceRule {
  comment: string;
  pattern: RegExp;
  target: (suffix: string) => string;
  /** Emit a paired `--text-*--line-height` after each entry (type scale only). */
  pairLineHeight?: boolean;
}

const PRIMITIVE_NAMESPACES: NamespaceRule[] = [
  {
    comment: 'Primitive palette — grade delta encodes WCAG contrast (see README)',
    pattern: /^color-(.+)$/,
    target: (s) => `color-${s}`,
  },
  {
    comment:
      "Spacing — Commons 8px scale (p-1 = 0.5rem, p-2 = 1rem), NOT Tailwind's default 4px scale",
    pattern: /^spacing-(.+)$/,
    target: (s) => `spacing-${s}`,
  },
  {
    comment: 'Font families',
    pattern: /^font-family-(.+)$/,
    target: (s) => `font-${s}`,
  },
  {
    comment:
      'Type scale (rem-only) with WCAG 1.4.12-friendly default line heights; leading-* overrides',
    pattern: /^font-size-(.+)$/,
    target: (s) => `text-${s}`,
    pairLineHeight: true,
  },
  {
    comment: 'Font weights',
    pattern: /^font-weight-(.+)$/,
    target: (s) => `font-weight-${s}`,
  },
  {
    comment: 'Line heights — Commons ratios (leading-4 = 1.5), not spacing multiples',
    pattern: /^font-line-height-(.+)$/,
    target: (s) => `leading-${s}`,
  },
  {
    comment: 'Reading measure (max-w-measure-*)',
    pattern: /^font-measure-(.+)$/,
    target: (s) => `container-measure-${s}`,
  },
  {
    comment: 'Border radius',
    pattern: /^radius-(.+)$/,
    target: (s) => `radius-${s}`,
  },
  {
    comment: 'Shadows',
    pattern: /^shadow-(.+)$/,
    target: (s) => `shadow-${s}`,
  },
  {
    comment: 'Motion easing',
    pattern: /^motion-easing-(.+)$/,
    target: (s) => `ease-${s}`,
  },
];

/**
 * Primitives deliberately not bridged (documented skips — the drift guard
 * fails on any primitive that is neither mapped nor listed here):
 * - zindex:           Tailwind v4 has no z-index theme namespace; use var(--cui-zindex-*)
 * - motion-duration:  no duration theme namespace; use var(--cui-motion-duration-*)
 * - breakpoint:       px values would mix units with Tailwind's rem screens and
 *                     break variant sorting; media queries own these
 * - focus:            ring geometry is consumed directly by the core focus styles
 */
const PRIMITIVE_SKIP: RegExp[] = [/^zindex-/, /^motion-duration-/, /^breakpoint-/, /^focus-/];

/** Default line height per type-scale step (body text >= 1.5 per WCAG 1.4.12 guidance). */
const TEXT_LEADING: Readonly<Record<string, string>> = {
  '3xs': 'font-line-height-4',
  '2xs': 'font-line-height-4',
  xs: 'font-line-height-4',
  sm: 'font-line-height-4',
  md: 'font-line-height-4',
  lg: 'font-line-height-3',
  xl: 'font-line-height-2',
  '2xl': 'font-line-height-2',
  '3xl': 'font-line-height-2',
};

/** Parse `--cui-*` declarations from a built CSS file (name without prefix -> value). */
function parseBuiltCuiVars(file: string): Map<string, string> {
  const css = readFileSync(join(DIST, 'css', file), 'utf8');
  const vars = new Map<string, string>();
  for (const m of css.matchAll(/--cui-([\w-]+):\s*([^;]+);/g)) {
    if (!vars.has(m[1])) vars.set(m[1], m[2].trim());
  }
  return vars;
}

function buildTailwindBridge(): void {
  const primitives = parseBuiltCuiVars('primitives.css');
  const semantic = parseBuiltCuiVars('theme-light.css');
  const problems: string[] = [];

  // Drift guard 1: the semantic layer and the bridge must cover each other.
  const bridged = new Set(Object.values(SEMANTIC_BRIDGE));
  const missing = [...semantic.keys()].filter((name) => !bridged.has(name));
  if (missing.length > 0) {
    problems.push(
      `Semantic variables missing from SEMANTIC_BRIDGE (map them in build.ts): ` +
        missing.map((n) => `--cui-${n}`).join(', ')
    );
  }
  const stale = Object.values(SEMANTIC_BRIDGE).filter((name) => !semantic.has(name));
  if (stale.length > 0) {
    problems.push(
      `SEMANTIC_BRIDGE references variables absent from theme-light.css: ` +
        stale.map((n) => `--cui-${n}`).join(', ')
    );
  }

  const semanticLines = Object.entries(SEMANTIC_BRIDGE).map(
    ([tw, cui]) => `  --${tw}: var(--cui-${cui});`
  );

  // Drift guard 2: every primitive is either bridged or a documented skip,
  // and every namespace rule still matches something.
  const primitiveLines: string[] = [];
  const claimed = new Set<string>();
  for (const rule of PRIMITIVE_NAMESPACES) {
    const members = [...primitives.keys()].filter((n) => rule.pattern.test(n));
    if (members.length === 0) {
      problems.push(`No primitives matched ${rule.pattern} — stale namespace rule.`);
      continue;
    }
    primitiveLines.push('', `  /* ${rule.comment} */`);
    for (const name of members) {
      claimed.add(name);
      const suffix = (name.match(rule.pattern) as RegExpMatchArray)[1];
      primitiveLines.push(`  --${rule.target(suffix)}: var(--cui-${name});`);
      if (rule.pairLineHeight) {
        const leading = TEXT_LEADING[suffix];
        if (leading === undefined) {
          problems.push(`Type-scale step '${suffix}' has no TEXT_LEADING entry.`);
        } else if (!primitives.has(leading)) {
          problems.push(`TEXT_LEADING['${suffix}'] -> --cui-${leading} does not exist.`);
        } else {
          primitiveLines.push(`  --${rule.target(suffix)}--line-height: var(--cui-${leading});`);
        }
      }
    }
  }
  const orphaned = [...primitives.keys()].filter(
    (n) => !claimed.has(n) && !PRIMITIVE_SKIP.some((p) => p.test(n))
  );
  if (orphaned.length > 0) {
    problems.push(
      `Primitives with no Tailwind namespace and no documented skip: ` +
        orphaned.map((n) => `--cui-${n}`).join(', ')
    );
  }

  if (problems.length > 0) {
    console.error('Tailwind bridge drift guard failed:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  const css = [
    '/* SPDX-License-Identifier: MIT */',
    '/**',
    ' * Do not edit directly, this file was auto-generated.',
    ' *',
    ' * Tailwind v4 theme bridge for @21stgov/commons-tokens. Every value is a',
    ' * var(--cui-*) reference emitted inline into utilities (@theme inline), so',
    " * runtime theme switching ([data-theme='dark' | 'high-contrast'] plus the",
    ' * prefers-color-scheme / prefers-contrast fallbacks) keeps working.',
    ' *',
    ' * Usage (import order matters):',
    " *   @import 'tailwindcss';",
    " *   @import '@21stgov/commons-tokens/index.css';",
    " *   @import '@21stgov/commons-tokens/tailwind.css';",
    ' */',
    '',
    '/*',
    " * Tailwind's default color palette is removed on purpose. Commons colors",
    ' * carry a WCAG contrast contract (grade arithmetic predicts contrast) and',
    " * the stock palette would silently void it — e.g. Tailwind's gray-50 is",
    ' * near-white while Commons gray-50 is a mid gray.',
    ' */',
    '@theme {',
    '  --color-*: initial;',
    '}',
    '',
    '@theme inline {',
    '  /*',
    '   * Semantic theme tokens (shadcn-style pairs). Prefer these: they follow',
    '   * the active theme. State trios map {state} / {state}-foreground /',
    '   * {state}-border to --cui-state-*-bg / -text / -border.',
    '   */',
    ...semanticLines,
    ...primitiveLines,
    '}',
    '',
  ].join('\n');

  writeFileSync(join(DIST, 'css', 'tailwind.css'), css);
}

async function main(): Promise<void> {
  mkdirSync(join(DIST, 'css'), { recursive: true });
  mkdirSync(join(DIST, 'json'), { recursive: true });

  // 1. Primitives -> CSS variables + flat resolved JSON (JSON also carries
  //    the semantic layer, fully resolved to concrete values).
  const primitives = new StyleDictionary({
    log: { verbosity: 'silent' },
    source: [...PRIMITIVE_SOURCES, join(SRC, 'semantic.tokens.json')],
    platforms: {
      css: {
        transforms: CSS_TRANSFORMS,
        prefix: PREFIX,
        buildPath: `${DIST}/css/`,
        files: [
          {
            destination: 'primitives.css',
            format: 'css/variables',
            filter: (token) => !themeFilter('semantic.tokens.json')(token),
            options: { selector: ':root' },
          },
        ],
      },
      json: {
        transforms: CSS_TRANSFORMS,
        prefix: PREFIX,
        buildPath: `${DIST}/json/`,
        files: [{ destination: 'tokens.json', format: 'json/flat' }],
      },
    },
  });
  await primitives.buildAllPlatforms();

  // 2. Semantic layer per theme.
  for (const theme of ['light', 'dark', 'high-contrast'] as const) {
    const sd = new StyleDictionary(themeConfig(theme));
    await sd.buildAllPlatforms();
  }

  // 3. Tailwind v4 theme bridge (with drift guard against theme-light.css).
  buildTailwindBridge();

  // 4. Entry stylesheet. tailwind.css is deliberately NOT imported here:
  //    index.css must stay valid plain CSS for non-Tailwind consumers, while
  //    @theme is a Tailwind build-time at-rule.
  writeFileSync(
    join(DIST, 'index.css'),
    [
      '/* SPDX-License-Identifier: MIT */',
      '/* @21stgov/commons-tokens — generated entry point. Do not edit. */',
      "@import './css/primitives.css';",
      "@import './css/theme-light.css';",
      "@import './css/theme-dark.css';",
      "@import './css/theme-high-contrast.css';",
      '',
    ].join('\n')
  );

  console.log('Built dist/css/{primitives,theme-light,theme-dark,theme-high-contrast}.css');
  console.log('Built dist/css/tailwind.css (Tailwind v4 bridge, drift guard passed)');
  console.log('Built dist/json/tokens.json and dist/index.css');
}

await main();
