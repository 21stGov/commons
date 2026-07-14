// SPDX-License-Identifier: MIT

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const appDir = dirname(fileURLToPath(import.meta.url))

const config: NextConfig = {
  // Fully static export — see docs/platform-support.md ("Static
  // documentation"). The site must be servable from Nginx/IIS/object storage.
  output: 'export',
  // Directory-style URLs so every page exports as <path>/index.html and its
  // machine-readable mirror can live next to it at <path>.md.
  trailingSlash: true,
  reactStrictMode: true,
  // Pull the workspace component package into Next's own compile + watch
  // graph. Without this, Next treats `@21stgov/commons-react` as an opaque,
  // pre-built node_modules dependency: it neither recompiles nor watches its
  // `dist`, so component edits never reach the running dev server (you had to
  // clear `.next` and restart to see them). Paired with the react package's
  // `tsup --watch` (spawned by scripts/dev.ts), an edit now flows
  // source → dist → HMR with no restart. In `next build` this just recompiles
  // the same dist the CLI ships, so the static export is unchanged.
  transpilePackages: ['@21stgov/commons-react'],
  // Monorepo root, so Turbopack does not infer a root from stray lockfiles.
  turbopack: {
    root: resolve(appDir, '..', '..'),
  },
}

const withMDX = createMDX()

export default withMDX(config)
