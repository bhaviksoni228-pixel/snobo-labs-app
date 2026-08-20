{step === 'input' && (
  <div className="max-w-md flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
    <input
      ref={urlInputRef}
      type="text"
      inputMode="url"
      autoComplete="url"
      placeholder="yourwebsite.com"
      aria-label="Website URL"
      className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          const value = urlInputRef.current?.value?.trim() || ''

          if (value) {
            setUrl(value)
            setStep('email')
          }
        }
      }}
    />

    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault()

        const value = urlInputRef.current?.value?.trim() || ''

        if (!value) return

        setUrl(value)
        setStep('email')
      }}
      className="font-display font-semibold px-6 py-3.5 rounded-full bg-black text-white whitespace-nowrap cursor-pointer touch-manipulation"
    >
      Audit it →
    </button>
  </div>
)}