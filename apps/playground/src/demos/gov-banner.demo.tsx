// SPDX-License-Identifier: MIT

import * as React from 'react'

import { GovBanner } from '@21stgov/commons-react'

export const title = 'Gov Banner'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="gov-banner-default-heading">
        <h3 id="gov-banner-default-heading" className="text-sm font-semibold">
          Default (collapsed — activate “How to verify this site”)
        </h3>
        <GovBanner />
      </section>

      <section aria-labelledby="gov-banner-entity-heading">
        <h3 id="gov-banner-entity-heading" className="text-sm font-semibold">
          Custom entity, expanded by default
        </h3>
        <GovBanner entity="the City of Springfield" defaultExpanded />
      </section>

      <section aria-labelledby="gov-banner-spanish-heading">
        <h3 id="gov-banner-spanish-heading" className="text-sm font-semibold">
          Spanish (all strings are props)
        </h3>
        <GovBanner
          lang="es"
          ariaLabel="Sitio web oficial del gobierno"
          entity="el Condado de Maricopa"
          bannerText="Un sitio web oficial de {entity}"
          actionText="Así es como usted puede verificarlo"
          identityHeading="Verifique quién administra este sitio"
          identityText="Este sitio web es administrado por {entity}. Confirme que la dirección web coincida con la publicada por su gobierno antes de compartir información personal."
          securityHeading="Su conexión debe ser segura"
          securityText="Busque https:// y el indicador de conexión segura de su navegador. El cifrado protege la información durante el envío, pero no confirma quién administra un sitio web."
        />
      </section>

      <section aria-labelledby="gov-banner-rtl-heading">
        <h3 id="gov-banner-rtl-heading" className="text-sm font-semibold">
          RTL (Arabic)
        </h3>
        <div dir="rtl">
          <GovBanner
            lang="ar"
            ariaLabel="موقع حكومي رسمي"
            entity="حكومتك المحلية"
            bannerText="موقع رسمي تابع لـ {entity}"
            actionText="إليك كيف تتحقق"
            identityHeading="تحقق ممن يدير هذا الموقع"
            identityText="تدير {entity} هذا الموقع. تحقق من عنوان الويب قبل مشاركة معلوماتك الشخصية."
            securityHeading="يجب أن يكون اتصالك آمناً"
            securityText="ابحث عن https:// ومؤشر الاتصال الآمن في متصفحك. يحمي التشفير المعلومات أثناء انتقالها، لكنه لا يثبت هوية مشغل الموقع."
            defaultExpanded
          />
        </div>
      </section>
    </div>
  )
}
