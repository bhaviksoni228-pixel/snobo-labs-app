'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display font-bold text-2xl mb-3">Something went wrong.</h1>
      <p className="text-grey-4 text-sm mb-6 max-w-sm">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={() => reset()}
        className="font-display font-semibold px-6 py-3 rounded-full bg-white text-black"
      >
        Try again
      </button>
    </main>
  )
}