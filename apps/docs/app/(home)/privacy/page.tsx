// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'How Commons handles data: a static site with no accounts, no cookies from us, and privacy-first, cookieless analytics.',
  path: '/privacy',
})

export default function PrivacyPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Privacy Policy"
      lede="Commons is a static site. We do not use accounts, set cookies, or sell data — and the little we measure is anonymous and cookieless."
      updated="July 15, 2026"
    >
      <p>
        Commons is an open-source, accessibility-first design system for U.S. local governments,
        published and maintained by <strong>21st Gov</strong> (&ldquo;we,&rdquo; &ldquo;us&rdquo;).
        This notice explains what happens to data when you visit{' '}
        <strong>commonsui.com</strong> or use the endpoints we host.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>
          The site is fully <strong>static</strong> — there are no accounts, logins, or forms you
          submit to us.
        </li>
        <li>
          <strong>We set no cookies.</strong> Our analytics are privacy-first and cookieless, and
          they honor Do Not Track.
        </li>
        <li>
          We <strong>do not sell data</strong>, run advertising trackers, or build profiles of
          visitors.
        </li>
        <li>
          Our hosting provider processes standard request data transiently to deliver content and
          keep the site secure — as any web host must.
        </li>
      </ul>

      <h2>What we collect and why</h2>

      <h3>Aggregate analytics</h3>
      <p>
        When enabled, we use <strong>Fathom Analytics</strong>, a privacy-first, cookieless service
        that does not track you across sites or collect personal data. Fathom reports anonymous,
        aggregate usage — page views, referrers, general location by country or region, and device
        or browser type — without identifying individuals or storing personal data. Analytics are
        opt-in at build time and only run when a public Site ID is configured; the script loads from{' '}
        <code>cdn.usefathom.com</code>.
      </p>

      <h3>Request logs</h3>
      <p>
        <strong>Cloudflare</strong> operates our edge, CDN, and hosting (Workers Static Assets).
        Like any web host, Cloudflare transiently processes standard request data — such as IP
        address, timestamp, requested URL, and user agent — to deliver content and for security and
        abuse-prevention. We do not use this data to identify or profile individuals.
      </p>

      <h3>Hosted endpoints</h3>
      <p>
        Beyond the website, we host a few endpoints that receive requests: the component registry (
        <code>commonsui.com/r/*.json</code>), JSON schemas (<code>commonsui.com/schema/*</code>),
        our first-party CDN at <code>cdn.commonsui.com</code> (served from Cloudflare R2), and an{' '}
        <strong>MCP server</strong> (a Model Context Protocol endpoint running on Cloudflare
        Workers). These require no accounts and collect no personal data from you. Each processes the
        request it receives to return a result, and Cloudflare logs standard request metadata for
        delivery and security. Requests may include whatever the caller chooses to send.
      </p>

      <h2>What we do not collect</h2>
      <ul>
        <li>No accounts, logins, or passwords — there is nothing to sign up for.</li>
        <li>No cookies set by us, and no cross-site tracking.</li>
        <li>No advertising trackers.</li>
        <li>No user profiles or behavioral records tied to you.</li>
        <li>No sale of data to anyone, ever.</li>
      </ul>

      <h2>Cookies &amp; Do Not Track</h2>
      <p>
        We set no cookies. Fathom is cookieless by design and honors the browser Do Not Track signal
        — our configuration sets <code>data-honor-dnt=&quot;true&quot;</code>, so visitors who enable
        Do Not Track are not counted.
      </p>

      <h2>Third-party services</h2>
      <p>
        We rely on a small number of providers. Each has its own privacy practices, which govern the
        data it processes:
      </p>
      <ul>
        <li>
          <strong>Cloudflare</strong> — hosting, CDN, Workers, and R2 storage. See the{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Cloudflare privacy policy
          </a>
          .
        </li>
        <li>
          <strong>Fathom Analytics</strong> — cookieless, privacy-first analytics. See the{' '}
          <a href="https://usefathom.com/privacy" rel="noopener noreferrer" target="_blank">
            Fathom privacy policy
          </a>
          .
        </li>
        <li>
          <strong>npm</strong> (<code>npmjs.com</code>) — the package registry that distributes our
          packages, governed separately by npm&rsquo;s own policy.
        </li>
        <li>
          <strong>GitHub</strong> — source hosting for the project, governed separately by
          GitHub&rsquo;s own policy.
        </li>
      </ul>

      <h2>Data retention</h2>
      <p>
        We do not maintain personal records about visitors. Request logs and aggregate analytics are
        kept only as long as needed to deliver the site, keep it secure, and understand usage in
        aggregate, after which they age out under our providers&rsquo; standard practices. Because
        analytics are anonymous and we hold no accounts, there is no personal profile to retain.
      </p>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        The site is not directed at children, and we do not knowingly collect personal information
        from anyone, including children.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Enable <strong>Do Not Track</strong> in your browser — Fathom will not count you.</li>
        <li>
          Block the analytics domain (<code>cdn.usefathom.com</code>) with your browser or an
          extension.
        </li>
        <li>Use our hosted endpoints without identifying yourself — none require an account.</li>
      </ul>

      <h2>Changes to this notice</h2>
      <p>
        We may update this notice as the project evolves. When we do, we will revise the
        &ldquo;Last updated&rdquo; date above. Because Commons is built in public, changes are also
        visible in the project&rsquo;s source history.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about privacy? Email{' '}
        <a href="mailto:security@21stgov.com">security@21stgov.com</a> or open an issue on{' '}
        <a href="https://github.com/21stgov/commons" rel="noopener noreferrer" target="_blank">
          GitHub
        </a>
        .
      </p>
    </LegalPage>
  )
}
