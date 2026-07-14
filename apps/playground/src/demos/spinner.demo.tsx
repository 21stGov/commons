// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Button, Spinner } from '@21stgov/commons-react'

export const title = 'Spinner'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="spinner-sizes-heading">
        <h3 id="spinner-sizes-heading" className="text-sm font-semibold">
          Sizes
        </h3>
        <div className="flex items-center gap-4">
          <Spinner size="sm" label="Loading (small)" />
          <Spinner size="md" label="Loading (medium)" />
          <Spinner size="lg" label="Loading (large)" />
        </div>
      </section>

      <section aria-labelledby="spinner-inline-heading">
        <h3 id="spinner-inline-heading" className="text-sm font-semibold">
          Inline with text (decorative — the text announces the wait)
        </h3>
        <p className="flex items-center gap-2 text-sm">
          <Spinner size="sm" decorative />
          Saving your changes…
        </p>
      </section>

      <section aria-labelledby="spinner-button-heading">
        <h3 id="spinner-button-heading" className="text-sm font-semibold">
          Inside a button (decorative — the button owns the status)
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button aria-busy>
            <Spinner size="sm" decorative />
            Submitting…
          </Button>
          <Button variant="outline" disabled>
            <Spinner size="sm" decorative />
            Loading…
          </Button>
        </div>
      </section>

      <section aria-labelledby="spinner-standalone-heading">
        <h3 id="spinner-standalone-heading" className="text-sm font-semibold">
          Standalone (announces its own status)
        </h3>
        <div className="flex items-center gap-4">
          <Spinner label="Loading results" />
          <Spinner aria-label="Fetching data" />
        </div>
      </section>

      <section aria-labelledby="spinner-color-heading">
        <h3 id="spinner-color-heading" className="text-sm font-semibold">
          Inherits currentColor
        </h3>
        <p className="flex items-center gap-2 text-sm text-primary">
          <Spinner size="sm" decorative />
          Tinted by the surrounding text color
        </p>
      </section>
    </div>
  )
}
