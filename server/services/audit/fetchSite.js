const DEFAULT_TIMEOUT = 15000

async function fetchSite(url) {
  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, DEFAULT_TIMEOUT)

  const startedAt = Date.now()

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SnoboLabsAudit/2.0; +https://snobolabs.in)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    const responseTimeMs = Date.now() - startedAt
    const html = await response.text()

    return {
      html,
      responseTimeMs,
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url || url,
      headers: Object.fromEntries(response.headers.entries()),
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'The website took too long to respond.'
      )
    }

    throw new Error(
      `Could not fetch the website: ${error.message}`
    )
  } finally {
    clearTimeout(timeout)
  }
}

module.exports = {
  fetchSite,
}