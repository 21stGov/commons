// SPDX-License-Identifier: MIT

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FileInput } from '@/components/file-input'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const NAME = /drag files here or\s+choose from folder/i

function makeFile(name: string, contents = 'x'): File {
  return new File([contents], name, { type: 'text/plain' })
}

function getInput(): HTMLInputElement {
  return screen.getByLabelText(NAME) as HTMLInputElement
}

/**
 * jsdom cannot open a native file dialog or perform a real OS drag, so those
 * are exercised through their DOM wiring instead: `user.upload` drives the
 * native input's change event with a synthetic FileList, and drag/drop is
 * fired as synthetic events carrying a `dataTransfer.files`. The keyboard
 * path (focus reaching the input; Space/Enter opening the dialog) is native
 * to `input[type="file"]` and is asserted via focusability, not by opening a
 * real dialog.
 */

describe('FileInput accessibility (axe)', () => {
  it('default is axe-clean', async () => {
    const { container } = render(<FileInput />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('multiple is axe-clean', async () => {
    const { container } = render(<FileInput multiple />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with selected files is axe-clean', async () => {
    const { container } = render(
      <FileInput multiple files={[makeFile('a.txt'), makeFile('b.txt')]} onFilesChange={() => {}} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled is axe-clean', async () => {
    const { container } = render(<FileInput disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state inside a Field is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="docs-error">Attach at least one document.</p>
        <FieldProvider id="docs" hasError>
          <FileInput />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('inside a Field with hint and error is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="docs-hint">PDF or images.</p>
        <p id="docs-error">Attach a document.</p>
        <FieldProvider id="docs" hasHint hasError required>
          <FileInput />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('FileInput name, role, and value', () => {
  it('renders a native file input with an accessible name from the drop zone', () => {
    render(<FileInput />)
    const input = getInput()
    expect(input).toBeInstanceOf(HTMLInputElement)
    expect(input).toHaveAttribute('type', 'file')
    expect(input.closest("[data-slot='file-input']")).not.toBeNull()
  })

  it('passes multiple through to the native input', () => {
    render(<FileInput multiple />)
    expect(getInput()).toHaveAttribute('multiple')
  })

  it('passes accept through to the native input', () => {
    render(<FileInput accept=".pdf,image/*" />)
    expect(getInput()).toHaveAttribute('accept', '.pdf,image/*')
  })

  it('reflects the error state via aria-invalid', () => {
    render(
      <FieldProvider id="docs" hasError>
        <FileInput />
      </FieldProvider>
    )
    expect(getInput()).toHaveAttribute('aria-invalid', 'true')
  })

  it('is only visually hidden, never removed from the a11y tree', () => {
    render(<FileInput />)
    const input = getInput()
    // sr-only keeps it focusable + in the tree; it must not be display:none.
    expect(input).toHaveClass('sr-only')
    expect(input).not.toHaveAttribute('hidden')
    expect(input).not.toHaveAttribute('aria-hidden')
  })
})

describe('FileInput keyboard and pointer activation', () => {
  it('Tab moves focus to the native input', async () => {
    const user = userEvent.setup()
    render(<FileInput />)
    await user.tab()
    expect(getInput()).toHaveFocus()
  })

  it('clicking the drop zone activates the native input (single-pointer path)', () => {
    render(<FileInput />)
    const input = getInput()
    const onInputClick = vi.fn()
    input.addEventListener('click', onInputClick)
    // The drop zone is a <label> wrapping the input, so a click anywhere in
    // it is forwarded by the browser to the control (which opens the file
    // dialog). jsdom performs this label activation but cannot open a dialog.
    fireEvent.click(screen.getByText(/choose from folder/i))
    expect(onInputClick).toHaveBeenCalled()
  })

  it('a disabled control is removed from the tab order', async () => {
    const user = userEvent.setup()
    render(<FileInput disabled />)
    expect(getInput()).toBeDisabled()
    await user.tab()
    expect(getInput()).not.toHaveFocus()
  })
})

describe('FileInput selection and live region', () => {
  it('shows a selected file (name + size) in the polite live region', async () => {
    const user = userEvent.setup()
    render(<FileInput />)
    await user.upload(getInput(), makeFile('report.txt', 'hello'))

    const region = screen.getByText('report.txt').closest("[data-slot='file-input-file-list']")
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('5 B')).toBeInTheDocument()
  })

  it('keeps multiple files when multiple is set', async () => {
    const user = userEvent.setup()
    render(<FileInput multiple />)
    await user.upload(getInput(), [makeFile('a.txt'), makeFile('b.txt')])
    expect(screen.getByText('a.txt')).toBeInTheDocument()
    expect(screen.getByText('b.txt')).toBeInTheDocument()
  })

  it('replaces the selection when multiple is not set', async () => {
    const user = userEvent.setup()
    render(<FileInput />)
    await user.upload(getInput(), makeFile('first.txt'))
    await user.upload(getInput(), makeFile('second.txt'))
    expect(screen.queryByText('first.txt')).not.toBeInTheDocument()
    expect(screen.getByText('second.txt')).toBeInTheDocument()
  })

  it('calls onFilesChange with the next file list', async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileInput onFilesChange={onFilesChange} />)
    await user.upload(getInput(), makeFile('c.txt'))
    expect(onFilesChange).toHaveBeenCalledTimes(1)
    expect(onFilesChange.mock.calls[0][0]).toHaveLength(1)
    expect(onFilesChange.mock.calls[0][0][0].name).toBe('c.txt')
  })
})

describe('FileInput remove', () => {
  it('each Remove button is named with its file for a unique accessible name', async () => {
    const user = userEvent.setup()
    render(<FileInput multiple />)
    await user.upload(getInput(), [makeFile('a.txt'), makeFile('b.txt')])
    expect(screen.getByRole('button', { name: 'Remove a.txt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove b.txt' })).toBeInTheDocument()
  })

  it('removing a file updates the list (announced via the live region)', async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileInput multiple onFilesChange={onFilesChange} />)
    await user.upload(getInput(), [makeFile('a.txt'), makeFile('b.txt')])

    await user.click(screen.getByRole('button', { name: 'Remove a.txt' }))
    expect(screen.queryByText('a.txt')).not.toBeInTheDocument()
    expect(screen.getByText('b.txt')).toBeInTheDocument()
    // Last call is the removal.
    const last = onFilesChange.mock.calls.at(-1)?.[0]
    expect(last).toHaveLength(1)
    expect(last[0].name).toBe('b.txt')
  })

  it('honors a custom removeLabel', async () => {
    const user = userEvent.setup()
    render(<FileInput removeLabel="Delete" />)
    await user.upload(getInput(), makeFile('a.txt'))
    expect(screen.getByRole('button', { name: 'Delete a.txt' })).toBeInTheDocument()
  })
})

describe('FileInput drag-over state', () => {
  it('adds a drag-over data attribute on drag enter and clears it on leave', () => {
    render(<FileInput />)
    const zone = screen
      .getByText(/choose from folder/i)
      .closest("[data-slot='file-input-dropzone']") as HTMLElement

    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } })
    expect(zone).toHaveAttribute('data-dragging', '')

    fireEvent.dragLeave(zone, { dataTransfer: { files: [] } })
    expect(zone).not.toHaveAttribute('data-dragging')
  })

  it('drop adds files (drag is an enhancement over the click path)', () => {
    render(<FileInput multiple />)
    const zone = screen
      .getByText(/choose from folder/i)
      .closest("[data-slot='file-input-dropzone']") as HTMLElement

    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('dropped.txt')] } })
    expect(screen.getByText('dropped.txt')).toBeInTheDocument()
    expect(zone).not.toHaveAttribute('data-dragging')
  })

  it('ignores drops while disabled', () => {
    render(<FileInput multiple disabled />)
    const zone = screen
      .getByText(/choose from folder/i)
      .closest("[data-slot='file-input-dropzone']") as HTMLElement

    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('nope.txt')] } })
    expect(screen.queryByText('nope.txt')).not.toBeInTheDocument()
  })
})

