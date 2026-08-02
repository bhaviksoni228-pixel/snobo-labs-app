'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Blog = {
  _id: string
  slug: string
  title: string
  published: boolean
  publishedAt: string
}

export default function AdminBlogList() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    fetch(`${API_URL}/api/blog/admin/all`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }
        return res.json()
      })
      .then((data) => setBlogs(data.blogs))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [router])

  async function handleDelete(id: string) {
    if (!confirm('Delete this blog post?')) return
    await fetch(`${API_URL}/api/blog/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    load()
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
      <div className="flex justify-between items-center mb-2">
        <h1 className="font-display font-bold text-2xl">Blog</h1>
        <a
          href="/admin/blog/new"
          className="font-display font-semibold text-sm px-5 py-2.5 rounded-full bg-white text-black"
        >
          + New Post
        </a>
      </div>
      <p className="text-grey-4 text-sm mb-8">Write and manage blog posts — changes go live immediately.</p>

      <div className="space-y-3">
        {blogs.map((b) => (
          <div key={b._id} className="border border-grey-2 rounded-xl p-5 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold">{b.title}</span>
                {!b.published && (
                  <span className="text-[10px] uppercase tracking-wide text-grey-4 border border-grey-2 rounded-full px-2 py-0.5">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-xs text-grey-4 mt-1">
                /{b.slug} · {new Date(b.publishedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a href={`/admin/blog/${b._id}`} className="text-sm text-grey-5 underline">
                Edit
              </a>
              <button onClick={() => handleDelete(b._id)} className="text-sm text-red-400 underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && <p className="text-grey-4">No blog posts yet.</p>}
      </div>
    </main>
  )
}