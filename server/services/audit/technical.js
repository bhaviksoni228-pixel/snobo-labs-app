const TECHNICAL_TIMEOUT = 8000

async function fetchWithTimeout(url) {
  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, TECHNICAL_TIMEOUT)

  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SnoboLabsAudit/2.0; +https://snobolabs.in)',
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function checkTechnical(url) {
  const parsed = new URL(url)

  const origin =
    `${parsed.protocol}//${parsed.host}`

  const result = {
    robotsTxt: {
      reachable: false,
      status: null,
      content: '',
    },

    sitemap: {
      reachable: false,
      status: null,
      url: `${origin}/sitemap.xml`,
    },
  }

  // -----------------------------
  // robots.txt
  // -----------------------------

  try {
    const response =
      await fetchWithTimeout(
        `${origin}/robots.txt`
      )

    result.robotsTxt.status =
      response.status

    if (response.ok) {
      result.robotsTxt.reachable = true

      result.robotsTxt.content =
        await response.text()

      /*
       * If robots.txt declares a sitemap,
       * use that instead of assuming /sitemap.xml.
       */
      const sitemapMatch =
        result.robotsTxt.content.match(
          /(?:^|\n)\s*Sitemap:\s*(\S+)/i
        )

      if (sitemapMatch?.[1]) {
        result.sitemap.url =
          sitemapMatch[1].trim()
      }
    }
  } catch (error) {
    result.robotsTxt.error =
      error.message
  }

  // -----------------------------
  // sitemap.xml
  // -----------------------------

  try {
    const response =
      await fetchWithTimeout(
        result.sitemap.url
      )

    result.sitemap.status =
      response.status

    result.sitemap.reachable =
      response.ok
  } catch (error) {
    result.sitemap.error =
      error.message
  }

  return result
}

module.exports = {
  checkTechnical,
}