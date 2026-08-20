'use client'

import { useRef, useState } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Step = 'input' | 'email' | 'loading' | 'result' | 'error'

export default function AuditPage() {
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [report, setReport] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const urlInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  function handleUrlSubmit() {
    const value = urlInputRef.current?.value?.trim() || ''

    if (!value) return

    setUrl(value)
    setErrorMsg('')
    setStep('email')
  }

  function handleEmailSubmit() {
    const email = emailInputRef.current?.value?.trim() || ''

    if (!email) return

    setStep('loading')
    setErrorMsg('')

    submitAudit(email)
  }

  async function submitAudit(email: string) {
    try {
      const res = await fetch(`${API_URL}/api/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          email,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      setReport(data.report || '')
      setStep('result')
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'

      setErrorMsg(message)
      setStep('error')
    }
  }

  function handleUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleUrlSubmit()
    }
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEmailSubmit()
    }
  }

  return (
    <main className="relative bg-black min-h-screen">
      <Nav />

      <section className="px-[6vw] pt-32 pb-24 min-h-screen">
        <div className="max-w-lg mb-8">
          <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-4">
            Free Tool
          </div>

          <h1 className="font-display font-bold text-[clamp(1.8rem,6vw,3.2rem)] leading-tight mb-4 text-white">
            Find out what your website is costing you.
          </h1>

          <p className="text-grey-5">
            Paste your website URL. Snobo checks it and tells you exactly where
            you&apos;re likely losing customers — free, in under a minute.
          </p>
        </div>

        {step === 'input' && (
          <div className="max-w-md flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <input
              ref={urlInputRef}
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="yourwebsite.com"
              aria-label="Website URL"
              className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
              onKeyDown={handleUrlKeyDown}
            />

            <button
              type="button"
              onClick={handleUrlSubmit}
              className="font-display font-semibold px-6 py-3.5 rounded-full bg-black text-white whitespace-nowrap"
            >
              Audit it →
            </button>
          </div>
        )}

        {step === 'email' && (
          <div className="max-w-md space-y-4 bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="text-sm text-gray-500">
              Checking:{' '}
              <span className="text-black font-semibold break-all">
                {url}
              </span>
            </div>

            <input
              ref={emailInputRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Where should we send your report?"
              aria-label="Email address"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
              onKeyDown={handleEmailKeyDown}
            />

            <button
              type="button"
              onClick={handleEmailSubmit}
              className="font-display font-semibold px-6 py-3.5 rounded-full bg-black text-white"
            >
              Get my free audit →
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="max-w-md py-10 px-6 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="text-black animate-pulse font-medium">
              Analyzing your site...
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="max-w-md space-y-4 bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <p className="text-red-600 text-sm font-medium">
              {errorMsg}
            </p>

            <button
              type="button"
              onClick={() => {
                setErrorMsg('')
                setStep('input')
              }}
              className="font-display text-sm underline text-black"
            >
              Try again
            </button>
          </div>
        )}

        {step === 'result' && (
          <div className="max-w-xl">
            <div className="rounded-2xl p-6 sm:p-8 whitespace-pre-line text-black leading-relaxed bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              {report}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/services/chat"
                className="font-display font-semibold text-sm px-6 py-3.5 rounded-full bg-white text-black"
              >
                Fix this with Snobo Chat →
              </a>

              <a
                href="/services/sites"
                className="font-display font-semibold text-sm px-6 py-3.5 rounded-full border border-white text-white"
              >
                Rebuild my site
              </a>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}