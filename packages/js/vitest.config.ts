// SPDX-License-Identifier: MIT

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // The runtime manipulates real DOM (attributes, focus, events), so the
    // behaviors are exercised against jsdom rather than mocked.
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts'],
  },
})
