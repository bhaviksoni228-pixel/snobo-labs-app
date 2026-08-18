const AuditLead = require('../models/AuditLead')

function normalizeUrl(input) {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  return url
}

function extractSignals(html, url, loadTimeMs) {
  const lower = html.toLowerCase()

  const imgTags = html.match(/<img[^>]*>/gi) || []
  const imagesWithoutAlt = imgTags.filter((tag) => !/alt\s*=\s*["'][^"']+["']/i.test(tag)).length

  const h1Tags = html.match(/<h1[^>]*>/gi) || []
  const scriptTags = html.match(/<script[^>]*src=/gi) || []

  const titleTag = (html.match(/<title>(.*?)<\/title>/i) || [])[1]?.trim() || ''
  const metaDescription =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [])[1] || ''

  return {
    hasSSL: url.startsWith('https://'),
    hasViewportMeta: /<meta[^>]+name=["']viewport["']/i.test(html),
    pageWeightKB: Math.round(html.length / 1024),
    loadTimeMs,
    externalScriptCount: scriptTags.length,
    titleTag,
    titleLength: titleTag.length,
    metaDescription,
    hasMetaDescription: metaDescription.length > 0,
    h1Count: h1Tags.length,
    hasOpenGraph: /<meta[^>]+property=["']og:/i.test(html),
    hasFavicon: /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html),
    totalImages: imgTags.length,
    imagesWithoutAlt,
    hasContactForm: /<form/i.test(html),
    mentionsWhatsapp: lower.includes('wa.me') || lower.includes('whatsapp'),
    hasChatWidgetHint:
      lower.includes('intercom') ||
      lower.includes('tawk.to') ||
      lower.includes('crisp.chat') ||
      lower.includes('drift.com') ||
      lower.includes('chat-widget'),
    hasPhoneNumber: /(\+?\d[\d\s\-\(\)]{8,}\d)/.test(html),
    hasSocialLinks:
      lower.includes('instagram.com') || lower.includes('facebook.com') || lower.includes('linkedin.com'),
    hasAnalytics:
      lower.includes('google-analytics') || lower.includes('gtag(') || lower.includes('googletagmanager'),
    htmlLength: html.length,
  }
}

async function fetchSiteHtml(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  const start = Date.now()
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SnoboAuditBot/1.0)' },
    })
    const loadTimeMs = Date.now() - start
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`Site responded with status ${res.status}`)
    const html = await res.text()
    return { html, loadTimeMs }
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

