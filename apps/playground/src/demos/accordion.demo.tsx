// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@21stgov/commons-react'

export const title = 'Accordion'

const faq = [
  {
    value: 'water',
    question: 'Where do I pay my water bill?',
    answer:
      'Pay online through the resident portal, by mail, or in person at City Hall, 100 Main Street. Online payments post the same business day.',
  },
  {
    value: 'trash',
    question: 'When is trash collected in my neighborhood?',
    answer:
      'Trash is collected weekly. Enter your address in the collection-schedule lookup to find your pickup day. Holiday weeks shift pickup one day later.',
  },
  {
    value: 'permits',
    question: 'How do I apply for a building permit?',
    answer:
      'Submit the permit application through the online portal. Most residential permits are reviewed within ten business days.',
  },
] as const

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="accordion-faq-heading">
        <h3 id="accordion-faq-heading" className="text-sm font-semibold">
          FAQ (default — multiple panels may be open)
        </h3>
        <Accordion defaultValue={['water']}>
          {faq.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionPanel>{item.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="accordion-single-heading">
        <h3 id="accordion-single-heading" className="text-sm font-semibold">
          Single-open mode (multiple={'{false}'})
        </h3>
        <Accordion multiple={false}>
          {faq.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger headingLevel="h4">{item.question}</AccordionTrigger>
              <AccordionPanel>{item.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="accordion-rtl-heading">
        <h3 id="accordion-rtl-heading" className="text-sm font-semibold">
          RTL (Arabic — chevron flips to the inline-end edge)
        </h3>
        <div dir="rtl">
          <Accordion lang="ar" defaultValue={['hours']}>
            <AccordionItem value="hours">
              <AccordionTrigger>ما هي ساعات عمل البلدية؟</AccordionTrigger>
              <AccordionPanel>من الأحد إلى الخميس، من ٨ صباحًا حتى ٤ مساءً.</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="payments">
              <AccordionTrigger>كيف أدفع فاتورة المياه؟</AccordionTrigger>
              <AccordionPanel>ادفع عبر البوابة الإلكترونية أو في مبنى البلدية.</AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  )
}
