const jwt = require('jsonwebtoken')
const User = require('../models/User')
const RevokedToken = require('../models/RevokedToken')

async function protect(req, res, next) {
  const token = req.cookies?.snobo_access

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // pin algorithm — prevents algorithm-confusion attacks
      issuer: 'snobolabs.in',
      audience: 'snobolabs-app',
    })

    const revoked = await RevokedToken.findOne({ jti: decoded.jti })
    if (revoked) {
      return res.status(401).json({ message: 'Session expired, please log in again' })
    }

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // If password changed after this token was issued, invalidate it (e.g. after a password reset)
    if (user.passwordChangedAt && decoded.tv !== user.passwordChangedAt.getTime()) {
      return res.status(401).json({ message: 'Session expired, please log in again' })
    }

    req.user = user
    req.tokenJti = decoded.jti
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role === 'admin') return next()
  return res.status(403).json({ message: 'Admin access required' })
}

module.exports = { protect, adminOnly }