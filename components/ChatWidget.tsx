'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Msg = { role: 'user' | 'assistant'; content: string }

const GREETING: Msg = {
  role: 'assistant',
  content: "Hey, I'm Snobo 👋 Ask me anything about our services, pricing, or where to find something on the site.",
}

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('snobo_session')
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now()
    localStorage.setItem('snobo_session', id)
  }
  return id
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const nextMessages = [...messages, { role: 'user' as const, content: text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          sessionId: getSessionId(),
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Try again in a moment." },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Snobo"
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
      >
        {open ? (
          <span className="text-black text-xl font-display">✕</span>
        ) : (
          <Image src="/symbol.png" alt="Chat with Snobo" width={30} height={30} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[90vw] max-w-[360px] h-[70vh] max-h-[520px] bg-black border border-grey-2 rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-grey-2">
            <Image src="/symbol.png" alt="" width={22} height={22} className="invert" />
            <div>
              <div className="font-display font-semibold text-sm">Snobo</div>
              <div className="text-[11px] text-grey-4">Usually replies instantly</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-white text-black rounded-br-sm'
                      : 'bg-grey-1 text-grey-5 border border-grey-2 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-grey-1 border border-grey-2 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-grey-4">
                  ...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-grey-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Snobo anything..."
              className="flex-1 bg-transparent text-sm px-3 py-2.5 outline-none text-white placeholder:text-grey-4"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  )
}
