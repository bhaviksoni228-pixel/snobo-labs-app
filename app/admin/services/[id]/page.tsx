'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type PricingTier = {
  name: string
  price: string
  priceNote: string
  description: string
  checks: string[]
  popular: boolean
}

type FaqItem = { q: string; a: string }

type ServiceForm = {
  slug: string
  name: string
  hook: string
  description: string
  features: string[]
  howItWorks: string[]
  pricing: PricingTier[]
  faq: FaqItem[]
  order: number
  published: boolean
}

const EMPTY_SERVICE: ServiceForm = {
  slug: '',
  name: '',
  hook: '',
  description: '',
  features: [''],
  howItWorks: [''],
  pricing: [{ name: '', price: '', priceNote: '', description: '', checks: [''], popular: false }],
  faq: [{ q: '', a: '' }],
  order: 0,
  published: true,
}

export default function EditService() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const [form, setForm] = useState<ServiceForm>(EMPTY_SERVICE)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    fetch(`${API_URL}/api/services/admin/${id}`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }
        return res.json()
      })
      .then((data) => setForm(data.service))
      .catch(() => setError('Failed to load service'))
      .finally(() => setLoading(false))
  }, [id, isNew, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = isNew ? `${API_URL}/api/services` : `${API_URL}/api/services/${id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Save failed')
      router.push('/admin/services')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // --- list helpers (features / howItWorks) ---
  function updateListItem(field: 'features' | 'howItWorks', i: number, value: string) {
    const list = [...form[field]]
    list[i] = value
    setForm({ ...form, [field]: list })
  }
  function addListItem(field: 'features' | 'howItWorks') {
    setForm({ ...form, [field]: [...form[field], ''] })
  }
  function removeListItem(field: 'features' | 'howItWorks', i: number) {
    setForm({ ...form, [field]: form[field].filter((_, idx) => idx !== i) })
  }

  // --- pricing helpers ---
  function updateTier(i: number, key: keyof PricingTier, value: any) {
    const tiers = [...form.pricing]
    tiers[i] = { ...tiers[i], [key]: value }
    setForm({ ...form, pricing: tiers })
  }
  function updateTierCheck(tierIdx: number, checkIdx: number, value: string) {
    const tiers = [...form.pricing]
    const checks = [...tiers[tierIdx].checks]
    checks[checkIdx] = value
    tiers[tierIdx] = { ...tiers[tierIdx], checks }
    setForm({ ...form, pricing: tiers })
  }
  function addTierCheck(tierIdx: number) {
    const tiers = [...form.pricing]
    tiers[tierIdx] = { ...tiers[tierIdx], checks: [...tiers[tierIdx].checks, ''] }
    setForm({ ...form, pricing: tiers })
  }
  function addTier() {
    setForm({
      ...form,
      pricing: [...form.pricing, { name: '', price: '', priceNote: '', description: '', checks: [''], popular: false }],
    })
  }
  function removeTier(i: number) {
    setForm({ ...form, pricing: form.pricing.filter((_, idx) => idx !== i) })
  }

  // --- faq helpers ---
  function updateFaq(i: number, key: keyof FaqItem, value: string) {
    const faqs = [...form.faq]
    faqs[i] = { ...faqs[i], [key]: value }
    setForm({ ...form, faq: faqs })
  }
  function addFaq() {
    setForm({ ...form, faq: [...form.faq, { q: '', a: '' }] })
  }
  function removeFaq(i: number) {
    setForm({ ...form, faq: form.faq.filter((_, idx) => idx !== i) })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  const inputClass =
    'w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white'

  return (
    <main className="px-6 py-10">
      <a href="/admin/services" className="text-sm text-grey-4 underline mb-6 inline-block">
        ← Back to Services
      </a>
      <h1 className="font-display font-bold text-2xl mb-8">
        {isNew ? 'New Service' : `Edit ${form.name}`}
      </h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Basics */}
        <div className="space-y-3">
          <div className="font-display font-semibold text-sm text-grey-4 uppercase tracking-wide">Basics</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Slug (e.g. sites)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
            <input required placeholder="Name (e.g. Snobo Sites)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <input required placeholder="Hook (short headline)" value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} className={inputClass} />
          <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + ' resize-none'} />
          <div className="flex items-center gap-4">
            <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass + ' w-24'} />
            <label className="flex items-center gap-2 text-sm text-grey-4">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published
            </label>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <div className="font-display font-semibold text-sm text-grey-4 uppercase tracking-wide">Features</div>
          {form.features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input value={f} onChange={(e) => updateListItem('features', i, e.target.value)} className={inputClass} />
              <button type="button" onClick={() => removeListItem('features', i)} className="text-red-400 text-sm px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => addListItem('features')} className="text-sm text-grey-5 underline">+ Add feature</button>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <div className="font-display font-semibold text-sm text-grey-4 uppercase tracking-wide">How It Works (steps)</div>
          {form.howItWorks.map((step, i) => (
            <div key={i} className="flex gap-2">
              <input value={step} onChange={(e) => updateListItem('howItWorks', i, e.target.value)} className={inputClass} />
              <button type="button" onClick={() => removeListItem('howItWorks', i)} className="text-red-400 text-sm px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => addListItem('howItWorks')} className="text-sm text-grey-5 underline">+ Add step</button>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <div className="font-display font-semibold text-sm text-grey-4 uppercase tracking-wide">Pricing Tiers</div>
          {form.pricing.map((tier, tierIdx) => (
            <div key={tierIdx} className="border border-grey-2 rounded-xl p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input placeholder="Tier name" value={tier.name} onChange={(e) => updateTier(tierIdx, 'name', e.target.value)} className={inputClass} />
                <input placeholder="Price (e.g. ₹4,999)" value={tier.price} onChange={(e) => updateTier(tierIdx, 'price', e.target.value)} className={inputClass} />
              </div>
              <input placeholder="Price note (e.g. one-time)" value={tier.priceNote} onChange={(e) => updateTier(tierIdx, 'priceNote', e.target.value)} className={inputClass} />
              <input placeholder="Description" value={tier.description} onChange={(e) => updateTier(tierIdx, 'description', e.target.value)} className={inputClass} />

              <div className="space-y-2">
                <div className="text-xs text-grey-4">Checkmark features</div>
                {tier.checks.map((c, checkIdx) => (
                  <input
                    key={checkIdx}
                    placeholder="e.g. Mobile responsive"
                    value={c}
                    onChange={(e) => updateTierCheck(tierIdx, checkIdx, e.target.value)}
                    className={inputClass}
                  />
                ))}
                <button type="button" onClick={() => addTierCheck(tierIdx)} className="text-xs text-grey-5 underline">+ Add checkmark</button>
              </div>

              <label className="flex items-center gap-2 text-sm text-grey-4">
                <input type="checkbox" checked={tier.popular} onChange={(e) => updateTier(tierIdx, 'popular', e.target.checked)} />
                Mark as "Most Popular"
              </label>

              <button type="button" onClick={() => removeTier(tierIdx)} className="text-sm text-red-400 underline">
                Remove this tier
              </button>
            </div>
          ))}
          <button type="button" onClick={addTier} className="text-sm text-grey-5 underline">+ Add pricing tier</button>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <div className="font-display font-semibold text-sm text-grey-4 uppercase tracking-wide">FAQ</div>
          {form.faq.map((item, i) => (
            <div key={i} className="border border-grey-2 rounded-xl p-4 space-y-2">
              <input placeholder="Question" value={item.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} className={inputClass} />
              <textarea placeholder="Answer" rows={2} value={item.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} className={inputClass + ' resize-none'} />
              <button type="button" onClick={() => removeFaq(i)} className="text-sm text-red-400 underline">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addFaq} className="text-sm text-grey-5 underline">+ Add FAQ item</button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="font-display font-semibold px-8 py-3.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving ? 'Saving...' : isNew ? 'Create Service' : 'Save Changes'}
        </button>
      </form>
    </main>
  )
}