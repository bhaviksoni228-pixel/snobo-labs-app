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
    const token = localStorage.getItem('snobo_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetch(`${API_URL}/api/inquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load leads')
        return res.json()
      })
      .then((data) => setInquiries(data.inquiries))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [router])

  async function updateStatus(id: string, status: string) {
    const token = localStorage.getItem('snobo_token')
    const res = await fetch(`${API_URL}/api/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
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
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="flex justify-between items-center mb-2">
        <h1 className="font-display font-bold text-2xl">Leads</h1>
        <a href="/admin/portfolio" className="text-sm text-grey-4 underline">
          Manage Portfolio →
        </a>
      </div>
      <div className="mb-6">
        <a href="/admin/conversations" className="text-sm text-grey-4 underline">
          View Snobo Conversations →
        </a>
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
