// SPDX-License-Identifier: MIT

'use client'

import { Alert, Button, Field, Input } from '@21stgov/commons-react'
import * as React from 'react'

/**
 * Live components on the homepage — real @21stgov/commons-react code, the
 * same source the CLI installs. Re-themes with the site's theme switcher.
 */
export function HomeDemoStrip(): React.JSX.Element {
  const [value, setValue] = React.useState('')

  return (
    <div className="docs-home-demo">
      <section aria-labelledby="home-demo-buttons" className="docs-home-demo-panel">
        <h3 id="home-demo-buttons" className="text-sm font-semibold text-muted-foreground">
          Button
        </h3>
        <div className="docs-home-demo-actions">
          <Button>Submit request</Button>
          <Button variant="secondary">Save draft</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </section>

      <section aria-labelledby="home-demo-field" className="docs-home-demo-panel">
        <h3 id="home-demo-field" className="text-sm font-semibold text-muted-foreground">
          Field + Input
        </h3>
        <Field label="Email address" hint="We only use this to reply." required>
          <Input
            type="email"
            autoComplete="email"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </Field>
      </section>

      <section
        aria-labelledby="home-demo-alert"
        className="docs-home-demo-panel docs-home-demo-alert"
      >
        <h3 id="home-demo-alert" className="text-sm font-semibold text-muted-foreground">
          Alert
        </h3>
        <Alert variant="success" heading="Application submitted">
          Your permit application was received. Meaning never relies on color alone — every state
          pairs its colors with an icon and an accent border.
        </Alert>
      </section>
    </div>
  )
}
