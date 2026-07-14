// SPDX-License-Identifier: MIT

/**
 * Dev entry point: regenerate the derived content, start the component
 * package's build watcher, then run `next dev`.
 * Used by both `pnpm --filter docs dev` and .claude/launch.json, so the
 * generated pages are always in sync with the registry fragments and edits
 * to `@21stgov/commons-react` are reflected live (source → dist → HMR).
 * Cross-platform: argument-array spawn, no shell, absolute paths.
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { join } from 'node:path'

import { appDir } from './lib/data.ts'

await import('./generate.ts')

// Keep `@21stgov/commons-react`'s `dist` fresh from source so Next's HMR
// (via `transpilePackages`) reflects component edits without a restart. We
// run tsup's CLI on the same Node binary and wait for its first build before
// starting Next, since tsup's initial `clean` briefly empties `dist` and Next
// must not read it mid-wipe. tsup is a devDependency of the react package, so
// resolve it from there — pnpm's strict layout does not hoist it to the docs
// app.
const reactPkgDir = join(appDir, '..', '..', 'packages', 'react')
const require = createRequire(join(reactPkgDir, 'package.json'))
const tsupCli = require.resolve('tsup/dist/cli-default.js')

const watcher = spawn(process.execPath, [tsupCli, '--watch'], {
  cwd: reactPkgDir,
  stdio: ['inherit', 'pipe', 'inherit'],
})

await new Promise<void>((resolveBuild) => {
  // Resolve on tsup's first "build success", or after a grace period so a
  // format change to its log line can never hang the dev server.
  const timer = setTimeout(resolveBuild, 20_000)
  const onData = (chunk: Buffer): void => {
    process.stdout.write(chunk)
    if (/build success/i.test(chunk.toString())) {
      clearTimeout(timer)
      watcher.stdout?.off('data', onData)
      // Keep piping the watcher's later rebuild logs to our stdout.
      watcher.stdout?.pipe(process.stdout)
      resolveBuild()
    }
  }
  watcher.stdout?.on('data', onData)
})

// Tear the watcher down whenever this process ends, however it ends.
const stopWatcher = (): void => {
  if (!watcher.killed) {
    watcher.kill()
  }
}
process.on('exit', stopWatcher)
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

const nextBin = join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next')
const port = process.env.PORT ?? '5200'

// Strict port: `next dev` silently falls back to another port when the
// requested one is busy. Fail loudly instead, like Vite's --strictPort.
await new Promise<void>((resolvePort, rejectPort) => {
  const probe = createServer()
  probe.once('error', (error) => {
    rejectPort(new Error(`Port ${port} is already in use (docs dev server requires it).`, { cause: error }))
  })
  probe.once('listening', () => {
    probe.close(() => resolvePort())
  })
  probe.listen(Number(port))
})

const child = spawn(process.execPath, [nextBin, 'dev', '--port', port], {
  cwd: appDir,
  stdio: 'inherit',
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
