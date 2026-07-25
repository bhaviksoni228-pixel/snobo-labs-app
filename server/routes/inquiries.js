const express = require('express')
const router = express.Router()
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  getMyInquiries,
} = require('../controllers/inquiryController')
const { protect, adminOnly } = require('../middleware/auth')

// Public: anyone can submit the hire form (login optional — req.user may be undefined)
router.post('/', (req, res, next) => {
  // try to attach user if a token was sent, but don't require it
  if (req.headers.authorization?.startsWith('Bearer')) {
    return protect(req, res, () => createInquiry(req, res))
  }
  createInquiry(req, res)
})

// Client: view their own submitted inquiries
router.get('/me', protect, getMyInquiries)

// Admin only: view all leads, update status
router.get('/', protect, adminOnly, getInquiries)
router.patch('/:id/status', protect, adminOnly, updateInquiryStatus)

module.exports = router
