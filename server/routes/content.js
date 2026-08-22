const express = require('express')
const router = express.Router()
const { getContent, getAllContent, upsertContent } = require('../controllers/siteContentController')
const { protect, adminOnly } = require('../middleware/auth')
const SiteContent = require('../models/SiteContent')
const Service = require('../models/Service')

router.get('/', getAllContent)
router.get('/:key', getContent)
router.put('/:key', protect, adminOnly, upsertContent)

// TEMPORARY one-time seed route — migrates hardcoded homepage/services content into the DB.
// Protected by a secret key. Remove this route after running it once.
router.get('/seed-once/:secretKey', async (req, res) => {
  if (req.params.secretKey !== 'snobo_content_seed_2026') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  try {
    await SiteContent.findOneAndUpdate(
      { key: 'hero' },
      { key: 'hero', data: { headline: 'Intelligence Beyond Limits', subtext: 'Innovate. Automate. Elevate.' } },
      { upsert: true }
    )
    await SiteContent.findOneAndUpdate(
      { key: 'manifesto' },
      {
        key: 'manifesto',
        data: {
          text: 'Snobo Labs builds AI and web products for businesses that want to move fast — no account managers, no bloated teams, direct access to the person building your product.',
        },
      },
      { upsert: true }
    )
    await SiteContent.findOneAndUpdate(
      { key: 'footer' },
      { key: 'footer', data: { email: 'snobolabs.in@gmail.com', copyright: `© ${new Date().getFullYear()} Snobo Labs. All rights reserved.` } },
      { upsert: true }
    )

    const SERVICES = [
      {
        slug: 'sites', name: 'Snobo Sites', hook: 'Get a professional website',
        description: 'A fast, mobile-friendly website that actually represents your business — built and live in days, not months.',
        features: ['Mobile-responsive design', 'Contact form wired to your email', 'Basic SEO setup', 'Admin-editable content (Standard & Premium)'],
        howItWorks: ['We set it up — share your business details and preferences', 'We build it — live draft ready within days', 'You review and launch'],
        pricing: [
          { name: 'Basic', price: '₹4,999', priceNote: 'one-time', description: 'Single landing page, mobile responsive, contact form', checks: ['Single landing page', 'Mobile responsive', 'Contact form', 'Live in 5-7 days'] },
          { name: 'Standard', price: '₹12,999', priceNote: 'one-time', description: 'Full business website (5–7 pages), SEO basics, editable content', checks: ['5-7 page website', 'Basic SEO setup', 'Admin-editable content', 'Priority support'], popular: true },
          { name: 'Premium', price: '₹24,999', priceNote: 'one-time', description: 'E-commerce or complex multi-feature site, custom admin panel', checks: ['E-commerce or complex features', 'Custom admin panel', 'Unlimited pages', 'Priority support'] },
        ],
        faq: [
          { q: 'How long does it take?', a: 'Basic sites are live in 5-7 days. Standard and Premium may take slightly longer depending on scope.' },
          { q: 'Can I edit the content myself later?', a: 'Standard and Premium include an admin panel so you can update text/images without touching code.' },
          { q: 'Is hosting included?', a: 'Hosting setup is included; ongoing hosting costs (if any) are separate and typically very low.' },
        ],
        order: 1,
      },
      {
        slug: 'chat', name: 'Snobo Chat', hook: 'Never miss a customer message again',
        description: 'An AI chatbot for your website and WhatsApp — replies instantly, even while you sleep.',
        features: ['Website chat widget', 'WhatsApp AI agent', 'Trained on your business info and FAQs', 'Monthly retraining and monitoring (retainer)'],
        howItWorks: ['We learn your business — products, FAQs, tone', 'We train and deploy the AI agent', 'It replies to customers 24/7, you review conversations anytime'],
        pricing: [
          { name: 'Setup', price: '₹7,999', priceNote: 'one-time', description: 'Website widget or WhatsApp bot, trained on your business', checks: ['Website chat widget', 'Trained on your business', 'WhatsApp option available'], popular: true },
          { name: 'Retainer', price: '₹1,499', priceNote: '/month', description: 'Hosting, monitoring, monthly retraining and updates', checks: ['Hosting included', 'Monthly retraining', 'Ongoing monitoring'] },
        ],
        faq: [
          { q: 'Does it work on WhatsApp?', a: 'Yes — Snobo Chat can be deployed as a website widget, a WhatsApp agent, or both.' },
          { q: "What if it doesn't know an answer?", a: 'It can be configured to hand off to you directly for anything outside its training.' },
          { q: 'Is the retainer mandatory?', a: 'The retainer covers ongoing hosting and updates — without it the bot may go stale over time, but it\'s not forced.' },
        ],
        order: 2,
      },
      {
        slug: 'crm', name: 'Snobo CRM', hook: 'Stop losing track of customers',
        description: 'A simple, WhatsApp-native system to see every lead, get follow-up reminders, and never forget a conversation again.',
        features: ['Lead pipeline tracking', 'Auto-tagging conversations', 'Follow-up reminders', 'Broadcast campaigns'],
        howItWorks: ['We map your current sales process', 'We build your CRM around WhatsApp + a simple dashboard', 'You start tracking every lead from day one'],
        pricing: [
          { name: 'Setup', price: '₹9,999', priceNote: 'one-time', description: 'Full CRM build, tailored to your sales process', checks: ['Lead pipeline tracking', 'Follow-up reminders', 'Tailored to your process'], popular: true },
          { name: 'Retainer', price: '₹1,999', priceNote: '/month', description: 'Maintenance, new features, ongoing support', checks: ['Ongoing maintenance', 'New features added', 'Priority support'] },
        ],
        faq: [
          { q: 'Do I need to change how I use WhatsApp?', a: 'No — it works alongside your existing WhatsApp Business setup.' },
          { q: 'Can multiple team members use it?', a: 'Yes, this can be configured based on your team size — mention it in your request.' },
        ],
        order: 3,
      },
      {
        slug: 'bots', name: 'Snobo Bots', hook: 'Automate the repetitive stuff',
        description: 'Add-on bots that handle bookings, FAQs, and follow-ups automatically — layered on top of Snobo Chat.',
        features: ['Booking / appointment bot', 'Lead qualification bot', 'Order bots and voice agents (coming soon)'],
        howItWorks: ['Choose which bot fits your business', 'We configure it around your existing calendar/process', 'It runs automatically alongside Snobo Chat'],
        pricing: [
          { name: 'Booking Bot', price: '₹4,999', priceNote: 'one-time add-on', description: 'Handles appointment scheduling automatically', checks: ['Automatic scheduling', 'Calendar sync', 'Runs alongside Snobo Chat'], popular: true },
          { name: 'Lead Qualification Bot', price: '₹3,999', priceNote: 'one-time add-on', description: 'Pre-screens inbound leads before they reach you', checks: ['Pre-screens leads', 'Saves you time', 'Runs alongside Snobo Chat'] },
        ],
        faq: [
          { q: 'Do I need Snobo Chat first?', a: 'Yes, these bots are add-ons that build on top of a Snobo Chat setup.' },
          { q: 'What about order bots or voice agents?', a: 'Coming soon — reach out if you want to be first in line when they launch.' },
        ],
        order: 4,
      },
      {
        slug: 'build', name: 'Snobo Build', hook: 'Turn your idea into a working product',
        description: 'Full MVP development for founders — website plus whichever AI/CRM pieces you need, bundled and built fast.',
        features: ['Full-stack MVP build', 'Website + core product features', 'Optional AI/CRM pieces bundled in', 'Direct access to the builder throughout'],
        howItWorks: ['We scope exactly what your MVP needs', 'We build it end-to-end, fast', 'You get a working product to show investors or launch with'],
        pricing: [
          { name: 'Starter MVP', price: '₹34,999', priceNote: 'starting', description: 'Website + one core feature', checks: ['Website + one core feature', 'Direct access to builder', 'Fast turnaround'] },
          { name: 'Full MVP', price: '₹59,999+', priceNote: 'custom quoted', description: 'Full-stack product, AI/CRM pieces bundled as needed', checks: ['Full-stack product', 'AI/CRM pieces bundled', 'Investor-ready build'], popular: true },
        ],
        faq: [
          { q: 'What if my idea needs something not listed?', a: 'Tell us in the form — MVPs are scoped individually, this is a starting point.' },
          { q: 'How fast can this be built?', a: 'Depends on scope, but speed is the whole point — we move fast and talk directly, no account managers.' },
        ],
        order: 5,
      },
    ]

    let created = 0
    for (const s of SERVICES) {
      const existing = await Service.findOne({ slug: s.slug })
      if (!existing) {
        await Service.create(s)
        created++
      }
    }

    res.json({ message: `Seed complete. ${created} services created (existing ones skipped).` })
  } catch (err) {
    res.status(500).json({ message: 'Seed failed', error: err.message })
  }
})

module.exports = router