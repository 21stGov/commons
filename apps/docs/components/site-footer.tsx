// SPDX-License-Identifier: MIT

import type { JSX } from 'react'

const socialLinks = [
  {
    platform: 'Bluesky',
    handle: '@21stgov.com',
    href: 'https://bsky.app/profile/21stgov.com',
    icon: 'bluesky',
  },
  {
    platform: 'X',
    handle: '@21stgov',
    href: 'https://x.com/21stgov',
    icon: 'x-twitter',
  },
  {
    platform: 'npm',
    handle: '@21stgov',
    href: 'https://www.npmjs.com/org/21stgov',
    icon: 'npm',
  },
] as const

export function SiteFooter(): JSX.Element {
  return (
    <footer className="docs-site-footer">
      <div className="docs-site-footer-inner">
        <div className="docs-site-footer-primary">
          <div className="docs-site-footer-brand">
            <div className="docs-site-footer-title">
              <div>
                <strong>Commons</strong>
                <p>The public design system local government deserves.</p>
              </div>
            </div>

            <p className="docs-site-footer-parent">
              A{' '}
              <a href="https://21stgov.com" target="_blank" rel="noopener noreferrer">
                <span className="docs-site-footer-logo" aria-hidden="true" />
                <span>21st Gov</span>
              </a>{' '}
              project, built in public.
            </p>
          </div>

          <nav className="docs-site-footer-social" aria-label="21st Gov social media">
            <p>Build with us</p>
            <ul>
              {socialLinks.map((link) => (
                <li key={link.platform}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <span
                      className={`docs-site-footer-social-icon docs-site-footer-social-icon--${link.icon}`}
                      aria-hidden="true"
                    />
                    <span>
                      <strong>{link.platform}</strong>
                      <small>{link.handle}</small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="docs-site-footer-legal">
          <div>
            <p>
              Code licensed{' '}
              <a
                href="https://github.com/21stgov/commons/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT
              </a>
              .
            </p>
            <p>
              The{' '}
              <a
                href="https://www.brailleinstitute.org/freefont/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Atkinson Hyperlegible
              </a>{' '}
              font files contained in <code>packages/fonts</code> are licensed separately under the
              SIL Open Font License, Version 1.1.
            </p>
            <p className="docs-site-footer-country">
              <img src="/us_flag.svg" width="32" height="22" alt="" />
              <span>Designed and developed in the United States.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
