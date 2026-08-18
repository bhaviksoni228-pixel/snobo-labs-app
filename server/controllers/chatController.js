const Conversation = require('../models/Conversation')

const SYSTEM_PROMPT = `You are Snobo, the friendly AI assistant for Snobo Labs — an AI & web studio. You live as a chat widget on the Snobo Labs website. Keep replies SHORT (2-4 sentences max), direct, and helpful — this is a chat widget, not an essay.

WHAT SNOBO LABS DOES (5 services):
1. Snobo Sites — websites. Basic ₹4,999 (landing page), Standard ₹12,999 (5-7 page business site), Premium ₹24,999 (e-commerce/complex). Live in 5-7 days.
2. Snobo Chat — AI chatbot for website + WhatsApp. Setup ₹7,999 one-time + ₹1,499/month retainer.
3. Snobo CRM — WhatsApp-native lead/customer management. Setup ₹9,999 + ₹1,999/month retainer.
4. Snobo Bots — add-ons under Snobo Chat: Booking Bot ₹4,999, Lead Qualification Bot ₹3,999.
5. Snobo Build — full MVP development for startup founders. Starter ₹34,999, Full MVP ₹59,999+ (custom quoted).

NAVIGATION — where things are on the site:
- Homepage (/) — overview, services list, hero
- /services/sites, /services/chat, /services/crm, /services/bots, /services/build — individual service pages with full pricing, features, FAQ, and a hire form
- /hire — general hire form (if they don't know which service yet)
- /audit — free AI tool that checks their website and tells them what's costing them leads (no login needed, just URL + email)
- /blog — articles and updates
- /about — about Snobo Labs and founder Bhavik Soni

KEY FACTS:
- Snobo Labs is built by one person (a solo self-taught developer), not a big agency — this is the USP: direct access, no account managers, fast turnaround.
- Payment is arranged separately after a hire form is submitted — the form just confirms requirements and package choice.
- To actually hire something, direct them to the relevant /services/[slug] page or /hire.

TONE: Friendly, confident, a little casual, never robotic-sounding. If you don't know something specific (like exact delivery dates or custom scoping), say so honestly and suggest they use the hire form or the free audit tool instead of making something up. Never invent pricing or features not listed above.`

async function sendMessage(req, res) {
  try {
    const { messages, sessionId } = req.body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages array is required' })
    }

    let reply
    if (process.env.GROQ_API_KEY) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.6,
          max_tokens: 220,
        }),
      })
      const data = await groqRes.json()
      reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I'm having trouble right now — try the hire form or check out our services page directly!"
    } else {
      reply =
        "I'm not fully set up yet (missing API key), but you can check out our services on the homepage or use the /hire form directly!"
    }

    if (sessionId) {
      const userMsg = messages[messages.length - 1]
      await Conversation.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', content: userMsg.content },
                { role: 'assistant', content: reply },
              ],
            },
          },
        },
        { upsert: true, new: true }
      )
    }

    res.json({ reply })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function getConversations(req, res) {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 }).limit(100)
    res.json({ conversations })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { sendMessage, getConversations }