'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlobBackground from '@/components/BlobBackground'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Step = 'input' | 'email' | 'loading' | 'result' | 'error'

export default function AuditPage() {
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [report, setReport] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setStep('email')
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`${API_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Something went wrong')
      setReport(data.report)
      setStep('result')
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setStep('error')
    }
  }

  return (
    <main>
      <BlobBackground />
      <Nav />

      <section className="relative z-5 px-[6vw] pt-32 pb-24 min-h-screen">
        <div className="font-display text-[11px] tracking-[0.28em] uppercase text-grey-4 mb-4">
          Free Tool
        </div>
        <h1 className="font-display font-bold text-[clamp(1.8rem,6vw,3.2rem)] max-w-2xl leading-tight mb-4">
          Find out what your website is costing you.
        </h1>
        <p className="text-grey-5 max-w-lg mb-10">
          Paste your website URL. Snobo checks it and tells you exactly where you&apos;re likely losing customers — free, in under a minute.
        </p>

        {step === 'input' && (
          <form onSubmit={handleUrlSubmit} className="max-w-md flex flex-col sm:flex-row gap-3">
            <input
              required
              placeholder="yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent border border-grey-2 rounded-lg px-4 py-3.5 text-white focus:border-white outline-none transition-colors"
            />
            <button
              type="submit"
              className="font-display font-semibold px-6 py-3.5 rounded-full bg-white text-black whitespace-nowrap"
            >
              Audit it →
            </button>
          </form>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="max-w-md space-y-4">
            <div className="text-sm text-grey-4 mb-2">
              Checking: <span className="text-white">{url}</span>
            </div>
            <input
              required
              type="email"
              placeholder="Where should we send your report?"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-3.5 text-white focus:border-white outline-none transition-colors"
            />
            <button
              type="submit"
              className="font-display font-semibold px-6 py-3.5 rounded-full bg-white text-black"
            >
              Get my free audit →
            </button>
          </form>
        )}

        {step === 'loading' && (
          <div className="max-w-md py-10">
            <div className="text-grey-5 animate-pulse">Analyzing your site...</div>
          </div>
        )}

        {step === 'error' && (
          <div className="max-w-md space-y-4">
            <p className="text-red-400 text-sm">{errorMsg}</p>
            <button
              onClick={() => setStep('input')}
              className="font-display text-sm underline text-grey-4"
            >
              Try again
            </button>
          </div>
        )}

        {step === 'result' && (
          <div className="max-w-xl">
            <div className="border border-grey-2 rounded-2xl p-6 sm:p-8 whitespace-pre-line text-grey-5 leading-relaxed">
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
