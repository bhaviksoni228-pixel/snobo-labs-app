'use client'

import { useState } from 'react'

type FaqItem = { q: string; a: string }

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-2xl space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={item.q}
            className={`border rounded-xl overflow-hidden transition-colors ${
              isOpen ? 'border-white' : 'border-grey-2'
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-display font-semibold text-sm">{item.q}</span>
              <span
                className={`flex-shrink-0 text-lg text-grey-4 transition-transform duration-200 ${
                  isOpen ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>
            <div
              className="grid transition-all duration-300 ease-in-out"
              style={{
                gridTemplateRows: isOpen ? '1fr' : '0fr',
              }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm text-grey-4 leading-relaxed">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}