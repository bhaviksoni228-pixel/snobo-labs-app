'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Message = { role: 'user' | 'assistant'; content: string }
type Conversation = {
  _id: string
  sessionId: string
  messages: Message[]
  updatedAt: string
}

export default function AdminConversations() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/chat`, {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }
        if (!res.ok) throw new Error('Failed to load conversations')
        return res.json()
      })
      .then((data) => {
        setConversations(data.conversations)
        if (data.conversations.length > 0) setSelected(data.conversations[0])
      })
      .catch((err) => {
        if (err.message !== 'Not authenticated') setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  return (
    <main className="px-6 py-10">
      <h1 className="font-display font-bold text-2xl mb-2">Conversations</h1>
      <p className="text-grey-4 text-sm mb-8">{conversations.length} Snobo chat sessions logged</p>

      {error && <p className="text-red-400 mb-6">{error}</p>}

      {conversations.length === 0 ? (
        <p className="text-grey-4">No conversations yet.</p>
      ) : (
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          {/* Session list */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {conversations.map((c) => {
              const lastUserMsg = [...c.messages].reverse().find((m) => m.role === 'user')
              return (
                <button
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${
                    selected?._id === c._id
                      ? 'border-white bg-white/[0.04]'
                      : 'border-grey-2'
                  }`}
                >
                  <div className="text-xs text-grey-4 mb-1">
                    {new Date(c.updatedAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-grey-5 truncate">
                    {lastUserMsg?.content || 'No messages'}
                  </div>
                  <div className="text-[11px] text-grey-4 mt-1">
                    {c.messages.length} messages
                  </div>
                </button>
              )
            })}
          </div>

          {/* Transcript */}
          <div className="border border-grey-2 rounded-xl p-5 max-h-[70vh] overflow-y-auto">
            {selected ? (
              <div className="space-y-3">
                {selected.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl ${
                        m.role === 'user'
                          ? 'bg-white text-black rounded-br-sm'
                          : 'bg-grey-1 text-grey-5 border border-grey-2 rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-grey-4">Select a conversation to view it.</p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}