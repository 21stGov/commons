// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useFieldControl } from '@/components/ui/context'
import { cn } from '@/lib/cn'

/**
 * Drop-zone styles for the file input.
 *
 * - min-h-11 (2.75rem / 44px) meets the Commons minimum target size; the
 *   whole zone is the click target.
 * - A real border on every state keeps a visible boundary in forced-colors
 *   mode. The idle border is dashed to read as a drop target.
 * - Drag-over is never color alone (WCAG 1.4.1): the border switches from
 *   dashed to solid and gains the accent color, and the background changes.
 * - Error state adds a solid error border on top of the color change.
 * - Focus ring rides on the visually-hidden native input's
 *   `:focus-visible` via `has-[:focus-visible]`, so the styled zone shows
 *   focus while the real control stays the keyboard target.
 */
export const fileInputVariants = cva([
  'flex min-h-11 w-full cursor-pointer flex-col items-center justify-center gap-1 text-center',
  'rounded-md border-2 border-dashed border-border bg-background',
  'px-3 py-205 text-sm text-foreground',
  'transition-colors motion-reduce:transition-none',
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
  // Drag-over: dashed -> solid + accent color + background change.
  'data-dragging:border-solid data-dragging:border-primary data-dragging:bg-muted',
  // Error: color + solid border, never color alone.
  'data-invalid:border-solid data-invalid:border-error-border',
  // Disabled: dedicated disabled tokens (contrast-validated), not opacity.
  'data-disabled:cursor-not-allowed data-disabled:border-disabled-border data-disabled:bg-disabled data-disabled:text-disabled-foreground',
])

/** Default byte-size formatter (overridable via `formatSize` for i18n). */
function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

