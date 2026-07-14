// SPDX-License-Identifier: MIT

'use client'

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const faq = [
  {
    value: 'water',
    question: 'Where do I pay my water bill?',
    answer: 'Pay online through the resident portal, by mail, or in person at City Hall.',
  },
  {
    value: 'trash',
    question: 'When is trash collected?',
    answer: 'Trash is collected weekly. Holiday weeks shift pickup one day later.',
  },
  {
    value: 'permits',
    question: 'How do I apply for a building permit?',
    answer: 'Submit the application online. Most residential permits are reviewed in ten days.',
  },
] as const

export default function AccordionDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="FAQ (multiple panels may be open — the default)">
        <Accordion defaultValue={['water']}>
          {faq.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionPanel>{item.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </DemoSection>

      <DemoSection title="Single-open mode">
        <Accordion multiple={false}>
          {faq.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger headingLevel="h4">{item.question}</AccordionTrigger>
              <AccordionPanel>{item.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </DemoSection>
    </DemoStack>
  )
}
