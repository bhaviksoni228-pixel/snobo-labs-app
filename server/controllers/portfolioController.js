const Portfolio = require('../models/Portfolio')

// Public: list published items only, for the homepage/portfolio page
async function getPublicPortfolio(req, res) {
  try {
    const items = await Portfolio.find({ published: true }).sort({ order: 1, createdAt: -1 })
    res.json({ items })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Admin: list everything, including unpublished
async function getAllPortfolio(req, res) {
  try {
    const items = await Portfolio.find().sort({ order: 1, createdAt: -1 })
    res.json({ items })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function createPortfolioItem(req, res) {
  try {
    const { title, description, tag, link, imageUrl, published, order } = req.body
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' })
    }
    const item = await Portfolio.create({ title, description, tag, link, imageUrl, published, order })
    res.status(201).json({ item })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function updatePortfolioItem(req, res) {
  try {
    const item = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.json({ item })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function deletePortfolioItem(req, res) {
  try {
    const item = await Portfolio.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getPublicPortfolio,
  getAllPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
}
