const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'admin'], default: 'client' },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  // Cost factor 12 — good balance for bcrypt in 2026. Argon2id is preferred long-term (see notes).
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  this.passwordChangedAt = new Date()
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
}

userSchema.methods.registerFailedLogin = async function () {
  this.failedLoginAttempts += 1
  // Progressive lockout: 5 fails = 15 min, 10 fails = 1 hour
  if (this.failedLoginAttempts >= 10) {
    this.lockUntil = new Date(Date.now() + 60 * 60 * 1000)
  } else if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
  }
  await this.save()
}

userSchema.methods.resetFailedLogins = async function () {
  if (this.failedLoginAttempts > 0 || this.lockUntil) {
    this.failedLoginAttempts = 0
    this.lockUntil = null
    await this.save()
  }
}

module.exports = mongoose.models.User || mongoose.model('User', userSchema)