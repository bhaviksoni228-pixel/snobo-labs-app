const rateLimit = require('express-rate-limit')

// Login: 5 attempts per 15 min per IP, then hard block
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: true, // only count failed attempts
})

// Register: 3 accounts per hour per IP (prevents spam signups)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many accounts created from this network. Try again later.' },
})

// General auth endpoints (getMe, future reset/verify) — looser but still capped
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
})

// Password reset request: 3 per hour per IP — prevents email-bombing a victim
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many reset requests. Try again later.' },
})

module.exports = { loginLimiter, registerLimiter, authLimiter, forgotPasswordLimiter }