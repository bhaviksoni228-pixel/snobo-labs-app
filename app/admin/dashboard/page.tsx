'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Inquiry = {
  _id: string
  name: string
  email: string
  phone: string
  service: string
  description: string
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-white text-black',
  contacted: 'bg-grey-3 text-white',
  converted: 'bg-grey-5 text-black',
  closed: 'bg-grey-2 text-grey-4',
}

export default function AdminDashboard() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/inquiries`, {
      credentials: 'include', // sends the httpOnly cookie automatically
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }
        if (!res.ok) throw new Error('Failed to load leads')
        return res.json()
      })
      .then((data) => setInquiries(data.inquiries))
      .catch((err) => {
        if (err.message !== 'Not authenticated') setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [router])

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/api/inquiries/${id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status } : inq))
      )
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
      <h1 className="font-display font-bold text-2xl mb-2">Leads</h1>
      <p className="text-grey-4 text-sm mb-8">{inquiries.length} total inquiries</p>

      {error && <p className="text-red-400 mb-6">{error}</p>}

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div key={inq._id} className="border border-grey-2 rounded-xl p-5">
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <div className="font-display font-semibold">{inq.name}</div>
                <div className="text-sm text-grey-4">
                  {inq.email} · {inq.phone}
                </div>
              </div>
              <select
                value={inq.status}
                onChange={(e) => updateStatus(inq._id, e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-full border-none outline-none ${STATUS_COLORS[inq.status]}`}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-grey-4">Service:</span> {inq.service}
            </div>
            <p className="mt-2 text-sm text-grey-5">{inq.description}</p>
            <div className="mt-3 text-xs text-grey-4">
              {new Date(inq.createdAt).toLocaleString()}
            </div>
          </div>
        ))}

        {inquiries.length === 0 && (
          <p className="text-grey-4">No inquiries yet.</p>
        )}
      </div>
    </main>
  )
}