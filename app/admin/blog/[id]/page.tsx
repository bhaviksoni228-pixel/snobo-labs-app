'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

const CLOUDINARY_BLOG_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_BLOG_UPLOAD_PRESET

type BlogForm = {
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  author: string
  published: boolean
}

const EMPTY: BlogForm = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: 'Bhavik Soni',
  published: true,
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

export default function EditBlog() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<BlogForm>(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isNew) return

    fetch(`${API_URL}/api/blog/admin/${id}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login')
          throw new Error('Not authenticated')
        }

        return res.json()
      })
      .then((data) => setForm(data.blog))
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false))
  }, [id, isNew, router])

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: isNew ? slugify(title) : f.slug,
    }))
  }

  async function uploadCoverImage(file: File) {
    setUploadingImage(true)
    setError('')
    setSuccess('')

    try {
      if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error(
          'Cloudinary cloud name is not configured.'
        )
      }

      if (!CLOUDINARY_BLOG_UPLOAD_PRESET) {
        throw new Error(
          'Blog Cloudinary upload preset is not configured.'
        )
      }

      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/svg+xml',
      ]

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          'Please upload PNG, JPG, WEBP, or SVG.'
        )
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(
          'Image must be smaller than 5 MB.'
        )
      }

      const formData = new FormData()

      formData.append('file', file)
      formData.append(
        'upload_preset',
        CLOUDINARY_BLOG_UPLOAD_PRESET
      )

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error?.message || 'Image upload failed.'
        )
      }

      if (!result.secure_url) {
        throw new Error(
          'Cloudinary did not return an image URL.'
        )
      }

      setForm((current) => ({
        ...current,
        coverImage: result.secure_url,
      }))

      setSuccess(
        'Cover image uploaded. Save the post to keep it.'
      )
    } catch (err: any) {
      setError(
        err?.message || 'Failed to upload image.'
      )
    } finally {
      setUploadingImage(false)
    }
  }

  function handleImageSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    uploadCoverImage(file)

    event.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = isNew
        ? `${API_URL}/api/blog`
        : `${API_URL}/api/blog/${id}`

      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (res.status === 401) {
        router.push('/admin/login')
        return
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.message || 'Save failed'
        )
      }

      router.push('/admin/blog')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  const inputClass =
    'w-full bg-transparent border border-grey-2 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white'

  return (
    <main className="px-6 py-10">
      <a
        href="/admin/blog"
        className="text-sm text-grey-4 underline mb-6 inline-block"
      >
        ← Back to Blog
      </a>

      <h1 className="font-display font-bold text-2xl mb-8">
        {isNew ? 'New Post' : `Edit ${form.title}`}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-5"
      >
        {/* TITLE */}
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            Title
          </label>

          <input
            required
            value={form.title}
            onChange={(e) =>
              handleTitleChange(e.target.value)
            }
            className={inputClass}
          />
        </div>

        {/* SLUG */}
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            URL slug
          </label>

          <input
            required
            value={form.slug}
            onChange={(e) =>
              setForm({
                ...form,
                slug: e.target.value,
              })
            }
            className={inputClass}
          />

          <p className="text-xs text-grey-4 mt-1">
            Live at: /blog/{form.slug || '...'}
          </p>
        </div>

        {/* EXCERPT */}
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            Excerpt
          </label>

          <textarea
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) =>
              setForm({
                ...form,
                excerpt: e.target.value,
              })
            }
            className={inputClass + ' resize-none'}
          />
        </div>

        {/* CONTENT */}
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            Content
          </label>

          <textarea
            required
            rows={14}
            value={form.content}
            onChange={(e) =>
              setForm({
                ...form,
                content: e.target.value,
              })
            }
            className={
              inputClass +
              ' resize-y font-mono text-xs leading-relaxed'
            }
            placeholder="Write your post here. Separate paragraphs with a blank line."
          />
        </div>

        {/* COVER IMAGE */}
        <div>
          <label className="block text-sm text-grey-4 mb-2">
            Cover Image
          </label>

          {form.coverImage && (
            <div className="mb-3">
              <div className="w-full max-w-md aspect-video rounded-xl overflow-hidden border border-grey-2 bg-grey-1">
                <img
                  src={form.coverImage}
                  alt="Blog cover preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    coverImage: '',
                  })
                }
                className="text-xs text-red-400 mt-2 underline"
              >
                Remove image
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleImageSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploadingImage}
            className="font-display font-semibold text-sm px-6 py-3 rounded-full bg-white text-black disabled:opacity-50"
          >
            {uploadingImage
              ? 'Uploading...'
              : form.coverImage
                ? 'Change Cover Image'
                : 'Choose Image From Gallery'}
          </button>

          <p className="text-xs text-grey-4 mt-2">
            PNG, JPG, WEBP or SVG · Maximum 5 MB
          </p>
        </div>

        {/* AUTHOR */}
        <div>
          <label className="block text-sm text-grey-4 mb-1.5">
            Author
          </label>

          <input
            value={form.author}
            onChange={(e) =>
              setForm({
                ...form,
                author: e.target.value,
              })
            }
            className={inputClass}
          />
        </div>

        {/* PUBLISHED */}
        <label className="flex items-center gap-2 text-sm text-grey-4">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm({
                ...form,
                published: e.target.checked,
              })
            }
          />

          Published (visible on site)
        </label>

        {/* SAVE */}
        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="font-display font-semibold px-8 py-3.5 rounded-full bg-white text-black disabled:opacity-50"
        >
          {saving
            ? 'Saving...'
            : isNew
              ? 'Publish Post'
              : 'Save Changes'}
        </button>
      </form>
    </main>
  )
}