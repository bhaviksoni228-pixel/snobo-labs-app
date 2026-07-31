const crypto = require('crypto')
const { Resend } = require('resend')
const User = require('../models/User')
const PasswordReset = require('../models/PasswordReset')

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

async function forgotPassword(req, res) {
  // Always return the same generic response — never reveal whether the email exists
  const genericResponse = () =>
    res.json({ message: 'If an account with that email exists, a reset link has been sent.' })

  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return genericResponse() // same response, no enumeration signal

    const rawToken = crypto.randomBytes(32).toString('hex') // cryptographically secure, 256 bits
    const tokenHash = hashToken(rawToken)

    await PasswordReset.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    })

    if (resend) {
      const resetUrl = `https://snobolabs.in/reset-password?token=${rawToken}&uid=${user._id}`
      // rawToken only ever exists in this email — never logged, never in the DB
      await resend.emails.send({
        from: 'Snobo Labs <onboarding@resend.dev>',
        to: user.email,
        subject: 'Reset your Snobo Labs password',
        html: `<p>Click below to reset your password. This link expires in 1 hour and can only be used once.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      })
    }

    genericResponse()
  } catch (err) {
    console.error('Forgot password error:', err.message)
    genericResponse() // never leak errors here either — same response even on failure
  }
}

async function resetPassword(req, res) {
  try {
    const { token, userId, newPassword } = req.body
    if (!token || !userId || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const isStrong =
      newPassword.length >= 10 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword)
    if (!isStrong) {
      return res.status(400).json({ message: 'Password does not meet strength requirements' })
    }

    const tokenHash = hashToken(token)
    const resetRecord = await PasswordReset.findOne({
      userId,
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!resetRecord) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired' })

    user.password = newPassword // pre-save hook hashes it, and bumps passwordChangedAt (invalidates old JWTs)
    await user.save()

    resetRecord.used = true // single-use enforcement
    await resetRecord.save()

    res.json({ message: 'Password updated. You can now log in with your new password.' })
  } catch (err) {
    console.error('Reset password error:', err.message)
    res.status(500).json({ message: 'Something went wrong. Please request a new reset link.' })
  }
}

module.exports = { forgotPassword, resetPassword }