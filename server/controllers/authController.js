const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const RevokedToken = require('../models/RevokedToken')

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Dummy hash used to equalize bcrypt timing when a user doesn't exist (prevents user enumeration via timing)
const DUMMY_HASH = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8xE9LG5b9tRIPfPn0GHzrCwEjSFwPu'

function isStrongPassword(password) {
  // Min 10 chars, at least one upper, one lower, one digit, one symbol
  return (
    password.length >= 10 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, tv: user.passwordChangedAt?.getTime() || 0 },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: 'snobolabs.in',
      audience: 'snobolabs-app',
      jwtid: crypto.randomUUID(),
    }
  )
}

function signRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    expiresIn: REFRESH_TOKEN_TTL,
    issuer: 'snobolabs.in',
    audience: 'snobolabs-app',
    jwtid: crypto.randomUUID(),
  })
}

function setAuthCookies(res, accessToken, refreshToken) {
  // Always secure + sameSite:'none' — this app is always served over HTTPS in every
  // real deployment (Render + Vercel), and frontend/backend are on different domains,
  // which makes this a cross-site request. 'none' is required for the cookie to survive
  // that trip; 'none' itself requires secure:true, which we always have here.
  res.cookie('snobo_access', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 15 * 60 * 1000,
    path: '/',
  })
  res.cookie('snobo_refresh', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  })
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' })
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 10 characters and include uppercase, lowercase, a number, and a symbol',
      })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      // Same generic response regardless of outcome — no enumeration signal
      return res.status(201).json({
        message: 'If this email is available, an account has been created. Please check your email to continue.',
      })
    }

    await User.create({ name, email: email.toLowerCase(), password })

    // NOTE: no token issued here — see "Missing: Email Verification" section below.
    // Account should remain unusable until email is verified in a production build.
    res.status(201).json({
      message: 'If this email is available, an account has been created. Please check your email to continue.',
    })
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    // Always run a bcrypt comparison — even for a non-existent user — to equalize timing
    const hashToCompare = user ? user.password : DUMMY_HASH
    const passwordMatches = await bcrypt.compare(password, hashToCompare)

    if (user?.isLocked()) {
      return res.status(423).json({
        message: 'Too many failed attempts. This account is temporarily locked. Try again later.',
      })
    }

    if (!user || !passwordMatches) {
      if (user) await user.registerFailedLogin()
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    await user.resetFailedLogins()

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)
    setAuthCookies(res, accessToken, refreshToken)

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}

async function refresh(req, res) {
  try {
    const token = req.cookies?.snobo_refresh
    if (!token) return res.status(401).json({ message: 'Not authenticated' })

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
      issuer: 'snobolabs.in',
      audience: 'snobolabs-app',
    })

    const revoked = await RevokedToken.findOne({ jti: decoded.jti })
    if (revoked) return res.status(401).json({ message: 'Session expired, please log in again' })

    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })

    const accessToken = signAccessToken(user)
    const newRefreshToken = signRefreshToken(user)

    // Rotate: revoke the old refresh token so it can't be reused (mitigates replay if stolen)
    await RevokedToken.create({ jti: decoded.jti, expiresAt: new Date(decoded.exp * 1000) })

    setAuthCookies(res, accessToken, newRefreshToken)
    res.json({ message: 'Refreshed' })
  } catch (err) {
    res.status(401).json({ message: 'Session expired, please log in again' })
  }
}

async function logout(req, res) {
  try {
    const accessToken = req.cookies?.snobo_access
    const refreshToken = req.cookies?.snobo_refresh

    // Revoke both tokens server-side so a copied/leaked token stops working immediately
    for (const token of [accessToken, refreshToken]) {
      if (!token) continue
      try {
        const decoded = jwt.decode(token)
        if (decoded?.jti && decoded?.exp) {
          await RevokedToken.create({ jti: decoded.jti, expiresAt: new Date(decoded.exp * 1000) })
        }
      } catch (_) {
        // ignore malformed tokens during logout
      }
    }

    res.clearCookie('snobo_access', { path: '/' })
    res.clearCookie('snobo_refresh', { path: '/api/auth/refresh' })
    res.json({ message: 'Logged out' })
  } catch (err) {
    console.error('Logout error:', err.message)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

async function getMe(req, res) {
  res.json({ user: req.user })
}

module.exports = { register, login, refresh, logout, getMe }