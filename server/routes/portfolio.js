const express = require('express')
const router = express.Router()
const {
  getPublicPortfolio,
  getAllPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} = require('../controllers/portfolioController')
const { protect, adminOnly } = require('../middleware/auth')

// Public
router.get('/', getPublicPortfolio)

// Admin only
router.get('/all', protect, adminOnly, getAllPortfolio)
router.post('/', protect, adminOnly, createPortfolioItem)
router.patch('/:id', protect, adminOnly, updatePortfolioItem)
router.delete('/:id', protect, adminOnly, deletePortfolioItem)

module.exports = router
