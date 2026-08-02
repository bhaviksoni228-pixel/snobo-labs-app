const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function getSiteContent(key: string) {
  try {
    const res = await fetch(`${API_URL}/api/content/${key}`, { next: { revalidate: 30 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.data
  } catch {
    return null
  }
}

export async function getPublicServices() {
  try {
    const res = await fetch(`${API_URL}/api/services`, { next: { revalidate: 30 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.services || []
  } catch {
    return []
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/services/slug/${slug}`, { next: { revalidate: 30 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.service
  } catch {
    return null
  }
}