// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Disclaimer',
  description:
    'Using Commons does not by itself make a website legally or WCAG compliant — conformance depends on how adopters build and operate their site.',
  path: '/disclaimer',
})

export default function DisclaimerPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Disclaimer"
      lede="Commons provides accessible, well-tested building blocks, but using them does not by itself make your website legally or accessibility compliant."
      updated="July 15, 2026"
    >
      <h2>Using Commons is not automatic compliance</h2>
      <p>
        Adopting Commons does <strong>not</strong> mean a website or service is
        automatically compliant with any law or standard, including{' '}
        <strong>Section 508</strong>, the <strong>Americans with Disabilities Act (ADA)</strong>,
        the <strong>Web Content Accessibility Guidelines (WCAG)</strong>, or applicable
        state and local requirements. Accessibility and legal compliance are properties
        of the <strong>whole delivered experience</strong>{' '}— how a site is assembled,
        configured, extended, filled with content, and operated — not of any single
        library. Statements such as &ldquo;we use Commons, so we are compliant&rdquo; are
        not accurate and should not be represented that way.
      </p>

      <h2>What Commons does provide</h2>
      <p>
        Commons is an accessibility-first, open-source design system built by 21st Gov for
        U.S. local governments. Its components ship with a normative, per-component{' '}
        <strong>accessibility contract</strong> and are held to a{' '}
        <strong>WCAG 2.2 AA baseline</strong> with selected AAA enhancements. That work
        concerns the components <strong>as shipped</strong> — the building blocks
        themselves — and is not a guarantee about any downstream site built with them. You
        can review the contract at <a href="/docs/accessibility">/docs/accessibility</a>.
      </p>

      <h2>Why a site using Commons can still fall short</h2>
      <p>
        A website built on Commons can still be non-conformant for reasons outside the
        components&rsquo; control, including:
      </p>
      <ul>
        <li>Custom or modified components that diverge from what Commons ships</li>
        <li>
          Inaccessible content — images without alt text, poor heading structure,
          unlabeled forms you add, low-contrast custom colors, untagged PDFs, or media
          without captions
        </li>
        <li>Incorrect composition of otherwise accessible parts</li>
        <li>Third-party embeds and widgets</li>
        <li>Misconfiguration, or skipping the documented accessibility guidance</li>
      </ul>

      <h2>Your responsibility as an adopter</h2>
      <p>
        Legal and accessibility compliance for a specific website or service remains the{' '}
        <strong>adopter&rsquo;s responsibility</strong>. Before you rely on conformance, you
        should test <strong>your own site as delivered</strong>:
      </p>
      <ul>
        <li>Automated checks (for example, <code>axe</code>)</li>
        <li>Manual keyboard testing</li>
        <li>Manual screen-reader and assistive-technology testing</li>
        <li>
          A conformance review — such as an Accessibility Conformance Report (ACR / VPAT)
          — covering your specific site
        </li>
      </ul>
      <p>
        Above all, ensure that <strong>your content</strong>, not just the components, is
        accessible.
      </p>

      <h2>Honesty about what we have verified</h2>
      <p>
        We do not certify conformance we have not verified. Manual assistive-technology
        testing coverage is still expanding, and we describe the components&rsquo; status
        as accurately as we can rather than overstating it.
      </p>

      <h2>Experimental, pre-1.0 status</h2>
      <p>
        Commons is experimental and pre-1.0. APIs and components may change between
        releases. Treat it accordingly when planning long-lived services.
      </p>

      <h2>No warranty; not legal advice</h2>
      <p>
        Commons is provided <strong>&ldquo;as is,&rdquo;</strong> without warranty of any
        kind, consistent with its MIT license. Nothing here is legal advice. For questions
        about your obligations, consult qualified counsel or an accessibility professional.
        See the <a href="/terms">Terms of Use</a> for the full terms, and the{' '}
        <a href="/docs/accessibility">component accessibility contract</a> for what Commons
        commits to in the components themselves.
      </p>
    </LegalPage>
  )
}
