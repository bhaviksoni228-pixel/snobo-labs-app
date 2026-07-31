'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type PortfolioItem = {
  _id: string
  title: string
  description: string
  tag: string
  link: string
  imageUrl: string
  published: boolean
  order: number
}

const EMPTY_FORM = { title: '', description: '', tag: 'Demo', link: '', imageUrl: '', published: true, order: 0 }

export default function AdminPortfolio() {
  const router = useRouter()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function loadItems() {
    fetch(`${API_URL}/api/portfolio/all`, {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }
        if (!res.ok) throw new Error('Failed to load portfolio items')
        return res.json()
      })
      .then((data) => setItems(data.items))
      .catch((err) => {
        if (err.message !== 'Not authenticated') setError(err.message)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEdit(item: PortfolioItem) {
    setEditingId(item._id)
    setForm({
      title: item.title,
      description: item.description,
      tag: item.tag,
      link: item.link,
      imageUrl: item.imageUrl,
      published: item.published,
      order: item.order,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const url = editingId
      ? `${API_URL}/api/portfolio/${editingId}`
      : `${API_URL}/api/portfolio`
    const method = editingId ? 'PATCH' : 'POST'

    try {
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
      if (!res.ok) throw new Error('Failed to save')
      cancelEdit()
      loadItems()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this portfolio item?')) return
    const res = await fetch(`${API_URL}/api/portfolio/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    loadItems()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="font-display font-bold text-2xl mb-2">Portfolio</h1>
      <div className="flex gap-4 mb-2">
        <a href="/admin/dashboard" className="text-sm text-grey-4 underline">
          ← Back to Leads
        </a>
        <a href="/admin/conversations" className="text-sm text-grey-4 underline">
          View Conversations →
        </a>
      </div>
      <p className="text-grey-4 text-sm mb-8 mt-2">Manage demo pieces and case studies shown on the site.</p>

      {error && <p className="text-red-400 mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="border border-grey-2 rounded-xl p-5 mb-10 space-y-4 max-w-lg">
        <div className="font-display font-semibold text-sm">
          {editingId ? 'Edit item' : 'Add new item'}
        </div>

        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
        />
        <textarea
          required
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white resize-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.tag}
            onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
            className="bg-black border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none"
          >
            <option value="Demo">Demo</option>
            <option value="Client Work">Client Work</option>
          </select>
          <input
            placeholder="Link (optional)"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            className="bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>
        <input
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
        />
        <label className="flex items-center gap-2 text-sm text-grey-4">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Published (visible on site)
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="font-display font-semibold text-sm px-6 py-2.5 rounded-full bg-white text-black disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingId ? 'Update' : 'Add item'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="font-display text-sm px-6 py-2.5 rounded-full border border-grey-2 text-grey-4"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="border border-grey-2 rounded-xl p-5 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold">{item.title}</span>
                <span className="text-[10px] uppercase tracking-wide text-grey-4 border border-grey-2 rounded-full px-2 py-0.5">
                  {item.tag}
                </span>
                {!item.published && (
                  <span className="text-[10px] uppercase tracking-wide text-grey-4">Hidden</span>
                )}
              </div>
              <p className="text-sm text-grey-4 mt-1.5">{item.description}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => startEdit(item)} className="text-sm text-grey-5 underline">
                Edit
              </button>
              <button onClick={() => handleDelete(item._id)} className="text-sm text-red-400 underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-grey-4">No portfolio items yet.</p>}
      </div>
    </main>
  )
}