// SPDX-License-Identifier: MIT

'use client'

import { Field, InputGroup, InputGroupButton } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

function ClearIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CopyField(): React.JSX.Element {
  const [copied, setCopied] = React.useState(false)
  const value = 'https://commonsui.com'
  return (
    <Field label="Share link">
      <InputGroup
        prefix="https://"
        prefixLabel="Web address, secure"
        defaultValue="commonsui.com"
        readOnly
        actions={
          <InputGroupButton
            aria-label={copied ? 'Copied' : 'Copy link'}
            onClick={() => {
              void navigator.clipboard?.writeText(value)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </InputGroupButton>
        }
      />
    </Field>
  )
}

function ClearableField(): React.JSX.Element {
  const [value, setValue] = React.useState('Springfield')
  return (
    <Field label="City">
      <InputGroup
        value={value}
        onChange={(event) => setValue(event.target.value)}
        actions={
          value !== '' ? (
            <InputGroupButton aria-label="Clear city" onClick={() => setValue('')}>
              <ClearIcon />
            </InputGroupButton>
          ) : null
        }
      />
    </Field>
  )
}

export default function InputGroupDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Text addons">
        <div className="flex flex-col gap-3">
          <Field label="Amount">
            <InputGroup
              prefix="$"
              prefixLabel="Amount in US dollars"
              inputMode="decimal"
              placeholder="0.00"
            />
          </Field>
          <Field label="Weight">
            <InputGroup suffix="lbs" suffixLabel="Weight in pounds" inputMode="decimal" />
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="Trailing action buttons">
        <div className="flex flex-col gap-3">
          <CopyField />
          <ClearableField />
        </div>
      </DemoSection>

      <DemoSection title="Validation (whole group border)">
        <Field label="Amount" error="Enter an amount of at least $1.00.">
          <InputGroup prefix="$" prefixLabel="Amount in US dollars" defaultValue="0" />
        </Field>
      </DemoSection>

      <DemoSection title="Disabled">
        <Field label="Amount">
          <InputGroup prefix="$" defaultValue="25.00" disabled />
        </Field>
      </DemoSection>

      <DemoSection title="RTL">
        <div dir="rtl">
          <Field label="المبلغ">
            <InputGroup prefix="$" prefixLabel="المبلغ بالدولار الأمريكي" suffix="USD" />
          </Field>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
