'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function AuditPage() {
  const [url, setUrl] = useState('')
  const [step, setStep] = useState<'input' | 'email'>('input')

  const handleAudit = () => {
    const cleanUrl = url.trim()

    if (!cleanUrl) {
      return
    }

    setStep('email')
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Nav />

      <section className="min-h-screen px-[6vw] pb-24 pt-32">
        <div className="mb-8 max-w-lg">
          <div className="mb-4 font-display text-[11px] uppercase tracking-[0.28em] text-grey-4">
            Free Tool
          </div>

          <h1 className="mb-4 font-display text-[clamp(1.8rem,6vw,3.2rem)] font-bold leading-tight">
            Find out what your website is costing you.
          </h1>

          <p className="text-grey-5">
            Paste your website URL. Snobo checks it and tells you exactly where
            you&apos;re likely losing customers — free, in under a minute.
          </p>
        </div>

        {step === 'input' && (
          <div className="max-w-md rounded-2xl bg-white p-4">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAudit()
                }
              }}
              type="text"
              inputMode="url"
              placeholder="yourwebsite.com"
              className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-black outline-none"
            />

            <button
              type="button"
              onClick={handleAudit}
              className="w-full rounded-full bg-black px-6 py-3.5 font-display font-semibold text-white"
            >
              Audit it →
            </button>
          </div>
        )}

        {step === 'email' && (
          <div className="max-w-md rounded-2xl bg-white p-6">
            <p className="mb-4 text-sm text-gray-500">
              Checking:
              <span className="ml-1 font-semibold text-black">
                {url}
              </span>
            </p>

            <input
              type="email"
              placeholder="Where should we send your report?"
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3.5 text-black outline-none"
            />

            <button
              type="button"
              className="w-full rounded-full bg-black px-6 py-3.5 font-display font-semibold text-white"
            >
              Get my free audit →
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}