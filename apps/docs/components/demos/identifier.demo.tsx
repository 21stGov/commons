// SPDX-License-Identifier: MIT

'use client'

import {
  Identifier,
  IdentifierResource,
  IdentifierIdentity,
  IdentifierLink,
  IdentifierLinks,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function IdentifierDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Local identity + policy links + a useful local resource">
        <Identifier>
          <IdentifierIdentity agencyName="City of Example" domain="cityofexample.example" />
          <IdentifierLinks>
            <IdentifierLink href="#about">About the City of Example</IdentifierLink>
            <IdentifierLink href="#accessibility">Accessibility statement</IdentifierLink>
            <IdentifierLink href="#records">Public records</IdentifierLink>
            <IdentifierLink href="#privacy">Privacy policy</IdentifierLink>
          </IdentifierLinks>
          <IdentifierResource
            text="Need help finding a city service?"
            linkText="Contact the City"
            href="#contact"
          />
        </Identifier>
      </DemoSection>

      <DemoSection title="Parent agency (disclaimer names the parent)">
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
      </DemoSection>

      <DemoSection title="Spanish (every identity and resource string is a prop)">
        <Identifier lang="es" ariaLabel="Identificador de agencia">
          <IdentifierIdentity
            agencyName="la Ciudad de Ejemplo"
            domain="ciudaddeejemplo.example"
            officialText="Este sitio web es administrado por {agency}"
          />
          <IdentifierLinks ariaLabel="Enlaces importantes">
            <IdentifierLink href="#acerca">Acerca de la Ciudad</IdentifierLink>
            <IdentifierLink href="#privacidad">Política de privacidad</IdentifierLink>
          </IdentifierLinks>
          <IdentifierResource
            text="¿Necesita ayuda para encontrar un servicio local?"
            linkText="Contacte con la ciudad"
            href="#contacto"
          />
        </Identifier>
      </DemoSection>
    </DemoStack>
  )
}
