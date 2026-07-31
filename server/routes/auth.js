const express = require('express')
const router = express.Router()
const { register, login, refresh, logout, getMe } = require('../controllers/authController')
const { forgotPassword, resetPassword } = require('../controllers/passwordResetController')
const { protect } = require('../middleware/auth')
const { loginLimiter, registerLimiter, authLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter')

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.post('/refresh', authLimiter, refresh)
router.post('/logout', authLimiter, protect, logout)
router.get('/me', authLimiter, protect, getMe)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

module.exports = router