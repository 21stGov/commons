// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  Identifier,
  IdentifierResource,
  IdentifierIdentity,
  IdentifierLink,
  IdentifierLinks,
} from '@21stgov/commons-react'

export const title = 'Identifier'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="identifier-default-heading">
        <h3 id="identifier-default-heading" className="text-sm font-semibold">
          Local identity + policy links + useful local resource
        </h3>
        <Identifier>
          <IdentifierIdentity agencyName="City of Example" domain="cityofexample.example" />
          <IdentifierLinks>
            <IdentifierLink href="#about">About the City of Example</IdentifierLink>
            <IdentifierLink href="#accessibility">Accessibility statement</IdentifierLink>
            <IdentifierLink href="#records">Public records</IdentifierLink>
            <IdentifierLink href="#privacy">Privacy policy</IdentifierLink>
            <IdentifierLink href="#no-fear">No FEAR Act data</IdentifierLink>
          </IdentifierLinks>
          <IdentifierResource text="Need help?" linkText="Contact the City" href="#contact" />
        </Identifier>
      </section>

      <section aria-labelledby="identifier-parent-heading">
        <h3 id="identifier-parent-heading" className="text-sm font-semibold">
          Parent agency (disclaimer names the parent, not the department)
        </h3>
        <Identifier ariaLabel="Agency identifier (parent demo)">
          <IdentifierIdentity
            agencyName="Parks and Recreation Department"
            parentAgency="City of Example"
            domain="parks.cityofexample.example"
          />
          <IdentifierLinks ariaLabel="Important links (parent demo)">
            <IdentifierLink href="#accessibility">Accessibility statement</IdentifierLink>
            <IdentifierLink href="#privacy">Privacy policy</IdentifierLink>
          </IdentifierLinks>
          <IdentifierResource
            text="Have a question about parks programs?"
            linkText="Contact Parks and Recreation"
            href="#parks-contact"
          />
        </Identifier>
      </section>

      <section aria-labelledby="identifier-spanish-heading">
        <h3 id="identifier-spanish-heading" className="text-sm font-semibold">
          Spanish (every identity and resource string is a prop)
        </h3>
        <Identifier lang="es" ariaLabel="Identificador de agencia">
          <IdentifierIdentity
            agencyName="la Ciudad de Ejemplo"
            domain="ciudaddeejemplo.example"
            officialText="Este sitio web es administrado por {agency}"
          />
          <IdentifierLinks ariaLabel="Enlaces importantes">
            <IdentifierLink href="#acerca">Acerca de la Ciudad</IdentifierLink>
            <IdentifierLink href="#accesibilidad">Declaración de accesibilidad</IdentifierLink>
            <IdentifierLink href="#privacidad">Política de privacidad</IdentifierLink>
          </IdentifierLinks>
          <IdentifierResource
            text="¿Necesita ayuda para encontrar un servicio local?"
            linkText="Contacte con la ciudad"
            href="#contacto"
          />
        </Identifier>
      </section>

      <section aria-labelledby="identifier-rtl-heading">
        <h3 id="identifier-rtl-heading" className="text-sm font-semibold">
          RTL (Arabic)
        </h3>
        <div dir="rtl">
          <Identifier lang="ar" ariaLabel="معرّف الجهة الحكومية">
            <IdentifierIdentity
              agencyName="مدينة المثال"
              domain="cityofexample.example"
              officialText="يتم تشغيل هذا الموقع بواسطة {agency}"
            />
            <IdentifierLinks ariaLabel="روابط مهمة">
              <IdentifierLink href="#about">حول المدينة</IdentifierLink>
              <IdentifierLink href="#accessibility">بيان إمكانية الوصول</IdentifierLink>
            </IdentifierLinks>
            <IdentifierResource
              text="هل تحتاج إلى مساعدة في العثور على خدمة محلية؟"
              linkText="اتصل بالمدينة"
              href="#contact"
            />
          </Identifier>
        </div>
      </section>
    </div>
  )
}
