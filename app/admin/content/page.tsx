'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AdminContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [hero, setHero] = useState({ headline: '', subtext: '' })
  const [manifesto, setManifesto] = useState({ text: '' })
  const [footer, setFooter] = useState({ email: '', copyright: '' })

  useEffect(() => {
    fetch(`${API_URL}/api/content`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }
        return res.json()
      })
      .then((data) => {
        if (data.content.hero) setHero(data.content.hero)
        if (data.content.manifesto) setManifesto(data.content.manifesto)
        if (data.content.footer) setFooter(data.content.footer)
      })
      .catch((err) => {
        if (err.message !== 'Not authenticated') setError('Failed to load content')
      })
      .finally(() => setLoading(false))
  }, [router])

  async function save(key: string, data: any) {
    setSaving(key)
    setSuccess('')
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/content/${key}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) throw new Error('Save failed')
      setSuccess(`${key} saved`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(`Failed to save ${key}`)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  return (
    <main className="px-6 py-10">
      <h1 className="font-display font-bold text-2xl mb-2">Site Content</h1>
      <p className="text-grey-4 text-sm mb-8">Edit homepage text — changes go live immediately.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">{success}</p>}

      {/* Hero */}
      <div className="border border-grey-2 rounded-xl p-5 mb-6 max-w-xl space-y-4">
        <div className="font-display font-semibold">Hero Section</div>
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Headline</label>
          <input
            value={hero.headline}
            onChange={(e) => setHero({ ...hero, headline: e.target.value })}
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Subtext</label>
          <input
            value={hero.subtext}
            onChange={(e) => setHero({ ...hero, subtext: e.target.value })}
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>
        <button
          onClick={() => save('hero', hero)}
          disabled={saving === 'hero'}
          className="font-display font-semibold text-sm px-6 py-2.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving === 'hero' ? 'Saving...' : 'Save Hero'}
        </button>
      </div>

      {/* Manifesto */}
      <div className="border border-grey-2 rounded-xl p-5 mb-6 max-w-xl space-y-4">
        <div className="font-display font-semibold">Manifesto / About Text</div>
        <textarea
          rows={4}
          value={manifesto.text}
          onChange={(e) => setManifesto({ text: e.target.value })}
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white resize-none"
        />
        <button
          onClick={() => save('manifesto', manifesto)}
          disabled={saving === 'manifesto'}
          className="font-display font-semibold text-sm px-6 py-2.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving === 'manifesto' ? 'Saving...' : 'Save Manifesto'}
        </button>
      </div>

      {/* Footer */}
      <div className="border border-grey-2 rounded-xl p-5 mb-6 max-w-xl space-y-4">
        <div className="font-display font-semibold">Footer</div>
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Contact Email</label>
          <input
            value={footer.email}
            onChange={(e) => setFooter({ ...footer, email: e.target.value })}
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Copyright Text</label>
          <input
            value={footer.copyright}
            onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>
        <button
          onClick={() => save('footer', footer)}
          disabled={saving === 'footer'}
          className="font-display font-semibold text-sm px-6 py-2.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving === 'footer' ? 'Saving...' : 'Save Footer'}
        </button>
      </div>
    </main>
  )
}