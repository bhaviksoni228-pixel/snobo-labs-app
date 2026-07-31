const mongoose = require('mongoose')

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    business: { type: String, default: '', trim: true },
    service: {
      type: String,
      required: true,
      enum: ['sites', 'chat', 'crm', 'bots', 'build', 'not-sure'],
    },
    package: { type: String, default: '' },
    budget: {
      type: String,
      enum: ['under-10k', '10k-25k', '25k-50k', '50k-plus', 'not-sure', ''],
      default: '',
    },
    description: { type: String, required: true },
    timeline: {
      type: String,
      enum: ['asap', 'within-month', 'exploring', ''],
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'closed'],
      default: 'new',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema)