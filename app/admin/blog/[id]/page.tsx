'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type BlogForm = {
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  author: string
  published: boolean
}

const EMPTY: BlogForm = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: 'Bhavik Soni',
  published: true,
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

export default function EditBlog() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const [form, setForm] = useState<BlogForm>(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    fetch(`${API_URL}/api/blog/admin/${id}`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }
        return res.json()
      })
      .then((data) => setForm(data.blog))
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false))
  }, [id, isNew, router])

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: isNew ? slugify(title) : f.slug, // auto-slug only for new posts
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = isNew ? `${API_URL}/api/blog` : `${API_URL}/api/blog/${id}`
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
      router.push('/admin/blog')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
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
      <a href="/admin/blog" className="text-sm text-grey-4 underline mb-6 inline-block">
        ← Back to Blog
      </a>
      <h1 className="font-display font-bold text-2xl mb-8">
        {isNew ? 'New Post' : `Edit ${form.title}`}
      </h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">URL slug</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className={inputClass}
          />
          <p className="text-xs text-grey-4 mt-1">Live at: /blog/{form.slug || '...'}</p>
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Excerpt (short summary for the list page)</label>
          <textarea
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className={inputClass + ' resize-none'}
          />
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Content</label>
          <textarea
            required
            rows={14}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className={inputClass + ' resize-y font-mono text-xs leading-relaxed'}
            placeholder="Write your post here. Separate paragraphs with a blank line."
          />
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Cover image URL (optional)</label>
          <input
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Author</label>
          <input
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-grey-4">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published (visible on site)
        </label>

        <button
          type="submit"
          disabled={saving}
          className="font-display font-semibold px-8 py-3.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving ? 'Saving...' : isNew ? 'Publish Post' : 'Save Changes'}
        </button>
      </form>
    </main>
  )
}