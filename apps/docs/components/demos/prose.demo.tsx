// SPDX-License-Identifier: MIT

'use client'

import { Prose } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

function SampleArticle(): React.JSX.Element {
  return (
    <>
      <h2>Applying for a building permit</h2>
      <p>
        Most residential projects — additions, decks, and major renovations — require a permit
        before work begins. Review the checklist below, then reach out to{' '}
        <a href="/contact">the permits office</a> if you have questions about your project.
      </p>
      <h3>What you will need</h3>
      <ul>
        <li>A completed application form</li>
        <li>Proof of property ownership</li>
        <li>
          Site plans that reference the <code>setback</code> requirements for your zoning
          district
        </li>
      </ul>
      <blockquote>
        <p>Permits typically process within 10 business days of a complete submission.</p>
      </blockquote>
      <p>You can check the status of an existing application with the permits API:</p>
      <pre>
        <code>{'GET /api/permits/status?id=1234'}</code>
      </pre>
      <hr />
      <p>
        Still have questions? Read the <a href="/faq">frequently asked questions</a> or contact
        the office directly.
      </p>
    </>
  )
}

export default function ProseDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Default (base) size">
        <Prose as="article">
          <SampleArticle />
        </Prose>
      </DemoSection>

      <DemoSection title="Small size">
        <Prose as="article" size="sm">
          <SampleArticle />
        </Prose>
      </DemoSection>
    </DemoStack>
  )
}
