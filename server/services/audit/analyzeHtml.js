function extractFirstMatch(html, regex) {
  const match = html.match(regex)
  return match?.[1]?.trim() || ''
}

function analyzeHtml(html, site) {
  const lower = html.toLowerCase()

  const imgTags = html.match(/<img\b[^>]*>/gi) || []
  const h1Tags = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || []
  const h2Tags = html.match(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi) || []

  const scriptTags = html.match(/<script\b[^>]*>/gi) || []
  const externalScripts =
    html.match(/<script\b[^>]+src\s*=/gi) || []

  const linkTags = html.match(/<link\b[^>]*>/gi) || []
  const anchorTags = html.match(/<a\b[^>]*>/gi) || []

  const title = extractFirstMatch(
    html,
    /<title\b[^>]*>([\s\S]*?)<\/title>/i
  )

  const metaDescription =
    extractFirstMatch(
      html,
      /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
    ) ||
    extractFirstMatch(
      html,
      /<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i
    )

  const canonical = extractFirstMatch(
    html,
    /<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["']/i
  )

  const lang = extractFirstMatch(
    html,
    /<html\b[^>]*lang=["']([^"']+)["']/i
  )

  const robotsMeta = extractFirstMatch(
    html,
    /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i
  )

  const hasViewport =
    /<meta\b[^>]*name=["']viewport["']/i.test(html)

  const openGraphTags =
    html.match(
      /<meta\b[^>]*(?:property|name)=["']og:[^"']+["'][^>]*>/gi
    ) || []

  const hasTwitterCard =
    /<meta\b[^>]*(?:property|name)=["']twitter:card["']/i.test(
      html
    )

  const hasFavicon =
    /<link\b[^>]*rel=["'][^"']*(?:icon|shortcut icon)[^"']*["']/i.test(
      html
    )

  const structuredData =
    html.match(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi
    ) || []

  const imagesWithoutAlt = imgTags.filter((tag) => {
    return !/\balt\s*=\s*["'][^"']*["']/i.test(tag)
  })

  const imagesWithEmptyAlt = imgTags.filter((tag) => {
    return /\balt\s*=\s*["']\s*["']/i.test(tag)
  })

  const forms =
    html.match(/<form\b[^>]*>/gi) || []

  const buttons =
    html.match(
      /<(?:button|input)\b[^>]*(?:type=["']submit["']|type=["']button["'])?[^>]*>/gi
    ) || []

  const emailMatches =
    html.match(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
    ) || []

  const phoneMatches =
    html.match(
      /(?:\+?\d[\d\s().-]{8,}\d)/g
    ) || []

  const hasWhatsApp =
    lower.includes('wa.me/') ||
    lower.includes('whatsapp.com') ||
    lower.includes('whatsapp')

  const hasChatWidget =
    lower.includes('intercom') ||
    lower.includes('tawk.to') ||
    lower.includes('crisp.chat') ||
    lower.includes('drift.com') ||
    lower.includes('zendesk') ||
    lower.includes('hubspot')

  const hasAnalytics =
    lower.includes('google-analytics') ||
    lower.includes('googletagmanager') ||
    lower.includes('gtag(') ||
    lower.includes('plausible.io') ||
    lower.includes('hotjar') ||
    lower.includes('clarity.ms')

  const hasSocialLinks =
    lower.includes('instagram.com') ||
    lower.includes('facebook.com') ||
    lower.includes('linkedin.com') ||
    lower.includes('twitter.com') ||
    lower.includes('x.com') ||
    lower.includes('youtube.com') ||
    lower.includes('tiktok.com')

  const securityHeaders = {
    strictTransportSecurity:
      Boolean(site.headers['strict-transport-security']),

    contentSecurityPolicy:
      Boolean(site.headers['content-security-policy']),

    xContentTypeOptions:
      Boolean(site.headers['x-content-type-options']),

    referrerPolicy:
      Boolean(site.headers['referrer-policy']),

    permissionsPolicy:
      Boolean(site.headers['permissions-policy']),
  }

  return {
    url: site.finalUrl,

    status: site.status,
    statusText: site.statusText,

    responseTimeMs: site.responseTimeMs,

    htmlLength: html.length,
    pageWeightKB: Math.round(html.length / 1024),

    title,
    titleLength: title.length,

    metaDescription,
    metaDescriptionLength: metaDescription.length,
    hasMetaDescription: Boolean(metaDescription),

    h1Count: h1Tags.length,
    h2Count: h2Tags.length,

    hasViewport,

    lang,
    hasLang: Boolean(lang),

    canonical,
    hasCanonical: Boolean(canonical),

    robotsMeta,
    hasRobotsMeta: Boolean(robotsMeta),

    hasOpenGraph: openGraphTags.length > 0,
    openGraphCount: openGraphTags.length,

    hasTwitterCard,

    hasFavicon,

    structuredDataCount:
      structuredData.length,

    totalImages:
      imgTags.length,

    imagesWithoutAlt:
      imagesWithoutAlt.length,

    imagesWithEmptyAlt:
      imagesWithEmptyAlt.length,

    totalScripts:
      scriptTags.length,

    externalScriptCount:
      externalScripts.length,

    linkCount:
      linkTags.length,

    anchorCount:
      anchorTags.length,

    formCount:
      forms.length,

    buttonCount:
      buttons.length,

    hasEmail:
      emailMatches.length > 0,

    emailCount:
      emailMatches.length,

    hasPhoneNumber:
      phoneMatches.length > 0,

    phoneCount:
      phoneMatches.length,

    hasWhatsApp,

    hasChatWidget,

    hasAnalytics,

    hasSocialLinks,

    hasSSL:
      site.finalUrl.startsWith('https://'),

    securityHeaders,
  }
}

module.exports = {
  analyzeHtml,
}