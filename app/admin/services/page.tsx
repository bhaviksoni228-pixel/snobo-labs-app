'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Service = {
  _id: string
  slug: string
  name: string
  hook: string
  published: boolean
  order: number
}

export default function AdminServicesList() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    fetch(`${API_URL}/api/services/admin/all`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }
        return res.json()
      })
      .then((data) => setServices(data.services))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [router])

  async function handleDelete(id: string) {
    if (!confirm('Delete this service? This removes it from the live site.')) return
    await fetch(`${API_URL}/api/services/${id}`, {
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
        <h1 className="font-display font-bold text-2xl">Services</h1>
        <a
          href="/admin/services/new"
          className="font-display font-semibold text-sm px-5 py-2.5 rounded-full bg-white text-black"
        >
          + New Service
        </a>
      </div>
      <p className="text-grey-4 text-sm mb-8">
        Edit pricing, features, and FAQs for each service — changes go live immediately.
      </p>

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s._id} className="border border-grey-2 rounded-xl p-5 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold">{s.name}</span>
                <span className="text-xs text-grey-4">/{s.slug}</span>
                {!s.published && (
                  <span className="text-[10px] uppercase tracking-wide text-grey-4 border border-grey-2 rounded-full px-2 py-0.5">
                    Hidden
                  </span>
                )}
              </div>
              <p className="text-sm text-grey-4 mt-1">{s.hook}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a href={`/admin/services/${s._id}`} className="text-sm text-grey-5 underline">
                Edit
              </a>
              <button onClick={() => handleDelete(s._id)} className="text-sm text-red-400 underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-grey-4">No services yet.</p>}
      </div>
    </main>
  )
}