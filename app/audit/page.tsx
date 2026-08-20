'use client'

import { useRef, useState } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Step = 'input' | 'email' | 'loading' | 'result' | 'error'

export default function AuditPage() {
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [report, setReport] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const urlInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  const goToEmail = () => {
    const input = urlInputRef.current

    if (!input) return

    const value = input.value.trim()

    if (!value) {
      input.focus()
      return
    }

    setUrl(value)
    setStep('email')

    setTimeout(() => {
      emailInputRef.current?.focus()
    }, 50)
  }

  const submitAudit = async () => {
    const email = emailInputRef.current?.value.trim() || ''

    if (!email) {
      emailInputRef.current?.focus()
      return
    }

    setStep('loading')
    setErrorMsg('')

    try {
      const response = await fetch(`${API_URL}/api/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message || 'Unable to complete the audit.'
        )
      }

      setReport(data?.report || '')
      setStep('result')
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      )

      setStep('error')
    }
  }

  return (
    <main className="relative min-h-screen bg-black">
      <Nav />

      <section className="min-h-screen px-[6vw] pb-24 pt-32">
        <div className="mb-8 max-w-lg">
          <div className="mb-4 font-display text-[11px] uppercase tracking-[0.28em] text-grey-4">
            Free Tool
          </div>

          <h1 className="mb-4 font-display text-[clamp(1.8rem,6vw,3.2rem)] font-bold leading-tight text-white">
            Find out what your website is costing you.
          </h1>

          <p className="text-grey-5">
            Paste your website URL. Snobo checks it and tells you exactly
            where you&apos;re likely losing customers — free, in under a
            minute.
          </p>
        </div>

        {step === 'input' && (
          <div className="relative z-[100] flex max-w-md flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:flex-row">
            <input
              ref={urlInputRef}
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="yourwebsite.com"
              aria-label="Website URL"
              className="relative z-[101] min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-black outline-none placeholder:text-gray-400 focus:border-black"
            />

            <button
              type="button"
              aria-label="Audit website"
              className="relative z-[102] cursor-pointer touch-manipulation select-none whitespace-nowrap rounded-full bg-black px-6 py-3.5 font-display font-semibold text-white"
              onClick={goToEmail}
              onTouchEnd={(event) => {
                event.preventDefault()
                goToEmail()
              }}
            >
              Audit it →
            </button>
          </div>
        )}

        {step === 'email' && (
          <div className="relative z-[100] max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="text-sm text-gray-500">
              Checking:{' '}
              <span className="break-all font-semibold text-black">
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
              className="relative z-[101] w-full rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-black outline-none placeholder:text-gray-400 focus:border-black"
            />

            <button
              type="button"
              aria-label="Get free audit"
              className="relative z-[102] cursor-pointer touch-manipulation rounded-full bg-black px-6 py-3.5 font-display font-semibold text-white"
              onClick={submitAudit}
              onTouchEnd={(event) => {
                event.preventDefault()
                submitAudit()
              }}
            >
              Get my free audit →
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="max-w-md rounded-2xl bg-white px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="animate-pulse font-medium text-black">
              Analyzing your site...
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <p className="text-sm font-medium text-red-600">
              {errorMsg}
            </p>

            <button
              type="button"
              onClick={() => {
                setErrorMsg('')
                setStep('input')
              }}
              className="font-display text-sm text-black underline"
            >
              Try again
            </button>
          </div>
        )}

        {step === 'result' && (
          <div className="max-w-xl">
            <div className="whitespace-pre-line rounded-2xl bg-white p-6 leading-relaxed text-black shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-8">
              {report}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/services/chat"
                className="rounded-full bg-white px-6 py-3.5 font-display text-sm font-semibold text-black"
              >
                Fix this with Snobo Chat →
              </a>

              <a
                href="/services/sites"
                className="rounded-full border border-white px-6 py-3.5 font-display text-sm font-semibold text-white"
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