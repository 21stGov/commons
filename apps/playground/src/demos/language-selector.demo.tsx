// SPDX-License-Identifier: MIT

import * as React from 'react'

import { LanguageSelector, type Language } from '@21stgov/commons-react'

export const title = 'Language selector'

const twoLanguages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const manyLanguages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
]

function ToggleExample(): React.JSX.Element {
  const [lang, setLang] = React.useState('en')
  return (
    <div className="flex flex-col gap-2">
      <LanguageSelector languages={twoLanguages} value={lang} onLanguageChange={setLang} />
      <p className="text-sm text-muted-foreground">Active language: {lang}</p>
    </div>
  )
}

function DropdownExample(): React.JSX.Element {
  const [lang, setLang] = React.useState('en')
  return (
    <div className="flex flex-col gap-2">
      <LanguageSelector languages={manyLanguages} value={lang} onLanguageChange={setLang} />
      <p className="text-sm text-muted-foreground">Active language: {lang}</p>
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="lang-toggle-heading">
        <h3 id="lang-toggle-heading" className="text-sm font-semibold">
          Two-language toggle
        </h3>
        <ToggleExample />
      </section>

      <section aria-labelledby="lang-links-heading">
        <h3 id="lang-links-heading" className="text-sm font-semibold">
          Toggle with real links
        </h3>
        <LanguageSelector
          languages={[
            { code: 'en', label: 'English', href: '/en' },
            { code: 'es', label: 'Español', href: '/es' },
          ]}
          value="en"
        />
      </section>

      <section aria-labelledby="lang-dropdown-heading">
        <h3 id="lang-dropdown-heading" className="text-sm font-semibold">
          Dropdown for 3+ languages
        </h3>
        <DropdownExample />
      </section>

      <section aria-labelledby="lang-rtl-heading">
        <h3 id="lang-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <LanguageSelector languages={manyLanguages} value="ar" />
        </div>
      </section>
    </div>
  )
}
