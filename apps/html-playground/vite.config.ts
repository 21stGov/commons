// SPDX-License-Identifier: MIT

import { defineConfig } from 'vite'

// Deliberately no Tailwind and no framework plugin: the whole point of this app
// is to prove the Commons components render from `commons.css` alone, with only
// a generated `scaffold.css` for demo layout. If Tailwind crept in here it could
// silently paper over a gap in the framework-agnostic CSS.
export default defineConfig({
  server: { port: 5198, strictPort: true },
  preview: { port: 5198, strictPort: true },
})
