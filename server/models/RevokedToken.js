const mongoose = require('mongoose')

// Stores the jti (unique token ID) of tokens explicitly logged out / revoked before natural expiry.
// TTL index auto-deletes entries once the original token would have expired anyway — keeps this collection small.
const revokedTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
})

revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.models.RevokedToken || mongoose.model('RevokedToken', revokedTokenSchema)