// SPDX-License-Identifier: MIT

/**
 * Renderers that turn a {@link ComponentDoc} into the generated MDX page and
 * its machine-readable Markdown mirror. Both views are built from the same
 * data so they cannot drift apart.
 */

import {
  cdnBase,
  type ComponentDoc,
  githubUrl,
  installCommand,
  type PackageManager,
  packageManagers,
  runnerCommand,
  siteUrl,
} from './data.ts'

/** A fumadocs package-manager `<Tabs>` block whose body is one `sh` command per manager. */
function packageManagerTabs(commandFor: (pm: PackageManager) => string): string {
  return [
    `<Tabs groupId="package-manager" persist items={${JSON.stringify(packageManagers)}}>`,
    ...packageManagers.flatMap((pm) => [
      '',
      `<Tab value="${pm}">`,
      '',
      '```sh',
      commandFor(pm),
      '```',
      '',
      '</Tab>',
    ]),
    '',
    '</Tabs>',
  ].join('\n')
}

/** Escape text so MDX does not parse it as JSX or an expression. */
function escapeMdx(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/</g, '\\<').replace(/\{/g, '\\{')
}

/** Escape a Markdown table cell (also MDX-safe). */
function cell(text: string): string {
  return escapeMdx(text).replace(/\|/g, '\\|')
}

function yesNo(value: boolean | undefined): string {
  if (value === undefined) return 'Unknown'
  return value ? 'Yes' : 'No'
}

function bulletList(items: string[], escape: boolean): string {
  return items.map((item) => `- ${escape ? escapeMdx(item) : item}`).join('\n')
}

/**
 * The normative accessibility contract as a Markdown table. Shared verbatim
 * between the HTML page and the `.md` mirror.
 */
function accessibilityTable(component: ComponentDoc): string {
  const a11y = component.accessibility
  const compat = component.compatibility
  const screenReaders =
    a11y.screenReadersTested.length > 0
      ? a11y.screenReadersTested.join(', ')
      : 'Not yet manually tested'

  const keyboardVerified = a11y.keyboardVerified
    ? 'Yes — verified by automated tests'
    : 'Not yet verified'

  const rows: [string, string][] = [
    ['Standard', a11y.standard],
    ['Accessible name required', yesNo(a11y.nameRequired)],
    ['Minimum target size', a11y.targetSize],
    ['Keyboard interactions verified', keyboardVerified],
    ['High contrast tested', yesNo(a11y.highContrastTested)],
    ['Screen readers tested', screenReaders],
    ['RTL support', yesNo(compat.rtl)],
    ['Forced colors support', yesNo(compat.forcedColors)],
    ['React compatibility', compat.react ?? 'Unknown'],
  ]

  return [
    '| Requirement | Value |',
    '| ----------- | ----- |',
    ...rows.map(([k, v]) => `| ${cell(k)} | ${cell(v)} |`),
  ].join('\n')
}

function keyboardSection(component: ComponentDoc): string {
  const { keyboard } = component.accessibility
  if (keyboard.length === 0) return 'No keyboard interactions are defined for this component.'
  return bulletList(keyboard, true)
}

function dependenciesSection(component: ComponentDoc): string {
  const lines: string[] = []
  for (const dep of component.dependencies) {
    lines.push(`- npm: [\`${dep}\`](https://www.npmjs.com/package/${dep})`)
  }
  for (const dep of component.registryDependencies) {
    lines.push(`- registry: [\`${dep}\`](${siteUrl}/r/${dep}.json) (installed automatically)`)
  }
  if (lines.length === 0) return 'None — the component is self-contained.'
  return lines.join('\n')
}

function usageSection(component: ComponentDoc): string {
  const parts: string[] = []
  if (component.useWhen.length > 0) {
    parts.push('**Use it for:**', '', bulletList(component.useWhen, true))
  }
  if (component.avoidWhen.length > 0) {
    parts.push('', '**Avoid it for:**', '', bulletList(component.avoidWhen, true))
  }
  return parts.join('\n')
}

