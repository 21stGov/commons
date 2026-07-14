// SPDX-License-Identifier: MIT

'use client'

import { create } from '@orama/orama'
import { useDocsSearch } from 'fumadocs-core/search/client'
import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static'
import {
  SearchDialog as FumaSearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search'
import * as React from 'react'

function initOrama() {
  return create({
    schema: { _: 'string' },
    language: 'english',
  })
}

/**
 * Static search: the export ships a prebuilt Orama index (from the
 * `staticGET` route) and search runs entirely in the browser, so it works on
 * any static host — no server required.
 */
export function SearchDialog(props: SharedProps): React.JSX.Element {
  const { search, setSearch, query } = useDocsSearch({
    client: oramaStaticClient({ initOrama }),
  })

  return (
    <FumaSearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay className="docs-search-overlay" />
      <SearchDialogContent className="docs-search-dialog">
        <SearchDialogHeader className="docs-search-header">
          <SearchDialogIcon className="docs-search-icon" />
          <SearchDialogInput />
          <SearchDialogClose className="docs-search-close">Esc</SearchDialogClose>
        </SearchDialogHeader>
        <SearchDialogList
          className="docs-search-results"
          items={query.data !== 'empty' ? query.data : null}
        />
        <SearchDialogFooter className="docs-search-footer">
          <span>Type to search all documentation</span>
          <span aria-hidden="true">↑↓ Navigate · Enter Open</span>
        </SearchDialogFooter>
      </SearchDialogContent>
    </FumaSearchDialog>
  )
}
