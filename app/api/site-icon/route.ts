import { NextResponse } from 'next/server'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const FALLBACK_ICON =
  'https://snobolabs.in/icon.svg'

export async function GET() {
  try {
    // Get the current branding information
    // from the existing Snobo Labs backend.
    const contentResponse = await fetch(
      `${API_URL}/api/content/branding`,
      {
        cache: 'no-store',
      }
    )

    if (!contentResponse.ok) {
      return redirectToFallback()
    }

    const content = await contentResponse.json()

    const logoUrl =
      content?.data?.logoUrl || FALLBACK_ICON

    // Download the actual logo.
    const imageResponse = await fetch(logoUrl, {
      cache: 'no-store',
    })

    if (!imageResponse.ok) {
      return redirectToFallback()
    }

    const image = await imageResponse.arrayBuffer()

    const contentType =
      imageResponse.headers.get('content-type') ||
      'image/png'

    return new NextResponse(image, {
      status: 200,
      headers: {
        'Content-Type': contentType,

        // Allow browsers and Google to cache it,
        // but refresh it periodically.
        'Cache-Control':
          'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error(
      'Failed to load dynamic site icon:',
      error
    )

    return redirectToFallback()
  }
}

function redirectToFallback() {
  return NextResponse.redirect(
    FALLBACK_ICON,
    {
      status: 307,
      headers: {
        'Cache-Control':
          'public, max-age=3600',
      },
    }
  )
}