function compositionSection(component: ComponentDoc): string {
  if (!component.composition || component.composition.length === 0) return ''
  return [
    '## Composition',
    '',
    'Compound components stay explicit so document structure and accessible relationships remain visible in your code.',
    '',
    '| Export | Role |',
    '| ------ | ---- |',
    ...component.composition.map((item) => `| \`${cell(item.name)}\` | ${cell(item.role)} |`),
    '',
  ].join('\n')
}

function apiReferenceSection(component: ComponentDoc): string {
  const rows = [
    ...component.publicApi.components.map((name) => [name, 'Component'] as const),
    ...component.publicApi.types.map((name) => [name, 'Type'] as const),
    ...component.publicApi.utilities.map((name) => [name, 'Utility'] as const),
  ]
  return [
    '| Export | Kind |',
    '| ------ | ---- |',
    ...rows.map(([name, kind]) => `| \`${cell(name)}\` | ${kind} |`),
  ].join('\n')
}

function sourceFence(source: string): string {
  // The component source may itself contain triple backticks in comments;
  // a four-backtick fence keeps the block intact either way.
  return `\`\`\`\`tsx\n${source.trimEnd()}\n\`\`\`\``
}

const generatedNote = (name: string): string =>
  `Generated from \`packages/react/src/components/${name}/registry.frag.json\` ` +
  `and the component source it lists. Do not edit this file; edit the fragment and rebuild.`

/** Fence a block of vanilla `.cui-*` markup, tagged as HTML for Shiki. */
function htmlFence(html: string): string {
  return `\`\`\`\`html\n${html.trimEnd()}\n\`\`\`\``
}

/** The MDX page rendered at /docs/components/<name>. */
export function buildComponentMdx(component: ComponentDoc, htmlSnippet?: string): string {
  const addCommand = `add ${component.name}`

  // Installation, per framework. React installs the source with the CLI; the
  // vanilla path pulls the shared CSS + runtime packages once for the whole
  // system (not per component) and uses the markup shown under Examples.
  const reactInstall = [
    'The CLI copies the component source into your project — you own the code.',
    '',
    packageManagerTabs((pm) => runnerCommand(pm, addCommand)),
  ].join('\n')

  const htmlInstall = [
    'Commons also works in any stack — no React and no build step. The fastest',
    'start is the first-party CDN: one stylesheet (design tokens, themes, and the',
    '`.cui-*` component classes) and the runtime, which auto-enhances any `.cui-*`',
    'markup it finds (dialogs, menus, and the rest).',
    '',
    '```html',
    `<link rel="stylesheet" href="${cdnBase}/commons.css" />`,
    `<link rel="stylesheet" href="${cdnBase}/fonts.css" /> <!-- optional: Atkinson Hyperlegible fonts -->`,
    `<script src="${cdnBase}/commons.js" defer></script>`,
    '```',
    '',
    'Prefer to self-host or pin via npm? Install the packages instead:',
    '',
    packageManagerTabs((pm) => installCommand(pm, '@21stgov/commons-css @21stgov/commons-js')),
    '',
    "Then copy the component's HTML from the Examples below.",
  ].join('\n')

  const installation = [
    '## Installation',
    '',
    '<Framework only="react">',
    '',
    reactInstall,
    '',
    '</Framework>',
    '',
    '<Framework only="html">',
    '',
    htmlInstall,
    '',
    '</Framework>',
  ].join('\n')

  const sourceBlocks = component.files
    .map((file) =>
      [
        '<details className="docs-source-details">',
        `<summary>View source: <code>${file.path}</code></summary>`,
        '',
        sourceFence(file.source),
        '',
        '</details>',
      ].join('\n')
    )
    .join('\n\n')
  const demoSource = component.usage
    ? `${component.usage.import}\n\n${component.usage.example}`
    : undefined

  // The demo carries both frameworks' code as tagged children; ComponentDemo
  // shows whichever matches the page-wide preference.
  const codeChildren: string[] = []
  if (demoSource) {
    codeChildren.push(
      '<div data-framework-code="react">',
      '',
      sourceFence(demoSource),
      '',
      '</div>'
    )
  }
  if (htmlSnippet) {
    codeChildren.push('<div data-framework-code="html">', '', htmlFence(htmlSnippet), '', '</div>')
  }
  const demo =
    codeChildren.length > 0
      ? [`<ComponentDemo name="${component.name}">`, '', ...codeChildren, '', '</ComponentDemo>'].join(
          '\n'
        )
      : `<ComponentDemo name="${component.name}" />`

  // Usage, per framework. React shows the import + example; the vanilla path
  // points at the copyable markup under Examples (assembled by the generator,
  // not hand-authored, so it stays 1:1 with the React output).
  const usage = component.usage
    ? [
        '## Usage',
        '',
        '<Framework only="react">',
        '',
        sourceFence(component.usage.import),
        '',
        sourceFence(component.usage.example),
        '',
        '</Framework>',
        '',
        '<Framework only="html">',
        '',
        htmlSnippet
          ? 'Copy the `.cui-*` markup from the **Examples** section below (switch its **Code** tab). The runtime enhances it automatically once `commons-js` is loaded — no per-component wiring.'
          : 'A framework-agnostic build of this component is not available yet; use the React version above.',
        '',
        '</Framework>',
        '',
      ].join('\n')
    : ''
  const composition = compositionSection(component)

  return `---
title: ${JSON.stringify(component.title)}
description: ${JSON.stringify(component.description)}
---

{/* GENERATED FILE — ${generatedNote(component.name)} */}

<ComponentStatus status="${component.status}" />

## When to use it

${usageSection(component)}

${installation}

${usage}

${composition}

## Examples

${demo}

## API reference

The public exports below are generated from this component's package entry point. Detailed prop documentation stays next to the TypeScript source under [Source](#source).

${apiReferenceSection(component)}

## Accessibility contract

This contract is normative and generated from the component's registry
metadata — the same data served at [\`/r/${component.name}.json\`](${siteUrl}/r/${component.name}.json).
An empty screen-reader row means manual assistive-technology testing has not
happened yet; Commons does not claim conformance it has not verified.

${accessibilityTable(component)}

### Keyboard interactions

${keyboardSection(component)}

## Source

These are the files the CLI installs, byte for byte.

${sourceBlocks}

## Dependencies

${dependenciesSection(component)}
`
}

