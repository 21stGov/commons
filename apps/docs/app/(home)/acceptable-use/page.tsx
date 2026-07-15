// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Acceptable Use Policy',
  description:
    'How to use the free, best-effort Commons hosted services — registry, schemas, CDN, and MCP server — so they stay reliable for everyone.',
  path: '/acceptable-use',
})

export default function AcceptableUsePage(): React.JSX.Element {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      lede="The Commons hosted services are shared, free, and best-effort. This policy keeps them available for everyone — the short version is: use them normally, and self-host for scale."
      updated="July 15, 2026"
    >
      <p>
        Commons is an open-source, accessibility-first design system for U.S. local
        governments, published and maintained by 21st Gov (&ldquo;21st Gov&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;). This Acceptable Use Policy describes what is and
        is not acceptable when using the <strong>hosted services</strong> we operate. It
        applies alongside our <a href="/terms">Terms of Use</a>.
      </p>

      <h2>Which services this covers</h2>
      <p>These services are provided free, best-effort, for building and integrating with Commons:</p>
      <ul>
        <li>
          the documentation site at{' '}
          <a href="https://commonsui.com" rel="noopener noreferrer" target="_blank">commonsui.com</a>;
        </li>
        <li>
          the component <strong>registry</strong> served as JSON at{' '}
          <code>commonsui.com/r/*.json</code>, consumed by the{' '}
          <code>@21stgov/commons</code> CLI;
        </li>
        <li>
          the <strong>JSON schemas</strong> at <code>commonsui.com/schema/*</code>;
        </li>
        <li>
          the machine-readable files, including <code>/llms.txt</code>,{' '}
          <code>/llms-full.txt</code>, and the per-page <code>.md</code> mirrors;
        </li>
        <li>
          the first-party <strong>CDN</strong> at <code>cdn.commonsui.com</code>, which
          serves versioned <code>commons.css</code> and <code>commons.js</code> from
          Cloudflare R2; and
        </li>
        <li>
          the <strong>MCP server</strong>, a Model Context Protocol endpoint running on
          Cloudflare Workers.
        </li>
      </ul>

      <h2>The spirit of this policy</h2>
      <p>
        These endpoints are a shared resource, offered free of charge so the community can
        build with Commons. Please use them in ways that keep them{' '}
        <strong>available and free for everyone</strong>. Everything Commons publishes is
        static and MIT-licensed, so if your needs are large or production-critical, the best
        thing you can do — for yourself and for everyone else — is self-host.
      </p>

      <h2>Encouraged use</h2>
      <p>All of the following are normal, welcome uses of the hosted services:</p>
      <ul>
        <li>installing components with the <code>@21stgov/commons</code> CLI;</li>
        <li>resolving the registry and JSON schemas from your tools and build pipeline;</li>
        <li>
          loading CDN assets in production — please <strong>pin an exact version</strong>{' '}
          so your site stays stable and your requests stay cacheable;
        </li>
        <li>querying the MCP endpoint from your own tools and agents;</li>
        <li>
          mirroring or self-hosting the assets — everything is static and MIT-licensed, and{' '}
          <strong>self-hosting is encouraged for high-volume or production-critical use</strong>.
        </li>
      </ul>

      <h2>Prohibited use</h2>
      <p>Do not use the hosted services to do any of the following:</p>
      <ul>
        <li>anything unlawful;</li>
        <li>
          disrupt, overload, or degrade the services — including denial-of-service (DoS or
          DDoS) attacks, abusive automated request volumes, deliberate cache-busting, or
          scraping designed to exhaust resources;
        </li>
        <li>
          probe, scan, or attempt to breach security, or access non-public data or
          infrastructure — responsible security research is welcome and should follow the{' '}
          <a
            href="https://github.com/21stgov/commons/security/advisories/new"
            rel="noopener noreferrer"
            target="_blank"
          >
            security policy
          </a>{' '}
          described below;
        </li>
        <li>circumvent rate limits, caching requirements, or other protections;</li>
        <li>distribute malware or illegal or otherwise harmful content;</li>
        <li>
          misrepresent the origin of the services or imply 21st Gov endorsement, sponsorship,
          or affiliation; or
        </li>
        <li>use the MCP endpoint or registry to attack or mislead third parties.</li>
      </ul>

      <h2>Fair use and rate limiting</h2>
      <p>
        The hosted services are shared and best-effort. High-volume or production traffic
        should <strong>self-host, or pin and cache</strong> the assets — they are static and
        MIT-licensed — rather than hammering the shared endpoints. To protect availability
        for everyone, we may apply rate limits, require caching, throttle, or block traffic
        that we judge to be abusive or that threatens the reliability of the services for
        others.
      </p>

      <h2>Security research</h2>
      <p>
        We welcome responsible security research, but please do not test against the
        production services in ways that degrade them or affect other users. Report
        vulnerabilities <strong>privately</strong>: email{' '}
        <a href="mailto:security@21stgov.com">security@21stgov.com</a>, or use GitHub&rsquo;s
        private vulnerability reporting at{' '}
        <a
          href="https://github.com/21stgov/commons/security/advisories/new"
          rel="noopener noreferrer"
          target="_blank"
        >
          the Commons security advisories page
        </a>
        . Please give us a reasonable chance to respond before disclosing publicly.
      </p>

      <h2>No guarantee of availability</h2>
      <p>
        The hosted services are provided on an &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; basis, with no warranty or guarantee of availability. We may change,
        version, rate-limit, throttle, suspend, or discontinue any endpoint at any time. If
        you need stability, pin to an exact version or self-host under the MIT license. See
        our <a href="/terms">Terms of Use</a> for the full details.
      </p>

      <h2>Enforcement</h2>
      <p>
        When use violates this policy, we may throttle, block, or otherwise restrict access —
        prioritizing the overall availability and reliability of the services for the whole
        community. We will generally aim to be proportionate, but protecting availability for
        everyone comes first.
      </p>

      <h2>Reporting misuse and questions</h2>
      <p>
        If you notice misuse, or have questions about this policy, please open an issue on{' '}
        <a href="https://github.com/21stgov/commons" rel="noopener noreferrer" target="_blank">
          GitHub
        </a>
        . For anything security-sensitive, email{' '}
        <a href="mailto:security@21stgov.com">security@21stgov.com</a> or use{' '}
        <a
          href="https://github.com/21stgov/commons/security/advisories/new"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub&rsquo;s private vulnerability reporting
        </a>{' '}
        instead.
      </p>
    </LegalPage>
  )
}
