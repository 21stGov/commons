// SPDX-License-Identifier: MIT

import { FieldProvider, Slider } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Slider'

function ControlledExample(): React.JSX.Element {
  const [volume, setVolume] = React.useState(60)
  return (
    <div className="flex flex-col gap-2">
      <Slider label="Volume" value={volume} onValueChange={(v) => setVolume(v as number)} />
      <p className="text-sm text-muted-foreground">Volume is {volume}.</p>
    </div>
  )
}

function ControlledRangeExample(): React.JSX.Element {
  const [price, setPrice] = React.useState<number[]>([200, 700])
  return (
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
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="slider-single-heading">
        <h3 id="slider-single-heading" className="text-sm font-semibold">
          Single value
        </h3>
        <Slider label="Volume" defaultValue={40} />
      </section>

      <section aria-labelledby="slider-range-heading">
        <h3 id="slider-range-heading" className="text-sm font-semibold">
          Range (two thumbs)
        </h3>
        <Slider label="Price range" defaultValue={[20, 80]} />
      </section>

      <section aria-labelledby="slider-ticks-heading">
        <h3 id="slider-ticks-heading" className="text-sm font-semibold">
          Ticks and steps
        </h3>
        <Slider
          label="Rating"
          description="Whole numbers from 0 to 10."
          defaultValue={6}
          min={0}
          max={10}
          step={1}
          ticks
        />
      </section>

      <section aria-labelledby="slider-input-heading">
        <h3 id="slider-input-heading" className="text-sm font-semibold">
          Exact-value input
        </h3>
        <Slider
          label="Brightness"
          description="Drag the slider or type an exact percentage."
          defaultValue={50}
          valueInput
        />
      </section>

      <section aria-labelledby="slider-controlled-heading">
        <h3 id="slider-controlled-heading" className="text-sm font-semibold">
          Controlled
        </h3>
        <ControlledExample />
      </section>

      <section aria-labelledby="slider-controlled-range-heading">
        <h3 id="slider-controlled-range-heading" className="text-sm font-semibold">
          Controlled range
        </h3>
        <ControlledRangeExample />
      </section>

      <section aria-labelledby="slider-field-heading">
        <h3 id="slider-field-heading" className="text-sm font-semibold">
          Field wiring (hint and error)
        </h3>
        <div className="flex flex-col gap-1">
          <p id="pg-temp-hint" className="text-sm text-muted-foreground">
            Set the target thermostat temperature.
          </p>
          <FieldProvider id="pg-temp" hasHint hasError required>
            <Slider label="Temperature" defaultValue={82} min={60} max={90} />
          </FieldProvider>
          <p id="pg-temp-error" className="text-sm font-medium text-error-foreground">
            Please choose a value at or below 78°.
          </p>
        </div>
      </section>

      <section aria-labelledby="slider-disabled-heading">
        <h3 id="slider-disabled-heading" className="text-sm font-semibold">
          Disabled
        </h3>
        <Slider label="Volume" defaultValue={40} disabled />
      </section>

      <section aria-labelledby="slider-rtl-heading">
        <h3 id="slider-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <Slider label="مستوى الصوت" description="مستوى الصوت الرئيسي" defaultValue={[20, 70]} />
        </div>
      </section>
    </div>
  )
}