function UploadIcon(): React.JSX.Element {
  // Inline SVG with currentColor so it survives forced-colors mode and
  // follows the zone's text token. Decorative — the instruction text
  // carries the meaning, so it stays aria-hidden.
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      data-slot="file-input-icon"
      className="size-3 shrink-0"
    >
      <path
        d="M8 10.5V3m0 0L5 6m3-3 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 10.5v1.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Stable identity key for a File (drops duplicates in multiple mode). */
function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export interface FileInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'prefix' | 'size' | 'children'
  > {
  /**
   * Controlled selected files. Provide together with `onFilesChange`.
   * Leave undefined for uncontrolled mode (seed with `defaultFiles`).
   */
  files?: File[]
  /** Initial selection in uncontrolled mode. */
  defaultFiles?: File[]
  /** Called with the next file list on every add, drop, or remove. */
  onFilesChange?: (files: File[]) => void
  /**
   * First half of the drop-zone instruction. Translation-ready.
   * @default "Drag files here or"
   */
  dragText?: string
  /**
   * Emphasized affordance that reads as "click to browse". Translation-ready.
   * @default "choose from folder"
   */
  browseText?: string
  /**
   * Accessible name for each file's Remove button; the file name is
   * appended so the button name is unique. Translation-ready.
   * @default "Remove"
   */
  removeLabel?: string
  /** Override the file-size formatter (e.g. for locale-aware units). */
  formatSize?: (bytes: number) => string
}

/**
 * File upload control: a native `input[type="file"]` (the source of truth)
 * inside a styled, clickable drop zone, plus a live-announced list of
 * selected files with per-file Remove buttons.
 *
 * Accessibility:
 * - The native input is only visually hidden (`sr-only`), never removed
 *   from the accessibility tree, so it stays keyboard-operable: Tab moves
 *   to it and Space/Enter opens the file dialog. The zone is a `<label>`,
 *   so a single pointer click also opens the dialog (WCAG 2.5.7 — dragging
 *   is enhancement-only).
 * - Drag-over state is signalled with a border-style change (dashed ->
 *   solid) and background, not color alone.
 * - The selected-file list sits in an `aria-live="polite"` region so
 *   additions and removals are announced (the visual update is otherwise
 *   silent).
 *
 * Inside a `<Field>` it inherits `aria-describedby` (hint/error),
 * `aria-invalid`, `required`, and `disabled` from the Field contract. It
 * keeps its own id (the wrapping drop-zone label is its name), so the
 * Field's label acts as the question above the control.
 *
 * `accept` is only a hint to the file dialog — always validate file type
 * and size on the server.
 */
export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  {
    className,
    files: filesProp,
    defaultFiles,
    onFilesChange,
    dragText = 'Drag files here or',
    browseText = 'choose from folder',
    removeLabel = 'Remove',
    formatSize = formatBytes,
    multiple = false,
    onChange,
    id: idProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalidProp,
    required: requiredProp,
    disabled: disabledProp,
    ...props
  },
  ref
) {
  const field = useFieldControl()
  const generatedId = React.useId()
  // Own id (not field.id): the drop zone is a <label> wrapping the input, so
  // adopting the Field id would let the Field's own <label htmlFor> associate
  // too — two labels per control (axe: form-field-multiple-labels).
  const inputId = idProp ?? generatedId

  const required = requiredProp ?? field.required
  const disabled = disabledProp ?? field.disabled
  const ariaInvalid = ariaInvalidProp ?? field['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  const describedBy =
    [field['aria-describedby'], ariaDescribedByProp].filter(Boolean).join(' ') || undefined

  const isControlled = filesProp !== undefined
  const [internalFiles, setInternalFiles] = React.useState<File[]>(defaultFiles ?? [])
  const files = isControlled ? filesProp : internalFiles

  const innerRef = React.useRef<HTMLInputElement | null>(null)
  const dragDepth = React.useRef(0)
  const [dragging, setDragging] = React.useState(false)

  // Mirror the current selection onto the native input's FileList so form
  // submission carries drag-dropped files and reflects removals. Guarded:
  // some environments lack a writable `files` / `DataTransfer`, in which
  // case component state stays the visible source of truth.
  const syncInputFiles = React.useCallback((next: File[]) => {
    const node = innerRef.current
    if (!node || typeof DataTransfer === 'undefined') {
      return
    }
    try {
      const data = new DataTransfer()
      for (const file of next) {
        data.items.add(file)
      }
      node.files = data.files
    } catch {
      // No writable FileList here — ignore and keep state authoritative.
    }
  }, [])

  const commit = React.useCallback(
    (next: File[]) => {
      if (!isControlled) {
        setInternalFiles(next)
      }
      syncInputFiles(next)
      onFilesChange?.(next)
    },
    [isControlled, onFilesChange, syncInputFiles]
  )

  const mergeFiles = React.useCallback(
    (existing: File[], incoming: File[]): File[] => {
      if (!multiple) {
        return incoming.slice(0, 1)
      }
      const seen = new Set(existing.map(fileKey))
      const merged = [...existing]
      for (const file of incoming) {
        const key = fileKey(file)
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(file)
        }
      }
      return merged
    },
    [multiple]
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files ? Array.from(event.target.files) : []
    if (picked.length > 0) {
      commit(mergeFiles(files, picked))
    }
    onChange?.(event)
  }

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    if (disabled) {
      return
    }
    event.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    if (disabled) {
      return
    }
    // preventDefault marks this a valid drop target so the browser fires drop.
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    if (disabled) {
      return
    }
    // Depth counter: dragenter/leave also fire crossing child elements, so
    // only clear the state once every entered node has been left.
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragging(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    if (disabled) {
      return
    }
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    const dropped = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : []
    if (dropped.length > 0) {
      commit(mergeFiles(files, dropped))
    }
  }

  const handleRemove = (target: File) => {
    commit(files.filter((file) => file !== target))
    // Return focus to the control so keyboard users are not dropped to
    // <body> when the Remove button they activated disappears.
    innerRef.current?.focus()
  }

  return (
    <div data-slot="file-input" className={cn('flex flex-col gap-2', className)}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- the
          native file input below IS the associated control (wrapped). */}
      <label
        data-slot="file-input-dropzone"
        data-dragging={dragging ? '' : undefined}
        data-invalid={invalid ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={fileInputVariants()}
      >
        <input
          {...props}
          ref={(node) => {
            innerRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }}
          id={inputId}
          type="file"
          multiple={multiple}
          required={required}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-describedby={describedBy}
          onChange={handleChange}
          data-slot="file-input-input"
          className="sr-only"
        />
        <UploadIcon />
        <span data-slot="file-input-instruction" className="leading-snug">
          {dragText}{' '}
          <span className="font-medium text-primary underline">{browseText}</span>
        </span>
      </label>

      {/* Live region: additions/removals are announced because the visual
          list change is otherwise silent. The container is always present in
          the DOM (before content) per the live-region contract. */}
      <div data-slot="file-input-file-list" aria-live="polite">
        {files.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {files.map((file, index) => (
              <li
                key={`${index}-${fileKey(file)}`}
                data-slot="file-input-file"
                className="flex items-center gap-2 rounded-sm border border-border bg-background px-2 py-1"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span data-slot="file-input-file-name" className="truncate text-sm text-foreground">
                    {file.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{formatSize(file.size)}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(file)}
                  aria-label={`${removeLabel} ${file.name}`}
                >
                  {removeLabel}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
})
