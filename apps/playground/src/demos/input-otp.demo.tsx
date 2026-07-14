// SPDX-License-Identifier: MIT

import * as React from 'react'

import { InputOTP } from '@21stgov/commons-react'

export const title = 'Input OTP'

function ControlledExample(): React.JSX.Element {
  const [code, setCode] = React.useState('')
  return (
    <div className="flex flex-col gap-2">
      <InputOTP
        label="Enter code"
        description="We texted a 6-digit code to your phone."
        value={code}
        onValueChange={setCode}
        onValueComplete={(value) => window.console.log('complete', value)}
      />
      <p className="text-sm text-muted-foreground">
        {code.length === 6 ? `Complete: ${code}` : `${code.length} of 6 digits entered.`}
      </p>
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="otp-states-heading">
        <h3 id="otp-states-heading" className="text-sm font-semibold">
          States
        </h3>
        <div className="flex flex-col gap-4">
          <InputOTP label="Verification code" />
          <InputOTP label="Prefilled code" defaultValue="123456" />
          <InputOTP label="Disabled code" disabled defaultValue="123" />
        </div>
      </section>

      <section aria-labelledby="otp-modes-heading">
        <h3 id="otp-modes-heading" className="text-sm font-semibold">
          Length and validation modes
        </h3>
        <div className="flex flex-col gap-4">
          <InputOTP label="4-digit PIN" length={4} />
          <InputOTP label="Alphanumeric access code" validationType="alphanumeric" />
          <InputOTP label="Masked code" mask defaultValue="4821" length={4} />
        </div>
      </section>

      <section aria-labelledby="otp-controlled-heading">
        <h3 id="otp-controlled-heading" className="text-sm font-semibold">
          Controlled
        </h3>
        <ControlledExample />
      </section>

      <section aria-labelledby="otp-rtl-heading">
        <h3 id="otp-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <InputOTP label="رمز التحقق" description="أدخل الرمز المكوّن من ٦ أرقام." />
        </div>
      </section>
    </div>
  )
}
