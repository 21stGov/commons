// SPDX-License-Identifier: MIT

import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Use',
  description:
    'The terms that govern your use of the Commons website and hosted services operated by 21st Gov.',
  path: '/terms',
})

export default function TermsPage(): React.JSX.Element {
  return (
    <LegalPage
      title="Terms of Use"
      lede="These terms govern your use of the Commons website and hosted services. The open-source code itself is governed by its MIT license, not by these terms."
      updated="July 15, 2026"
    >
      <h2>Acceptance of these terms</h2>
      <p>
        Commons is an open-source, accessibility-first design system for U.S. local
        governments, published and maintained by 21st Gov (&ldquo;21st Gov&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;). By accessing <a href="https://commonsui.com" rel="noopener noreferrer" target="_blank">commonsui.com</a>{' '}
        or using any of the hosted services described below, you agree to these Terms of
        Use. If you do not agree, please do not use the website or the hosted services.
      </p>

      <h2>What these terms cover</h2>
      <p>
        These terms apply to the Commons <strong>website</strong> and to the{' '}
        <strong>hosted services</strong> we operate, including:
      </p>
      <ul>
        <li>
          the component <strong>registry</strong> served as JSON at{' '}
          <code>commonsui.com/r/*.json</code>;
        </li>
        <li>
          the <strong>JSON schemas</strong> at <code>commonsui.com/schema/*</code>;
        </li>
        <li>
          the <strong>MCP server</strong>, a Model Context Protocol endpoint;
        </li>
        <li>
          the first-party <strong>CDN</strong> at <code>cdn.commonsui.com</code>, which
          serves versioned <code>commons.css</code> and <code>commons.js</code>; and
        </li>
        <li>
          machine-readable files such as <code>/llms.txt</code>.
        </li>
      </ul>
      <p>
        These terms do <strong>not</strong> govern your use of the open-source Commons code
        when you download, self-host, or redistribute it. That use is governed by the MIT
        license described in the next section.
      </p>

      <h2>The open-source code and its license</h2>
      <p>
        The Commons source code is released under the{' '}
        <a
          href="https://github.com/21stgov/commons/blob/main/LICENSE"
          rel="noopener noreferrer"
          target="_blank"
        >
          MIT license
        </a>
        . You are free to use, copy, modify, and distribute the code under that license&rsquo;s
        terms, independent of these Terms of Use. The published npm packages are distributed
        on <a href="https://www.npmjs.com" rel="noopener noreferrer" target="_blank">npmjs.com</a>{' '}
        and are also subject to npm&rsquo;s own terms.
      </p>

      <h2>Hosted services are provided as-is and may change</h2>
      <p>
        Commons is pre-1.0, experimental software. The registry, schemas, MCP server, CDN,
        and machine-readable files are provided as a convenience on an &ldquo;as is&rdquo;
        basis. We may change, version, rate-limit, throttle, suspend, or discontinue any
        hosted service or endpoint at any time, with or without notice. Response formats,
        URLs, and API shapes may change between releases. Do not rely on any hosted endpoint
        for uses that require guaranteed availability or stability; where you need
        stability, pin to a specific version or self-host the code under the MIT license.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Your use of the website and hosted services must comply with our{' '}
        <a href="/acceptable-use">Acceptable Use Policy</a>, which describes prohibited
        conduct such as abuse, excessive automated requests, and attempts to disrupt the
        services. We may limit or block access that violates that policy or that threatens
        the reliability of the services for others.
      </p>

      <h2>No warranty</h2>
      <p>
        To the fullest extent permitted by applicable law, the website and hosted services
        are provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties
        of any kind, whether express or implied, including any implied warranties of
        merchantability, fitness for a particular purpose, non-infringement, availability,
        or accuracy. We do not warrant that the services will be uninterrupted,
        error-free, or secure.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by applicable law, 21st Gov will not be liable for
        any indirect, incidental, special, consequential, or exemplary damages, or for any
        loss of data, availability, or profits, arising out of or relating to your use of
        the website or hosted services, even if we have been advised of the possibility of
        such damages. Nothing in these terms limits liability that cannot be limited under
        applicable law.
      </p>

      <h2>Accessibility and compliance disclaimer</h2>
      <p>
        Commons is built to support accessible, standards-aligned interfaces, but using
        Commons does not by itself make your website legally compliant or conformant with
        the Web Content Accessibility Guidelines (WCAG). Please read our{' '}
        <a href="/disclaimer">Disclaimer</a> for details on what Commons does and does not
        guarantee.
      </p>

      <h2>Third-party services</h2>
      <p>
        The website and hosted services rely on third parties, including{' '}
        <a href="https://www.cloudflare.com" rel="noopener noreferrer" target="_blank">Cloudflare</a>{' '}
        for static hosting and content delivery, and{' '}
        <a href="https://www.npmjs.com" rel="noopener noreferrer" target="_blank">npm</a> for
        package distribution. Your use of those services is also subject to their own terms.
        For information about analytics and how we handle data, see our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Intellectual property and names</h2>
      <p>
        The Commons source code is licensed under the MIT license. The{' '}
        <strong>&ldquo;Commons&rdquo;</strong> and <strong>&ldquo;21st Gov&rdquo;</strong>{' '}
        names, along with related logos, remain the property of 21st Gov and are not granted
        to you by the code license. You may make honest, non-misleading reference to Commons
        and 21st Gov to describe your use of the project. You may not use these names or
        logos in a way that implies endorsement, sponsorship, or affiliation without our
        permission.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. When we do, we will revise the
        &ldquo;Last updated&rdquo; date above. Material changes will be reflected on this
        page, and your continued use of the website or hosted services after an update means
        you accept the revised terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by applicable law. Any provision found unenforceable will
        be limited or removed to the minimum extent necessary, and the remaining provisions
        will stay in effect.
      </p>

      <h2>Contact and reporting</h2>
      <p>
        Questions about these terms, or reports about the website or hosted services, are
        welcome. For security issues, please email{' '}
        <a href="mailto:security@21stgov.com">security@21stgov.com</a>{' '}or use GitHub&rsquo;s
        private vulnerability reporting on the{' '}
        <a href="https://github.com/21stgov/commons" rel="noopener noreferrer" target="_blank">
          Commons repository
        </a>
        .
      </p>
    </LegalPage>
  )
}
