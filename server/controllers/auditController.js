const AuditLead = require('../models/AuditLead')

function normalizeUrl(input) {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  return url
}

// Pull cheap, reliable signals out of raw HTML without a full browser/JS render
function extractSignals(html, url) {
  const lower = html.toLowerCase()
  return {
    hasViewportMeta: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasContactForm: /<form/i.test(html),
    mentionsWhatsapp: lower.includes('wa.me') || lower.includes('whatsapp'),
    hasChatWidgetHint:
      lower.includes('intercom') ||
      lower.includes('tawk.to') ||
      lower.includes('crisp.chat') ||
      lower.includes('drift.com') ||
      lower.includes('chat-widget'),
    hasSSL: url.startsWith('https://'),
    hasPhoneNumber: /(\+?\d[\d\s\-\(\)]{8,}\d)/.test(html),
    titleTag: (html.match(/<title>(.*?)<\/title>/i) || [])[1] || '',
    metaDescription:
      (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [])[1] || '',
    hasSocialLinks:
      lower.includes('instagram.com') || lower.includes('facebook.com') || lower.includes('linkedin.com'),
    htmlLength: html.length,
  }
}

async function fetchSiteHtml(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SnoboAuditBot/1.0)' },
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`Site responded with status ${res.status}`)
    return await res.text()
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

async function generateReport(signals, url) {
  if (!process.env.GROQ_API_KEY) {
    return fallbackReport(signals)
  }

  const prompt = `You are Snobo, an AI that audits small business websites and gives short, direct, actionable feedback.

Website: ${url}
Title: ${signals.titleTag || 'not found'}
Meta description: ${signals.metaDescription || 'not found'}

Signals detected:
- Mobile-friendly (viewport meta tag): ${signals.hasViewportMeta}
- Has a contact form: ${signals.hasContactForm}
- Mentions WhatsApp: ${signals.mentionsWhatsapp}
- Has a live chat widget: ${signals.hasChatWidgetHint}
- Uses HTTPS: ${signals.hasSSL}
- Phone number visible: ${signals.hasPhoneNumber}
- Links to social profiles: ${signals.hasSocialLinks}

Write a short audit report (150-200 words) in this exact structure:
1. One-line overall verdict (direct, not generic)
2. "What's working" — 1-2 bullet points, only if genuinely true from the signals
3. "What's costing you leads" — 2-3 bullet points, specific to the signals above (e.g. no chat widget means slow response = lost customers)
4. One-line closing nudge suggesting a relevant fix (mention chatbots, WhatsApp, or website improvements naturally — don't hard-sell)

Keep it direct, a little blunt, no fluff, no generic advice. Base every point on the actual signals given, don't invent things you can't see.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
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
  if (!signals.hasChatWidgetHint) issues.push('No live chat or chatbot detected — visitors who have a question likely just leave instead of waiting for an email reply.')
  if (!signals.mentionsWhatsapp) issues.push('No WhatsApp presence found — many customers prefer messaging over forms or calls.')
  if (!signals.hasViewportMeta) issues.push('The site may not be properly optimized for mobile visitors.')
  if (!signals.hasContactForm) issues.push('No contact form detected — you may be relying only on a phone number or email, which is more friction for visitors.')

  const working = []
  if (signals.hasSSL) working.push('Site uses HTTPS (secure connection) — good baseline trust signal.')
  if (signals.hasPhoneNumber) working.push('A phone number is visible for visitors to reach you.')

  return `Quick audit summary:\n\nWhat's working:\n${working.map(w => '- ' + w).join('\n') || '- Basic site structure is in place.'}\n\nWhat's likely costing you leads:\n${issues.map(i => '- ' + i).join('\n')}\n\nA chatbot or WhatsApp integration would close most of these gaps fast.`
}

async function runAudit(req, res) {
  try {
    const { url: rawUrl, email } = req.body
    if (!rawUrl || !email) {
      return res.status(400).json({ message: 'URL and email are required' })
    }

    const url = normalizeUrl(rawUrl)

    let html
    try {
      html = await fetchSiteHtml(url)
    } catch (err) {
      return res.status(400).json({
        message: `Couldn't reach that site. Double-check the URL and try again. (${err.message})`,
      })
    }

    const signals = extractSignals(html, url)
    const report = await generateReport(signals, url)

    await AuditLead.create({ url, email, report, signals })

    res.json({ report, signals })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Admin: view all audit leads
async function getAuditLeads(req, res) {
  try {
    const leads = await AuditLead.find().sort({ createdAt: -1 })
    res.json({ leads })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { runAudit, getAuditLeads }
