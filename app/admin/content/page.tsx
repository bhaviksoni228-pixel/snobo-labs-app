'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Branding = {
  logoUrl: string
}

export default function AdminContent() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [hero, setHero] = useState({
    headline: '',
    subtext: '',
  })

  const [manifesto, setManifesto] = useState({
    text: '',
  })

  const [footer, setFooter] = useState({
    email: '',
    copyright: '',
  })

  const [branding, setBranding] = useState<Branding>({
    logoUrl: '',
  })

  useEffect(() => {
    fetch(`${API_URL}/api/content`, {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }

        return res.json()
      })
      .then((data) => {
        if (data.content?.hero) {
          setHero(data.content.hero)
        }

        if (data.content?.manifesto) {
          setManifesto(data.content.manifesto)
        }

        if (data.content?.footer) {
          setFooter(data.content.footer)
        }

        if (data.content?.branding) {
          setBranding({
            logoUrl: data.content.branding.logoUrl || '',
          })
        }
      })
      .catch((err) => {
        if (err.message !== 'Not authenticated') {
          setError('Failed to load content')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  async function save(key: string, data: any) {
    setSaving(key)
    setSuccess('')
    setError('')

    try {
      const res = await fetch(`${API_URL}/api/content/${key}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })

      if (res.status === 401) {
        router.push('/admin/login')
        return
      }

      if (!res.ok) {
        throw new Error('Save failed')
      }

      setSuccess(`${key} saved successfully`)

      setTimeout(() => {
        setSuccess('')
      }, 2500)
    } catch {
      setError(`Failed to save ${key}`)
    } finally {
      setSaving(null)
    }
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true)
    setError('')
    setSuccess('')

    try {
      const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

      const uploadPreset =
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) {
        throw new Error(
          'Cloudinary is not configured. Add the required Vercel environment variables.'
        )
      }

      const formData = new FormData()

      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Image upload failed')
      }

      const result = await response.json()

      if (!result.secure_url) {
        throw new Error('Cloudinary did not return an image URL')
      }

      const logoUrl = result.secure_url

      setBranding({
        logoUrl,
      })

      await save('branding', {
        logoUrl,
      })

      setSuccess('Logo uploaded and saved successfully')
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to upload logo'
      )
    } finally {
      setUploadingLogo(false)
    }
  }

  function handleLogoSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Please upload PNG, JPG, WEBP, or SVG.'
      )

      event.target.value = ''
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setError(
        'Logo must be smaller than 5 MB.'
      )

      event.target.value = ''
      return
    }

    uploadLogo(file)

    event.target.value = ''
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
      <h1 className="font-display font-bold text-2xl mb-2">
        Site Content
      </h1>

      <p className="text-grey-4 text-sm mb-8">
        Edit your website content and branding.
      </p>

      {error && (
        <div className="max-w-xl mb-4 border border-red-500/30 bg-red-500/10 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="max-w-xl mb-4 border border-green-500/30 bg-green-500/10 text-green-300 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* BRANDING */}
      <div className="border border-grey-2 rounded-xl p-5 mb-6 max-w-xl space-y-5">
        <div>
          <div className="font-display font-semibold text-lg">
            Branding
          </div>

          <p className="text-grey-4 text-sm mt-1">
            Change your Snobo Labs logo directly from the admin panel.
          </p>
        </div>

        {/* Current logo */}
        <div>
          <label className="block text-sm text-grey-4 mb-2">
            Current Logo
          </label>

          <div className="w-32 h-32 rounded-xl border border-grey-2 bg-black flex items-center justify-center overflow-hidden">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt="Current Snobo Labs logo"
                className="max-w-full max-h-full object-contain p-3"
              />
            ) : (
              <span className="text-grey-5 text-xs">
                No logo
              </span>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleLogoSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingLogo}
          className="font-display font-semibold text-sm px-6 py-3 rounded-full bg-white text-black disabled:opacity-50"
        >
          {uploadingLogo
            ? 'Uploading...'
            : 'Choose Logo From Gallery'}
        </button>

        <p className="text-xs text-grey-5">
          PNG, JPG, WEBP or SVG • Maximum 5 MB
        </p>

        {branding.logoUrl && (
          <div className="text-xs text-grey-5 break-all">
            Current URL:
            <br />
            {branding.logoUrl}
          </div>
        )}
      </div>

      {/* HERO */}
      <div className="border border-grey-2 rounded-xl p-5 mb-6 max-w-xl space-y-4">
        <div className="font-display font-semibold">
          Hero Section
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            Headline
          </label>

          <input
            value={hero.headline}
            onChange={(e) =>
              setHero({
                ...hero,
                headline: e.target.value,
              })
            }
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            Subtext
          </label>

          <input
            value={hero.subtext}
            onChange={(e) =>
              setHero({
                ...hero,
                subtext: e.target.value,
              })
            }
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>

        <button
          onClick={() => save('hero', hero)}
          disabled={saving === 'hero'}
          className="font-display font-semibold text-sm px-6 py-2.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving === 'hero'
            ? 'Saving...'
            : 'Save Hero'}
        </button>
      </div>

      {/* MANIFESTO */}
      <div className="border border-grey-2 rounded-xl p-5 mb-6 max-w-xl space-y-4">
        <div className="font-display font-semibold">
          Manifesto / About Text
        </div>

        <textarea
          rows={4}
          value={manifesto.text}
          onChange={(e) =>
            setManifesto({
              text: e.target.value,
            })
          }
          className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white resize-none"
        />

        <button
          onClick={() =>
            save('manifesto', manifesto)
          }
          disabled={saving === 'manifesto'}
          className="font-display font-semibold text-sm px-6 py-2.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving === 'manifesto'
            ? 'Saving...'
            : 'Save Manifesto'}
        </button>
      </div>

      {/* FOOTER */}
      <div className="border border-grey-2 rounded-xl p-5 mb-6 max-w-xl space-y-4">
        <div className="font-display font-semibold">
          Footer
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            Contact Email
          </label>

          <input
            value={footer.email}
            onChange={(e) =>
              setFooter({
                ...footer,
                email: e.target.value,
              })
            }
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            Copyright Text
          </label>

          <input
            value={footer.copyright}
            onChange={(e) =>
              setFooter({
                ...footer,
                copyright: e.target.value,
              })
            }
            className="w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white"
          />
        </div>

        <button
          onClick={() =>
            save('footer', footer)
          }
          disabled={saving === 'footer'}
          className="font-display font-semibold text-sm px-6 py-2.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving === 'footer'
            ? 'Saving...'
            : 'Save Footer'}
        </button>
      </div>
    </main>
  )
}