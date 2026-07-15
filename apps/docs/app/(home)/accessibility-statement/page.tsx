// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Accessibility Statement',
  description:
    'How the commonsui.com documentation site approaches accessibility, the standards we target, known limitations, and how to send us feedback.',
  path: '/accessibility-statement',
})

export default function AccessibilityStatementPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Accessibility Statement"
      lede="We build the Commons documentation site to be usable by everyone, and we hold ourselves to the same standards we ask of the design system it documents."
      updated="July 15, 2026"
    >
      <h2>Our commitment</h2>
      <p>
        Commons is an accessibility-first design system for U.S. local governments, built by{' '}
        <strong>21st Gov</strong>. This statement describes the accessibility of the{' '}
        <strong>commonsui.com documentation site itself</strong> — not the accessibility of the
        components it documents, which we cover separately in the component-library accessibility
        contract linked below. We consider accessibility a core requirement of public-interest
        software, and we treat any barrier on this site as a defect worth fixing.
      </p>

      <h2>The standard we target</h2>
      <p>
        Our baseline target is <strong>WCAG 2.2 Level AA</strong>. Because this site is built with
        the Commons design system itself, it also ships several Level AAA enhancements that the
        design system enforces:
      </p>
      <ul>
        <li>A dedicated <strong>7:1 high-contrast theme</strong>.</li>
        <li><strong>44&nbsp;px minimum touch targets</strong> for interactive controls.</li>
        <li>Enhanced, consistently <strong>visible focus indicators</strong>.</li>
        <li>
          Support for <strong>forced colors</strong>, <strong>reduced motion</strong>, and{' '}
          <strong>text resizing</strong>.
        </li>
        <li>
          Support for <strong>bidirectional and right-to-left (RTL)</strong> layouts.
        </li>
      </ul>
      <p>
        This is a statement of commitment and current status, not a certified conformance audit. We
        do not claim conformance we have not verified, and a formal third-party audit and Accessibility
        Conformance Report (ACR/VPAT) are <strong>not yet published</strong>.
      </p>

      <h2>Measures we take</h2>
      <p>We assess accessibility continually rather than treating it as a one-time milestone:</p>
      <ul>
        <li>
          The site is <strong>built with the Commons accessible design system</strong>, which
          enforces our color-contrast, focus, target-size, and motion requirements by default.
        </li>
        <li>
          We run <strong>automated accessibility testing with axe</strong> as part of our
          development workflow.
        </li>
        <li>
          We perform <strong>ongoing manual review</strong>, though manual assistive-technology
          testing coverage is still expanding.
        </li>
        <li>
          Each component publishes a <strong>per-component accessibility contract</strong> that we
          hold the library to.
        </li>
      </ul>

      <h2>How the site supports you</h2>
      <p>The documentation site is static and designed to work with the tools you already use:</p>
      <ul>
        <li>Full <strong>keyboard navigation</strong>, with a skip link and visible focus.</li>
        <li>Structure and labelling intended to work with <strong>screen readers</strong>.</li>
        <li>
          Explicit <strong>light, dark, and high-contrast themes</strong>, plus automatic
          honouring of <code>prefers-color-scheme</code> and <code>prefers-contrast</code>.
        </li>
        <li>
          Respect for <code>prefers-reduced-motion</code> to minimize non-essential animation.
        </li>
        <li>
          Support for <strong>text resizing</strong> and <strong>right-to-left (RTL)</strong>{' '}
          reading order.
        </li>
      </ul>

      <h2>Known limitations</h2>
      <p>
        In the interest of honesty, here are areas we know are still maturing. We are actively
        working on each:
      </p>
      <ul>
        <li>
          Some <strong>interactive component demos</strong> and{' '}
          <strong>third-party-embedded content</strong> (for example, code syntax highlighting) may
          have edge cases we have not yet resolved.
        </li>
        <li>
          The <strong>calendar and date components</strong> are still maturing.
        </li>
        <li>
          <strong>Manual screen-reader testing</strong> does not yet cover every page.
        </li>
      </ul>

      <h2>The component-library accessibility contract</h2>
      <p>
        The Commons design system publishes a normative, per-component accessibility contract that
        describes the guarantees, keyboard interactions, and ARIA semantics of each component. If
        you are evaluating the components themselves rather than this site, see{' '}
        <a href="/docs/accessibility">the component accessibility documentation</a>, which is also
        linked from each individual component page.
      </p>

      <h2>Giving feedback</h2>
      <p>
        If you encounter an accessibility barrier on this site, we want to hear about it. For
        sensitive reports, email{' '}
        <a href="mailto:security@21stgov.com">security@21stgov.com</a>. For accessibility bugs, open
        an issue at{' '}
        <a
          href="https://github.com/21stgov/commons"
          rel="noopener noreferrer"
          target="_blank"
        >
          github.com/21stgov/commons
        </a>
        . We review accessibility feedback and aim to respond within a reasonable timeframe.
      </p>

      <h2>Updates to this statement</h2>
      <p>
        We revise this statement as our testing coverage grows and as we resolve the limitations
        noted above. The date at the top reflects the most recent substantive update.
      </p>
    </LegalPage>
  )
}