describe('FileInput Field wiring', () => {
  it('inherits describedby, invalid, required, and disabled from the Field contract', () => {
    render(
      <>
        <p id="docs-hint">Optional.</p>
        <p id="docs-error">Something is wrong.</p>
        <FieldProvider id="docs" hasHint hasError required disabled>
          <FileInput />
        </FieldProvider>
      </>
    )
    const input = getInput()
    // Keeps its own id (never the Field's) so the wrapping drop-zone label is
    // the only <label> for the control.
    expect(input).not.toHaveAttribute('id', 'docs')
    expect(input.id).not.toBe('')
    expect(input).toHaveAttribute('aria-describedby', 'docs-hint docs-error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toBeRequired()
    expect(input).toBeDisabled()
  })

  it('works standalone with a generated id outside any Field', () => {
    render(<FileInput />)
    const input = getInput()
    expect(input.id).not.toBe('')
    expect(input).not.toBeRequired()
    expect(input).not.toBeDisabled()
  })
})

describe('FileInput controlled mode', () => {
  it('renders the controlled files and does not mutate them internally', async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileInput multiple files={[makeFile('locked.txt')]} onFilesChange={onFilesChange} />)

    expect(screen.getByText('locked.txt')).toBeInTheDocument()
    // Uploading notifies the consumer but the displayed list stays controlled.
    await user.upload(getInput(), makeFile('new.txt'))
    expect(onFilesChange).toHaveBeenCalled()
    expect(screen.getByText('locked.txt')).toBeInTheDocument()
    expect(screen.queryByText('new.txt')).not.toBeInTheDocument()
  })
})

describe('FileInput RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <FileInput
          multiple
          dragText="اسحب الملفات هنا أو"
          browseText="اختر من المجلد"
          removeLabel="إزالة"
          files={[makeFile('ملف.txt')]}
          onFilesChange={() => {}}
        />
      </div>
    )
    expect(screen.getByText('ملف.txt')).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
