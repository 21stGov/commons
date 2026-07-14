// SPDX-License-Identifier: MIT

'use client'

import { InputOTP } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function InputOtpDemo(): React.JSX.Element {
  const [code, setCode] = React.useState('')

  return (
    <DemoStack>
      <DemoSection title="States">
        <div className="flex flex-col gap-4">
          <InputOTP label="Verification code" description="We texted a 6-digit code to your phone." />
          <InputOTP label="Prefilled code" defaultValue="123456" />
          <InputOTP label="Disabled code" disabled defaultValue="123" />
        </div>
      </DemoSection>

      <DemoSection title="Length and validation modes">
        <div className="flex flex-col gap-4">
          <InputOTP label="4-digit PIN" length={4} />
          <InputOTP
            label="Alphanumeric access code"
            validationType="alphanumeric"
            description="Letters and numbers; not case-sensitive."
          />
          <InputOTP label="Masked code" mask defaultValue="4821" length={4} />
        </div>
      </DemoSection>

      <DemoSection title="Controlled">
        <div className="flex flex-col gap-2">
          <InputOTP label="Enter code" value={code} onValueChange={setCode} />
          <p className="text-sm text-muted-foreground">
            {code.length === 6 ? `Complete: ${code}` : `${code.length} of 6 digits entered.`}
          </p>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
