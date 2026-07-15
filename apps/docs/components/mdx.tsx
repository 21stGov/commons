// SPDX-License-Identifier: MIT

import { Tab, Tabs as FumaTabs } from 'fumadocs-ui/components/tabs'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'

import { ComponentDemo } from '@/components/component-demo'
import { ComponentStatus } from '@/components/component-status'
import { Framework, FrameworkToggle } from '@/components/framework-toggle'

function DocsTabs(props: ComponentProps<typeof FumaTabs>) {
  return (
    <FumaTabs {...props} className={['docs-tabs', props.className].filter(Boolean).join(' ')} />
  )
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs: DocsTabs,
    ComponentDemo,
    ComponentStatus,
    Framework,
    FrameworkToggle,
    ...components,
  }
}
