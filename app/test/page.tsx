'use client'

import { useState } from 'react'

export default function TestPage() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  return (
    <main style={{ padding: '40px 20px', fontFamily: 'sans-serif', color: 'black', background: 'white', minHeight: '100vh' }}>
      <h1>React Test Page</h1>
      <p>If this works, JavaScript/React is running fine on your device.</p>

      <div style={{ marginTop: 30 }}>
        <p>Button click count: <b>{count}</b></p>
        <button
          onClick={() => setCount(count + 1)}
          style={{ padding: '12px 24px', fontSize: 16, background: 'black', color: 'white', border: 'none', borderRadius: 8 }}
        >
          Tap me
        </button>
      </div>

      <div style={{ marginTop: 30 }}>
        <p>Type here, it should appear below live:</p>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: 12, fontSize: 16, border: '1px solid gray', borderRadius: 8, width: '100%', maxWidth: 300 }}
        />
        <p style={{ marginTop: 10 }}>You typed: <b>{text || '(nothing yet)'}</b></p>
      </div>
    </main>
  )
}