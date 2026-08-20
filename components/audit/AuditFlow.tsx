'use client'

import { useState } from 'react'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Step = 'url' | 'email' | 'loading' | 'result' | 'error'

interface AuditResponse {
  report?: string
  result?: string
  signals?: Record<string, unknown>
  message?: string
  error?: string
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value)

    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    )
  } catch {
    return false
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function AuditFlow() {
  const [step, setStep] = useState<Step>('url')

  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')

  const [report, setReport] = useState('')
  const [error, setError] = useState('')

  const [submitting, setSubmitting] = useState(false)

  /*
   * STEP 1
   * Validate and continue from URL → Email.
   */
  function handleUrlContinue() {
    const normalized = normalizeUrl(url)

    if (!normalized) {
      setError('Please enter your website URL.')
      return
    }

    if (!isValidUrl(normalized)) {
      setError('Please enter a valid website URL.')
      return
    }

    setError('')
    setUrl(normalized)
    setStep('email')
  }

  /*
   * Allow Enter key to continue from URL input.
   */
  function handleUrlKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    handleUrlContinue()
  }

  /*
   * STEP 2
   * Submit the existing Snobo audit API.
   */
  async function handleAudit() {
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!url) {
      setStep('url')
      return
    }

    setError('')
    setSubmitting(true)
    setStep('loading')

    try {
      const response = await fetch(`${API_URL}/api/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          email: cleanEmail,
        }),
      })

      let data: AuditResponse = {}

      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            'We could not complete the audit.'
        )
      }

      const generatedReport =
        data.report ||
        data.result ||
        'Your audit has been completed successfully.'

      setReport(generatedReport)
      setStep('result')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'

      setError(message)
      setStep('error')
    } finally {
      setSubmitting(false)
    }
  }

  /*
   * Allow Enter key to submit email.
   */
  function handleEmailKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    handleAudit()
  }

  /*
   * Completely reset the Audit flow.
   */
  function startOver() {
    setUrl('')
    setEmail('')
    setReport('')
    setError('')
    setSubmitting(false)
    setStep('url')
  }

  /*
   * Retry from the email step.
   */
  function retry() {
    setError('')
    setStep('email')
  }

  return (
    <div className="w-full max-w-md">
      {/* =====================================================
          STEP 1 — WEBSITE URL
          ===================================================== */}

      {step === 'url' && (
        <div className="rounded-2xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={url}
              onChange={(event) => {
                setUrl(event.target.value)

                if (error) {
                  setError('')
                }
              }}
              onKeyDown={handleUrlKeyDown}
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="yourwebsite.com"
              aria-label="Website URL"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-black outline-none placeholder:text-gray-400 focus:border-black"
            />

            <button
              type="button"
              onClick={handleUrlContinue}
              disabled={!url.trim()}
              className="touch-manipulation cursor-pointer whitespace-nowrap rounded-full bg-black px-6 py-3.5 font-display font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Audit it →
            </button>
          </div>

          {error && (
            <p
              className="mt-3 text-sm font-medium text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      )}

      {/* =====================================================
          STEP 2 — EMAIL
          ===================================================== */}

      {step === 'email' && (
        <div className="rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="mb-5">
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
              Website
            </p>

            <p className="break-all font-semibold text-black">
              {url}
            </p>
          </div>

          <input
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)

              if (error) {
                setError('')
              }
            }}
            onKeyDown={handleEmailKeyDown}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Where should we send your report?"
            aria-label="Email address"
            className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-black outline-none placeholder:text-gray-400 focus:border-black"
          />

          <button
            type="button"
            onClick={handleAudit}
            disabled={!email.trim() || submitting}
            className="w-full touch-manipulation cursor-pointer rounded-full bg-black px-6 py-3.5 font-display font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? 'Analyzing…'
              : 'Get my free audit →'}
          </button>

          {error && (
            <p
              className="mt-3 text-sm font-medium text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setError('')
              setStep('url')
            }}
            className="mt-4 text-sm text-gray-500 underline"
          >
            ← Change website
          </button>
        </div>
      )}

      {/* =====================================================
          STEP 3 — LOADING
          ===================================================== */}

      {step === 'loading' && (
        <div className="rounded-2xl bg-white px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="text-black">
            <div className="mb-3 font-display font-semibold">
              Analyzing your website…
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-black" />
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Checking your website. This may take a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          STEP 4 — ERROR
          ===================================================== */}

      {step === 'error' && (
        <div className="rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="mb-4">
            <p className="mb-2 font-display font-semibold text-black">
              We couldn&apos;t complete the audit.
            </p>

            <p className="text-sm leading-relaxed text-red-600">
              {error}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-black px-5 py-3 font-display text-sm font-semibold text-white"
            >
              Try again
            </button>

            <button
              type="button"
              onClick={startOver}
              className="rounded-full border border-gray-300 px-5 py-3 font-display text-sm font-semibold text-black"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          STEP 5 — RESULT
          ===================================================== */}

      {step === 'result' && (
        <div>
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

            <button
              type="button"
              onClick={startOver}
              className="rounded-full border border-white/30 px-6 py-3.5 font-display text-sm font-semibold text-white"
            >
              Audit another site
            </button>
          </div>
        </div>
      )}
    </div>
  )
}