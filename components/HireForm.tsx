'use client'

import { useState } from 'react'
import type { PricingTier } from '@/lib/services-data'

const SERVICES = [
  { value: 'sites', label: 'Snobo Sites' },
  { value: 'chat', label: 'Snobo Chat' },
  { value: 'crm', label: 'Snobo CRM' },
  { value: 'bots', label: 'Snobo Bots' },
  { value: 'build', label: 'Snobo Build' },
  { value: 'not-sure', label: 'Not sure yet' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function HireForm({
  lockedService,
  lockedServiceName,
  pricingTiers,
}: {
  lockedService?: string
  lockedServiceName?: string
  pricingTiers?: PricingTier[]
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: lockedService || '',
    package: '',
    description: '',
    timeline: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('snobo_token') : null
      const res = await fetch(`${API_URL}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Something went wrong')
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-16">
        <div className="text-2xl font-display font-bold mb-3">Request received.</div>
        <p className="text-grey-4">
          We&apos;ll get back to you within a few hours to confirm details and next steps
          (payment is handled separately once confirmed).
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {lockedService && (
        <div className="inline-block text-xs tracking-wide uppercase text-grey-4 border border-grey-2 rounded-full px-3 py-1.5">
          Enquiring about: {lockedServiceName || SERVICES.find((s) => s.value === lockedService)?.label}
        </div>
      )}

      <div>
        <label className="block text-sm text-grey-4 mb-1.5">Name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-grey-4 mb-1.5">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-grey-4 mb-1.5">Phone / WhatsApp *</label>
        <input
          required
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors"
        />
      </div>

      {!lockedService && (
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Service *</label>
          <select
            required
            value={form.service}
            onChange={(e) => update('service', e.target.value)}
            className="w-full bg-black border border-grey-2 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors"
          >
            <option value="">Select a service</option>
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {pricingTiers && pricingTiers.length > 0 && (
        <div>
          <label className="block text-sm text-grey-4 mb-2">Which package? *</label>
          <div className="space-y-2.5">
            {pricingTiers.map((tier) => (
              <label
                key={tier.name}
                className={`flex items-start justify-between gap-3 border rounded-lg px-4 py-3.5 cursor-pointer transition-colors ${
                  form.package === tier.name
                    ? 'border-white bg-white/[0.04]'
                    : 'border-grey-2'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="package"
                    required
                    checked={form.package === tier.name}
                    onChange={() => update('package', tier.name)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-display font-semibold text-sm">{tier.name}</div>
                    <div className="text-xs text-grey-4 mt-0.5">{tier.description}</div>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="font-display font-bold text-sm">{tier.price}</div>
                  {tier.priceNote && (
                    <div className="text-[11px] text-grey-4">{tier.priceNote}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-grey-4 mb-1.5">What do you need? *</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors resize-none"
          placeholder="Tell us about your business and what you're looking for..."
        />
      </div>

      <div>
        <label className="block text-sm text-grey-4 mb-1.5">Timeline</label>
        <select
          value={form.timeline}
          onChange={(e) => update('timeline', e.target.value)}
          className="w-full bg-black border border-grey-2 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors"
        >
          <option value="">Select (optional)</option>
          <option value="asap">ASAP</option>
          <option value="within-month">Within a month</option>
          <option value="exploring">Just exploring</option>
        </select>
      </div>

      <p className="text-xs text-grey-4">
        This confirms your requirements and chosen package — payment is arranged separately once we connect.
      </p>

      {status === 'error' && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="font-display font-semibold px-8 py-4 rounded-full bg-white text-black disabled:opacity-50 transition-opacity"
      >
        {status === 'sending' ? 'Sending...' : 'Submit Request'}
      </button>
    </form>
  )
}
