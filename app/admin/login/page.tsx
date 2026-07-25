'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      if (data.user.role !== 'admin') {
        throw new Error('This account does not have admin access')
      }

      localStorage.setItem('snobo_token', data.token)
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <h1 className="font-display font-bold text-2xl mb-6">Snobo Labs Admin</h1>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-3 text-white focus:border-white outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-3 text-white focus:border-white outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full font-display font-semibold px-8 py-3.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </main>
  )
}
