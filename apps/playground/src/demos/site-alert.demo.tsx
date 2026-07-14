// SPDX-License-Identifier: MIT

import { SiteAlert } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Site alert'

export default function Demo(): React.JSX.Element {
  const [injected, setInjected] = React.useState(false)

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="site-alert-info-heading">
        <h3 id="site-alert-info-heading" className="mb-1 text-sm font-semibold">
          Info
        </h3>
        <SiteAlert variant="info" heading="Offices closed Monday">
          <p>
            City offices are closed Monday, July 4 for the holiday. Emergency services remain
            available. See the <a href="/holidays">holiday schedule</a>.
          </p>
        </SiteAlert>
      </section>

      <section aria-labelledby="site-alert-emergency-heading">
        <h3 id="site-alert-emergency-heading" className="mb-1 text-sm font-semibold">
          Emergency
        </h3>
        <SiteAlert variant="emergency" heading="Boil water notice in effect">
          Boil tap water for one minute before drinking or cooking until further notice.
        </SiteAlert>
      </section>

      <section aria-labelledby="site-alert-slim-heading">
        <h3 id="site-alert-slim-heading" className="mb-1 text-sm font-semibold">
          Slim
        </h3>
        <SiteAlert variant="info" slim>
          Online payments are temporarily unavailable while we perform maintenance.
        </SiteAlert>
      </section>

      <section aria-labelledby="site-alert-live-heading">
        <h3 id="site-alert-live-heading" className="mb-1 text-sm font-semibold">
          Live-region opt-in (dynamic injection)
        </h3>
        <div className="flex flex-col gap-105">
          <button
            type="button"
            className="min-h-11 self-start rounded-md border border-border-strong px-4 text-sm underline"
            onClick={() => setInjected((current) => !current)}
          >
            {injected ? 'Remove the emergency band' : 'Inject an emergency band'}
          </button>
          {injected ? (
            <SiteAlert variant="emergency" live="assertive" heading="Evacuation order">
              A wildfire is approaching. Leave the area immediately using marked routes.
            </SiteAlert>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="site-alert-rtl-heading">
        <h3 id="site-alert-rtl-heading" className="mb-1 text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" lang="ar">
          <SiteAlert variant="emergency" label="تنبيه الموقع" heading="إخلاء">
            غادر المنطقة فوراً باستخدام الطرق المحددة.
          </SiteAlert>
        </div>
      </section>
    </div>
  )
}
