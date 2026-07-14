// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LanguageSelector, type Language } from '@/components/language-selector'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const bilingual: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const bilingualLinks: Language[] = [
  { code: 'en', label: 'English', href: '/en' },
  { code: 'es', label: 'Español', href: '/es' },
]

const multilingual: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
]

describe('LanguageSelector accessibility (axe)', () => {
  it('toggle (buttons) is axe-clean', async () => {
    const { container } = render(<LanguageSelector languages={bilingual} value="en" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('toggle (links) is axe-clean', async () => {
    const { container } = render(<LanguageSelector languages={bilingualLinks} value="en" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('dropdown is axe-clean', async () => {
    const { container } = render(<LanguageSelector languages={multilingual} value="en" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('dropdown with a hidden label is axe-clean (still named)', async () => {
    const { container } = render(
      <LanguageSelector languages={multilingual} value="en" hideLabel />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled toggle is axe-clean', async () => {
    const { container } = render(<LanguageSelector languages={bilingual} value="en" disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="lang-error">Choose a language.</p>
        <FieldProvider id="lang" hasError>
          <LanguageSelector languages={multilingual} value="en" />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('LanguageSelector variant resolution', () => {
  it('auto-selects the toggle for two languages', () => {
    render(<LanguageSelector languages={bilingual} value="en" />)
    expect(screen.getByRole('group', { name: 'Select language' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('auto-selects the dropdown for three or more languages', () => {
    render(<LanguageSelector languages={multilingual} value="en" />)
    expect(screen.getByRole('combobox', { name: 'Select language' })).toBeInTheDocument()
  })

  it('can be forced to a dropdown for two languages', () => {
    render(<LanguageSelector languages={bilingual} value="en" variant="dropdown" />)
    expect(screen.getByRole('combobox', { name: 'Select language' })).toBeInTheDocument()
  })

  it('renders a navigation landmark when languages carry hrefs', () => {
    render(<LanguageSelector languages={bilingualLinks} value="en" />)
    expect(screen.getByRole('navigation', { name: 'Select language' })).toBeInTheDocument()
  })
})

describe('LanguageSelector endonyms and lang wiring', () => {
  it('shows each language by its own-language name (endonym)', () => {
    render(<LanguageSelector languages={multilingual} value="en" variant="toggle" />)
    for (const lang of multilingual) {
      expect(screen.getByText(lang.label)).toBeInTheDocument()
    }
  })

  it('sets the correct lang attribute on each toggle button', () => {
    render(<LanguageSelector languages={bilingual} value="en" />)
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('lang', 'en')
    expect(screen.getByRole('button', { name: 'Español' })).toHaveAttribute('lang', 'es')
  })

  it('sets lang and hreflang on each link', () => {
    render(<LanguageSelector languages={bilingualLinks} value="en" />)
    const es = screen.getByRole('link', { name: 'Español' })
    expect(es).toHaveAttribute('lang', 'es')
    expect(es).toHaveAttribute('hreflang', 'es')
    expect(es).toHaveAttribute('href', '/es')
  })

  it('sets lang on each dropdown option', () => {
    render(<LanguageSelector languages={multilingual} value="ar" />)
    const option = screen.getByRole('option', { name: 'العربية' }) as HTMLOptionElement
    expect(option).toHaveAttribute('lang', 'ar')
    expect(option.value).toBe('ar')
  })
})

describe('LanguageSelector active state', () => {
  it('marks the active toggle item aria-current (non-color redundancy)', () => {
    render(<LanguageSelector languages={bilingual} value="es" />)
    expect(screen.getByRole('button', { name: 'Español' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'English' })).not.toHaveAttribute('aria-current')
  })

  it('reflects the active language as the dropdown value', () => {
    render(<LanguageSelector languages={multilingual} value="vi" />)
    expect(screen.getByRole('combobox')).toHaveValue('vi')
  })
})

describe('LanguageSelector selection', () => {
  it('fires onLanguageChange with the code from a toggle button', async () => {
    const user = userEvent.setup()
    const onLanguageChange = vi.fn()
    render(
      <LanguageSelector languages={bilingual} value="en" onLanguageChange={onLanguageChange} />
    )

    await user.click(screen.getByRole('button', { name: 'Español' }))
    expect(onLanguageChange).toHaveBeenCalledWith('es')
  })

  it('fires onLanguageChange with the code from the dropdown', async () => {
    const user = userEvent.setup()
    const onLanguageChange = vi.fn()
    render(
      <LanguageSelector languages={multilingual} value="en" onLanguageChange={onLanguageChange} />
    )

    await user.selectOptions(screen.getByRole('combobox'), 'zh')
    expect(onLanguageChange).toHaveBeenCalledWith('zh')
  })

  it('does not itself navigate — the link keeps its href for the consumer', () => {
    render(<LanguageSelector languages={bilingualLinks} value="en" />)
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en')
  })
})

describe('LanguageSelector keyboard', () => {
  it('tabs through the toggle items in order', async () => {
    const user = userEvent.setup()
    render(<LanguageSelector languages={bilingual} value="en" />)

    await user.tab()
    expect(screen.getByRole('button', { name: 'English' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Español' })).toHaveFocus()
  })

  it('a disabled toggle removes items from the tab order and cannot select', async () => {
    const user = userEvent.setup()
    const onLanguageChange = vi.fn()
    render(
      <LanguageSelector
        languages={bilingual}
        value="en"
        disabled
        onLanguageChange={onLanguageChange}
      />
    )

    await user.tab()
    expect(screen.getByRole('button', { name: 'Español' })).not.toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Español' }))
    expect(onLanguageChange).not.toHaveBeenCalled()
  })
})

describe('LanguageSelector Field wiring', () => {
  it('inherits disabled, describedby, and invalid from the Field contract (dropdown)', () => {
    render(
      <>
        <p id="lang-hint">Pick your language.</p>
        <p id="lang-error">Required.</p>
        <FieldProvider id="lang" hasHint hasError disabled>
          <LanguageSelector languages={multilingual} value="en" />
        </FieldProvider>
      </>
    )

    const control = screen.getByRole('combobox')
    expect(control).toBeDisabled()
    expect(control).toHaveAttribute('aria-describedby', 'lang-hint lang-error')
    expect(control).toHaveAttribute('aria-invalid', 'true')
  })

  it('an explicit disabled prop wins over the Field', () => {
    render(
      <FieldProvider id="lang" disabled>
        <LanguageSelector languages={bilingual} value="en" disabled={false} />
      </FieldProvider>
    )
    expect(screen.getByRole('button', { name: 'English' })).toBeEnabled()
  })
})

describe('LanguageSelector dev guard', () => {
  it('warns when no languages are provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<LanguageSelector languages={[]} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('at least one language'))
  })

  it('warns when a language is missing its endonym label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <LanguageSelector
        languages={[{ code: 'en', label: 'English' }, { code: 'es', label: '' }]}
      />
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('endonym'))
  })

  it('does not warn for valid languages', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<LanguageSelector languages={bilingual} value="en" />)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('LanguageSelector RTL', () => {
  it('renders a right-to-left endonym and stays axe-clean on an RTL page', async () => {
    const { container } = render(
      <div dir="rtl">
        <LanguageSelector languages={multilingual} value="ar" variant="toggle" />
      </div>
    )
    const group = screen.getByRole('group', { name: 'Select language' })
    expect(within(group).getByText('العربية')).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('lays out endonyms with dir=auto so mixed-direction names render correctly', () => {
    render(<LanguageSelector languages={bilingual} value="en" />)
    const text = screen.getByText('Español')
    expect(text).toHaveAttribute('dir', 'auto')
    expect(text).toHaveAttribute('lang', 'es')
  })
})
