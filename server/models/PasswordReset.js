const mongoose = require('mongoose')

const passwordResetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true }, // never store the raw token
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
})

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema)