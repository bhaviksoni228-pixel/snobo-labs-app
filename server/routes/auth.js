const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const User = require('../models/User')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)

// TEMPORARY one-time admin seed route — protected by a secret key, remove after use
router.get('/seed-admin-once', async (req, res) => {
  try {
    if (req.query.key !== 'snobo_seed_2026_temp') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const existing = await User.findOne({ email: 'snobolabs@gmail.com' })
    if (existing) {
      return res.json({ message: 'Admin already exists, no action taken.' })
    }
    const admin = await User.create({
      name: 'Snobo Admin',
      email: 'snobolabs@gmail.com',
      password: 'snobo2803Mov-ik_jit/sni#',
      role: 'admin',
    })
    res.json({ message: 'Admin created successfully', email: admin.email })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router