async function generateReport(signals, url) {
  if (!process.env.GROQ_API_KEY) {
    return fallbackReport(signals)
  }

  const prompt = `You are Snobo, an experienced web/UX auditor. You have just crawled a real website and pulled genuine technical signals from its HTML. Your job is to write a sharp, specific, evidence-based audit — the kind a skilled freelance consultant would send after actually looking at the site. This is NOT a sales pitch. Do not force every finding toward "buy a chatbot." Diagnose what's actually there.

Website: ${url}
Title tag: "${signals.titleTag || 'MISSING'}" (${signals.titleLength} characters — ideal is 50-60)
Meta description: ${signals.hasMetaDescription ? `"${signals.metaDescription}"` : 'MISSING entirely'}
Page weight: ${signals.pageWeightKB} KB of HTML
Load time: ${signals.loadTimeMs}ms
Number of H1 headings: ${signals.h1Count} (should be exactly 1)
Total images: ${signals.totalImages}, of which ${signals.imagesWithoutAlt} are missing alt text
External scripts loaded: ${signals.externalScriptCount}
Open Graph tags (social preview): ${signals.hasOpenGraph ? 'present' : 'missing'}
Favicon: ${signals.hasFavicon ? 'present' : 'missing'}
Analytics tracking detected: ${signals.hasAnalytics ? 'yes' : 'no'}
Mobile viewport tag: ${signals.hasViewportMeta ? 'present' : 'MISSING'}
HTTPS: ${signals.hasSSL ? 'yes' : 'no — insecure'}
Contact form: ${signals.hasContactForm ? 'present' : 'not found'}
WhatsApp presence: ${signals.mentionsWhatsapp ? 'yes' : 'no'}
Live chat widget: ${signals.hasChatWidgetHint ? 'yes' : 'no'}
Phone number visible in HTML: ${signals.hasPhoneNumber ? 'yes' : 'no'}
Social media links: ${signals.hasSocialLinks ? 'yes' : 'no'}

Write a report using this structure, 180-240 words total:

1. One sharp opening verdict — say something only true of THIS site's specific numbers above, not a generic line that could apply to any site.
2. "Real problems found" — 3-4 specific, technical findings drawn directly from the data above. Cover a MIX of categories (don't just repeat chat/WhatsApp every time) — pull from: SEO (title/meta/H1 issues), performance (page weight, load time, script count), accessibility (missing alt text), trust signals (favicon, HTTPS, analytics), and conversion (contact methods) as relevant to what's actually missing or present. Cite the actual numbers.
3. "What's working" — 1-2 genuine positives, only if the data actually supports them.
4. One closing line — ONLY if a Snobo product is genuinely the most relevant fix for the single biggest problem found, mention it briefly and naturally. If the biggest problems are things like missing meta tags, slow load time, or no alt text, do NOT force a chatbot mention — just say the finding stands on its own or suggest a general fix.

Rules: never invent data not given above. Be specific and technical, not generic. Sound like an expert who actually looked at this exact site, not a template.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 500,
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content || fallbackReport(signals)
  } catch (err) {
    console.error('Groq API error:', err.message)
    return fallbackReport(signals)
  }
}

function fallbackReport(signals) {
  const issues = []

  if (!signals.titleTag) {
    issues.push('No <title> tag found — this is the single biggest SEO miss, it directly affects how your site shows up in Google and browser tabs.')
  } else if (signals.titleLength < 20 || signals.titleLength > 65) {
    issues.push(`Title tag is ${signals.titleLength} characters — outside the ideal 50-60 range, so it's likely getting cut off in search results.`)
  }

  if (!signals.hasMetaDescription) {
    issues.push('No meta description found — Google will auto-generate a snippet instead, which usually converts worse than a written one.')
  }

  if (signals.h1Count === 0) {
    issues.push('No H1 heading detected on the page — this hurts both SEO and how clearly the page communicates its purpose.')
  } else if (signals.h1Count > 1) {
    issues.push(`Found ${signals.h1Count} H1 headings — having more than one can confuse search engines about your page's main topic.`)
  }

  if (signals.imagesWithoutAlt > 0 && signals.totalImages > 0) {
    issues.push(`${signals.imagesWithoutAlt} of ${signals.totalImages} images are missing alt text — this hurts accessibility and image SEO.`)
  }

  if (signals.loadTimeMs > 2000) {
    issues.push(`Page took ${signals.loadTimeMs}ms to respond — visitors typically abandon a site after 3 seconds of waiting.`)
  }

  if (!signals.hasFavicon) {
    issues.push('No favicon detected — small detail, but it makes the site look less finished, especially in browser tabs and bookmarks.')
  }

  if (!signals.hasAnalytics) {
    issues.push('No analytics tracking detected — you likely have no visibility into how many people visit or what they do on your site.')
  }

  if (!signals.hasChatWidgetHint && !signals.mentionsWhatsapp) {
    issues.push('No live chat or WhatsApp option found — visitors with quick questions have no fast way to reach you.')
  }

  const working = []
  if (signals.hasSSL) working.push('Site uses HTTPS — good baseline security and trust signal.')
  if (signals.hasViewportMeta) working.push('Mobile viewport tag is present, so the site should render properly on phones.')
  if (signals.hasOpenGraph) working.push('Open Graph tags are set up, so links will preview nicely when shared on social media.')

  const topIssues = issues.slice(0, 4)

  return `Quick audit summary:\n\nWhat's working:\n${working.map((w) => '- ' + w).join('\n') || '- Basic site structure is in place.'}\n\nReal problems found:\n${topIssues.map((i) => '- ' + i).join('\n')}\n\n${issues.length > 4 ? `(${issues.length - 4} more minor issues also found.)\n\n` : ''}These are fixable — some in minutes, some need a proper rebuild depending on scope.`
}

async function runAudit(req, res) {
  try {
    const { url: rawUrl, email } = req.body
    if (!rawUrl || !email) {
      return res.status(400).json({ message: 'URL and email are required' })
    }

    const url = normalizeUrl(rawUrl)

    let html, loadTimeMs
    try {
      const result = await fetchSiteHtml(url)
      html = result.html
      loadTimeMs = result.loadTimeMs
    } catch (err) {
      return res.status(400).json({
        message: `Couldn't reach that site. Double-check the URL and try again. (${err.message})`,
      })
    }

    const signals = extractSignals(html, url, loadTimeMs)
    const report = await generateReport(signals, url)

    await AuditLead.create({ url, email, report, signals })

    res.json({ report, signals })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function getAuditLeads(req, res) {
  try {
    const leads = await AuditLead.find().sort({ createdAt: -1 })
    res.json({ leads })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { runAudit, getAuditLeads }