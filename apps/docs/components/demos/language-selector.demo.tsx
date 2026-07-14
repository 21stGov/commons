// SPDX-License-Identifier: MIT

'use client'

import { LanguageSelector, type Language } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const twoLanguages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const twoLanguageLinks: Language[] = [
  { code: 'en', label: 'English', href: '/en' },
  { code: 'es', label: 'Español', href: '/es' },
]

const manyLanguages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
]

export default function LanguageSelectorDemo(): React.JSX.Element {
  const [toggleLang, setToggleLang] = React.useState('en')
  const [dropdownLang, setDropdownLang] = React.useState('en')

  return (
    <DemoStack>
      <DemoSection title="Two-language toggle (in-place switch)">
        <div className="flex flex-col gap-2">
          <LanguageSelector
            languages={twoLanguages}
            value={toggleLang}
            onLanguageChange={setToggleLang}
          />
          <p className="text-sm text-muted-foreground">Active language: {toggleLang}</p>
        </div>
      </DemoSection>

      <DemoSection title="Two-language toggle (real links)">
        <LanguageSelector languages={twoLanguageLinks} value="en" />
      </DemoSection>

      <DemoSection title="Dropdown for three or more languages">
        <div className="flex flex-col gap-2">
          <LanguageSelector
            languages={manyLanguages}
            value={dropdownLang}
            onLanguageChange={setDropdownLang}
          />
          <p className="text-sm text-muted-foreground">Active language: {dropdownLang}</p>
        </div>
      </DemoSection>

      <DemoSection title="Globe only (hidden text label)">
        <LanguageSelector languages={manyLanguages} value="en" hideLabel />
      </DemoSection>

      <DemoSection title="On a right-to-left page">
        <div dir="rtl">
          <LanguageSelector languages={manyLanguages} value="ar" />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
