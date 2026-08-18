'use client'

import { useState, useRef, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Step = 'input' | 'email' | 'loading' | 'result' | 'error'

export default function AuditPage() {
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [report, setReport] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const urlInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  // Force a repaint whenever the step changes — works around a rendering glitch
  // on some Android browsers where React updates the DOM but doesn't visually repaint.
  useEffect(() => {
    document.body.style.transform = 'translateZ(0)'
    const frame = requestAnimationFrame(() => {
      document.body.style.transform = ''
    })
    window.scrollTo(window.scrollX, window.scrollY + 1)
    window.scrollTo(window.scrollX, window.scrollY - 1)
    return () => cancelAnimationFrame(frame)
  }, [step])

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = urlInputRef.current?.value || ''
    if (!value.trim()) return
    setUrl(value)
    setStep('email')
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = emailInputRef.current?.value || ''
    if (!value.trim()) return
    setEmail(value)
    setStep('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`${API_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email: value }),
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
            Paste your website URL. Snobo checks it and tells you exactly where you&apos;re likely losing customers — free, in under a minute.
          </p>
        </div>

        {step === 'input' && (
          <form
            onSubmit={handleUrlSubmit}
            className="max-w-md flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <input
              ref={urlInputRef}
              defaultValue=""
              placeholder="yourwebsite.com"
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-black placeholder:text-gray-400 focus:border-black outline-none"
            />
            <button
              type="submit"
              className="font-display font-semibold px-6 py-3.5 rounded-full bg-black text-white whitespace-nowrap"
            >
              Audit it →
            </button>
          </form>
        )}

        {step === 'email' && (
          <form
            onSubmit={handleEmailSubmit}
            className="max-w-md space-y-4 bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="text-sm text-gray-500">
              Checking: <span className="text-black font-semibold">{url}</span>
            </div>
            <input
              ref={emailInputRef}
              type="email"
              defaultValue=""
              placeholder="Where should we send your report?"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-black placeholder:text-gray-400 focus:border-black outline-none"
            />
            <button
              type="submit"
              className="font-display font-semibold px-6 py-3.5 rounded-full bg-black text-white"
            >
              Get my free audit →
            </button>
          </form>
        )}

        {step === 'loading' && (
          <div className="max-w-md py-10 px-6 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="text-black animate-pulse font-medium">Analyzing your site...</div>
          </div>
        )}

        {step === 'error' && (
          <div className="max-w-md space-y-4 bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <p className="text-red-600 text-sm font-medium">{errorMsg}</p>
            <button
              onClick={() => setStep('input')}
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