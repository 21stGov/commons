// SPDX-License-Identifier: MIT

'use client'

import { FieldProvider, Slider } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SliderDemo(): React.JSX.Element {
  const [volume, setVolume] = React.useState(60)
  const [price, setPrice] = React.useState<number[]>([200, 700])

  return (
    <DemoStack>
      <DemoSection title="Single value">
        <Slider label="Volume" defaultValue={40} />
      </DemoSection>

      <DemoSection title="Range (two thumbs)">
        <Slider label="Price range" defaultValue={[20, 80]} />
      </DemoSection>

      <DemoSection title="Tick marks and steps">
        <Slider
          label="Rating"
          description="Whole numbers from 0 to 10."
          defaultValue={6}
          min={0}
          max={10}
          step={1}
          ticks
        />
      </DemoSection>

      <DemoSection title="With an exact-value input">
        <Slider
          label="Brightness"
          description="Drag the slider or type an exact percentage."
          defaultValue={50}
          valueInput
        />
      </DemoSection>

      <DemoSection title="Controlled">
        <div className="flex flex-col gap-2">
          <Slider label="Volume" value={volume} onValueChange={(v) => setVolume(v as number)} />
          <p className="text-sm text-muted-foreground">Volume is {volume}.</p>
        </div>
      </DemoSection>

      <DemoSection title="Controlled range">
        <div className="flex flex-col gap-2">
          <Slider
            label="Budget"
            min={0}
            max={1000}
            step={50}
            value={price}
            onValueChange={(v) => setPrice(v as number[])}
          />
          <p className="text-sm text-muted-foreground">
            Between ${price[0]} and ${price[1]}.
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Field wiring (hint and error)">
        {/* The Slider self-labels (like Switch), so it is not wrapped in a
            <Field label>. A FieldProvider still feeds it the hint/error ids,
            aria-invalid, and required state. */}
        <div className="flex flex-col gap-1">
          <p id="temp-hint" className="text-sm text-muted-foreground">
            Set the target thermostat temperature.
          </p>
          <FieldProvider id="temp" hasHint hasError required>
            <Slider label="Temperature" defaultValue={82} min={60} max={90} />
          </FieldProvider>
          <p id="temp-error" className="text-sm font-medium text-error-foreground">
            Please choose a value at or below 78°.
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Disabled">
        <Slider label="Volume" defaultValue={40} disabled />
      </DemoSection>
    </DemoStack>
  )
}
