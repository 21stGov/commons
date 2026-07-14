// SPDX-License-Identifier: MIT

import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/metadata'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafa',
    theme_color: '#16365c',
    icons: [
      {
        src: '/favicon.png',
        sizes: '500x500',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
