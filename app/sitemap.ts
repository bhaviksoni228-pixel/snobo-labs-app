import type { MetadataRoute } from 'next'

const BASE_URL = 'https://snobolabs.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '/',
    '/services/sites',
    '/services/chat',
    '/services/crm',
    '/services/bots',
    '/services/build',
    '/audit',
    '/blog',
    '/about',
    '/hire',
    '/privacy-policy',
  ]

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority:
      route === '/'
        ? 1
        : route === '/hire'
          ? 0.9
          : route === '/audit'
            ? 0.9
            : 0.7,
  }))
}