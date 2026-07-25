const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' },
    service: {
      type: String,
      required: true,
      enum: ['sites', 'chat', 'crm', 'bots', 'build'],
    },
    package: { type: String, default: '' },
    price: { type: Number, default: 0 },
    isRetainer: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema)
