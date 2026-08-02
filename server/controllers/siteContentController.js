const SiteContent = require('../models/SiteContent')

// Public: get one content block by key (e.g. "hero")
async function getContent(req, res) {
  try {
    const doc = await SiteContent.findOne({ key: req.params.key })
    res.json({ data: doc?.data || null })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Public: get all content blocks at once (used on page load)
async function getAllContent(req, res) {
  try {
    const docs = await SiteContent.find()
    const result = {}
    docs.forEach((d) => {
      result[d.key] = d.data
    })
    res.json({ content: result })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Admin: create or update a content block
async function upsertContent(req, res) {
  try {
    const { key } = req.params
    const { data } = req.body
    if (!data) return res.status(400).json({ message: 'Data is required' })

    const doc = await SiteContent.findOneAndUpdate(
      { key },
      { key, data },
      { upsert: true, new: true }
    )
    res.json({ data: doc.data })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getContent, getAllContent, upsertContent }