/** The Markdown mirror served at /docs/components/<name>.md. */
export function buildComponentMd(component: ComponentDoc): string {
  const addCommand = `add ${component.name}`

  const install = packageManagers
    .map((pm) => `- ${pm}: \`${runnerCommand(pm, addCommand)}\``)
    .join('\n')

  const sourceBlocks = component.files
    .map((file) => `### \`${file.path}\`\n\n${sourceFence(file.source)}`)
    .join('\n\n')
  const usage = component.usage
    ? `## Usage\n\n${sourceFence(component.usage.import)}\n\n${sourceFence(component.usage.example)}\n\n`
    : ''
  const composition = compositionSection(component)

  return `# ${component.title}

> ${component.description}

- Status: ${component.status}
- Registry item: ${siteUrl}/r/${component.name}.json
- Documentation (HTML): ${siteUrl}/docs/components/${component.name}/
- Source repository: ${githubUrl}

## When to use it

${usageSection(component)}

## Installation

${install}

${usage}${composition}## Examples

See the HTML documentation for the interactive preview and its copyable source.

## API reference

${apiReferenceSection(component)}

## Accessibility contract

This contract is normative and generated from the component's registry
metadata. "Not yet manually tested" means exactly that — Commons does not
claim conformance it has not verified.

${accessibilityTable(component)}

### Keyboard interactions

${keyboardSection(component)}

## Source

${sourceBlocks}

## Dependencies

${dependenciesSection(component)}
`
}

/** Overview page for /docs/components. */
export function buildComponentsIndexMdx(components: ComponentDoc[]): string {
  const rows = components
    .map(
      (c) =>
        `| [${cell(c.title)}](/docs/components/${c.name}) | ${c.status} | ${cell(c.description)} |`
    )
    .join('\n')

  return `---
title: "Components"
description: "Every Commons component, its status, and its accessibility contract."
---

{/* GENERATED FILE — built from the registry fragments in packages/react/src/components. Do not edit. */}

Each component page documents when to use it, how to install it, its normative
accessibility contract, and the exact source the CLI copies into your project.
The same data is served as JSON from the [registry](${siteUrl}/r/index.json).

| Component | Status | Description |
| --------- | ------ | ----------- |
${rows}
`
}
