// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'
import Link from 'next/link'
import type { JSX } from 'react'

import { HomeActions } from '@/components/home-actions'
import { HomeDemoStrip } from '@/components/home-demo-strip'
import { InstallCommand } from '@/components/install-command'
import { StructuredData } from '@/components/structured-data'
import { absoluteUrl, buildPageMetadata, siteConfig } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: '/',
  absoluteTitle: true,
})

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://21stgov.com/#organization',
      name: '21st Gov',
      url: 'https://21stgov.com',
      logo: absoluteUrl('/logo.svg'),
      sameAs: [
        'https://bsky.app/profile/21stgov.com',
        'https://x.com/21stgov',
        'https://www.npmjs.com/org/21stgov',
        'https://github.com/21stgov',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      name: siteConfig.name,
      alternateName: 'Commons Design System',
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      publisher: { '@id': 'https://21stgov.com/#organization' },
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${siteConfig.url}/#software`,
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      image: absoluteUrl(siteConfig.socialImage),
      codeRepository: siteConfig.repository,
      license: siteConfig.license,
      programmingLanguage: ['TypeScript', 'CSS'],
      runtimePlatform: ['Web', 'Node.js'],
      isAccessibleForFree: true,
      author: { '@id': 'https://21stgov.com/#organization' },
      publisher: { '@id': 'https://21stgov.com/#organization' },
      keywords: [
        'accessible design system',
        'local government',
        'public services',
        'React components',
        'design tokens',
        'WCAG 2.2',
        'open source',
      ],
    },
  ],
}

export default function HomePage(): JSX.Element {
  return (
    <>
      <StructuredData data={homeStructuredData} />
      {/* HomeLayout owns the <main> landmark; this wrapper is the skip-link target. */}
      <div id="main" tabIndex={-1} className="docs-home outline-none">
        <section className="docs-home-hero" aria-labelledby="home-hero-heading">
          <span className="docs-home-hero-mark" aria-hidden="true" />
          <div className="docs-home-hero-inner">
            <div className="docs-home-hero-copy">
              <p className="docs-home-kicker">Open source · Accessible · Built in public</p>
              <h1 id="home-hero-heading">Build public services people can trust.</h1>
              <p className="docs-home-lede">
                Commons gives U.S. local governments a modern, rigorous foundation for digital
                services—accessible components, durable tokens, and source code your institution
                actually owns.
              </p>
              <HomeActions />
            </div>

            <aside className="docs-home-start" aria-labelledby="home-start-heading">
              <div className="docs-home-start-heading">
                <span aria-hidden="true">01</span>
                <div>
                  <p>Start with the CLI</p>
                  <h2 id="home-start-heading">Your code. Your repository.</h2>
                </div>
              </div>
              <InstallCommand />
              <p className="docs-home-start-note">
                Inspect the project, install the token foundation, then add only what you need.
              </p>
            </aside>
          </div>
        </section>

        <div className="docs-home-proof" aria-label="Commons commitments">
          <div>
            <strong>WCAG 2.2 AA</strong>
            <span>Enforced baseline</span>
          </div>
          <div>
            <strong>44px targets</strong>
            <span>Comfortable by default</span>
          </div>
          <div>
            <strong>Own the source</strong>
            <span>No proprietary runtime</span>
          </div>
          <div>
            <strong>React + CSS</strong>
            <span>Modern, not locked in</span>
          </div>
        </div>

        <div className="docs-home-content">
          <section aria-labelledby="home-live-heading" className="docs-home-showcase">
            <div className="docs-home-section-heading">
              <p className="docs-home-kicker">The real thing</p>
              <div>
                <h2 id="home-live-heading">Components you can feel confident shipping.</h2>
                <p>
                  This is live <code>@21stgov/commons-react</code>—not a screenshot. Change the
                  theme, enlarge the text, use a keyboard, or switch direction. The same contracts
                  hold.
                </p>
              </div>
            </div>
            <HomeDemoStrip />
          </section>

          <section aria-labelledby="home-principles-heading" className="docs-home-principles">
            <div className="docs-home-section-heading">
              <p className="docs-home-kicker">Why Commons</p>
              <div>
                <h2 id="home-principles-heading">Good defaults are public infrastructure.</h2>
                <p>
                  The system is designed around the people using public services and the teams
                  responsible for keeping them dependable.
                </p>
              </div>
            </div>

            <div className="docs-home-principle-grid">
              <article>
                <span aria-hidden="true">01</span>
                <h3>Accessible by default</h3>
                <p>
                  WCAG 2.2 AA is the baseline, with selected AAA defaults and a normative,
                  machine-readable accessibility contract for every component.
                </p>
                <Link href="/docs/accessibility">Read the accessibility contract</Link>
              </article>
              <article>
                <span aria-hidden="true">02</span>
                <h3>Owned by the institution</h3>
                <p>
                  The CLI copies understandable component source into your repository instead of
                  hiding essential interfaces behind a proprietary runtime.
                </p>
                <Link href="/docs/installation">See how installation works</Link>
              </article>
              <article>
                <span aria-hidden="true">03</span>
                <h3>Legible to people and machines</h3>
                <p>
                  A deterministic registry, Markdown mirrors, and versioned metadata give agents the
                  same reliable facts available to the people building the service.
                </p>
                <Link href="/llms.txt">View llms.txt</Link>
              </article>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
