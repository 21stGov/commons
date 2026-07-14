// SPDX-License-Identifier: MIT

'use client'

import { GovBanner } from '@21stgov/commons-react'
import * as React from 'react'

import {
  DemoControls,
  DemoSelectControl,
  DemoTextControl,
  DemoToggleControl,
} from './demo-controls'
import { DemoSection, DemoStack } from './demo-section'

export default function GovBannerDemo(): React.JSX.Element {
  const [entity, setEntity] = React.useState('the City of Springfield')
  const [mark, setMark] = React.useState<'default' | 'seal' | 'none'>('default')
  const [expanded, setExpanded] = React.useState(false)
  const brandMark =
    mark === 'seal' ? (
      <img src="/city-seal-example.svg" alt="" />
    ) : mark === 'none' ? null : undefined

  return (
    <DemoStack>
      <DemoSection title="Interactive preview">
        <DemoControls>
          <DemoTextControl label="Government entity" value={entity} onChange={setEntity} />
          <DemoSelectControl
            label="Brand mark"
            value={mark}
            onChange={setMark}
            options={[
              { label: 'Commons civic icon', value: 'default' },
              { label: 'Example city seal', value: 'seal' },
              { label: 'No mark', value: 'none' },
            ]}
          />
          <DemoToggleControl
            label="Show verification details"
            checked={expanded}
            onChange={setExpanded}
          />
        </DemoControls>
        <GovBanner
          entity={entity || 'your local government'}
          brandMark={brandMark}
          expanded={expanded}
          onExpandedChange={setExpanded}
        />
      </DemoSection>

      <DemoSection title="Custom entity, expanded by default">
        <GovBanner entity="the City of Springfield" defaultExpanded />
      </DemoSection>

      <DemoSection title="Spanish (all strings are props)">
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
      </DemoSection>
    </DemoStack>
  )
}
