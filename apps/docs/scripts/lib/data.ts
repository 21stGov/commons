// SPDX-License-Identifier: MIT

/**
 * Canonical-source loader for the generated docs content.
 *
 * Everything on a component page is derived from
 * `packages/react/src/components/<name>/registry.frag.json` and the component
 * source files it lists — the same fragments the registry build consumes.
 * Nothing here is hand-copied (see docs/ai-and-agents.md, Layer 1).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { componentGuides, type ComponentGuide } from './component-guides.ts'

const scriptDir = dirname(fileURLToPath(import.meta.url))

/** Absolute path to apps/docs. */
export const appDir = resolve(scriptDir, '..', '..')

/** Absolute path to the monorepo root. */
export const repoRoot = resolve(appDir, '..', '..')

/** Public origin the site is deployed to. */
export const siteUrl = 'https://commonsui.com'

export const githubUrl = 'https://github.com/21stgov/commons'

export interface RegistryFile {
  path: string
  type: string
  /** File content, read from packages/react. */
  source: string
}

export interface AccessibilityContract {
  standard: string
  keyboard: string[]
  /** Whether the keyboard interactions are proven by automated tests. */
  keyboardVerified?: boolean
  nameRequired: boolean
  targetSize: string
  highContrastTested: boolean
  screenReadersTested: string[]
}

export interface ComponentDoc {
  name: string
  title: string
  description: string
  status: string
  useWhen: string[]
  avoidWhen: string[]
  dependencies: string[]
  registryDependencies: string[]
  compatibility: { react?: string; rtl?: boolean; forcedColors?: boolean }
  accessibility: AccessibilityContract
  usage?: { import: string; example: string }
  composition?: ComponentGuide['composition']
  publicApi: { components: string[]; types: string[]; utilities: string[] }
  files: RegistryFile[]
}

interface RegistryFragment {
  name: string
  title: string
  description: string
  status: string
  useWhen?: string[]
  avoidWhen?: string[]
  dependencies?: string[]
  registryDependencies?: string[]
  compatibility?: ComponentDoc['compatibility']
  accessibility: AccessibilityContract
  usage?: ComponentDoc['usage']
  files?: { path: string; type: string }[]
}

function publicApiFromIndex(source: string): ComponentDoc['publicApi'] {
  const components: string[] = []
  const types: string[] = []
  const utilities: string[] = []

  for (const match of source.matchAll(/export\s*\{([\s\S]*?)\}\s*from/g)) {
    for (const rawExport of match[1]?.split(',') ?? []) {
      const value = rawExport.trim()
      if (!value) continue
      if (value.startsWith('type ')) {
        types.push(value.slice(5).trim())
      } else if (/^[A-Z]/.test(value)) {
        components.push(value)
      } else {
        utilities.push(value)
      }
    }
  }

  return { components, types, utilities }
}

/** Load every component fragment plus its listed source files. */
export function loadComponents(): ComponentDoc[] {
  const reactDir = join(repoRoot, 'packages', 'react')
  const componentsDir = join(reactDir, 'src', 'components')

  const names = readdirSync(componentsDir).filter((entry) => {
    const dir = join(componentsDir, entry)
    if (!statSync(dir).isDirectory()) return false
    try {
      statSync(join(dir, 'registry.frag.json'))
      return true
    } catch {
      return false
    }
  })

  return names
    .map((name) => {
      const frag = JSON.parse(
        readFileSync(join(componentsDir, name, 'registry.frag.json'), 'utf8')
      ) as RegistryFragment

      const files: RegistryFile[] = (frag.files ?? []).map((file) => ({
        path: file.path,
        type: file.type,
        source: readFileSync(join(reactDir, file.path), 'utf8'),
      }))
      const indexPath = join(componentsDir, name, 'index.ts')
      const guide = componentGuides[frag.name]

      return {
        name: frag.name,
        title: frag.title,
        description: frag.description,
        status: frag.status,
        useWhen: frag.useWhen ?? [],
        avoidWhen: frag.avoidWhen ?? [],
        dependencies: frag.dependencies ?? [],
        registryDependencies: frag.registryDependencies ?? [],
        compatibility: frag.compatibility ?? {},
        accessibility: frag.accessibility,
        usage: frag.usage ?? guide?.usage,
        composition: guide?.composition,
        publicApi: publicApiFromIndex(readFileSync(indexPath, 'utf8')),
        files,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
}

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']

/** The dlx-style runner command for each package manager. */
export function runnerCommand(pm: PackageManager, args: string): string {
  switch (pm) {
    case 'npm':
      return `npx @21stgov/commons ${args}`
    case 'pnpm':
      return `pnpm dlx @21stgov/commons ${args}`
    case 'yarn':
      return `yarn dlx @21stgov/commons ${args}`
    case 'bun':
      return `bunx @21stgov/commons ${args}`
  }
}
