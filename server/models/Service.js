const mongoose = require('mongoose')

const pricingTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    priceNote: { type: String, default: '' },
    description: { type: String, default: '' },
    checks: [{ type: String }],
    popular: { type: Boolean, default: false },
  },
  { _id: false }
)

const faqItemSchema = new mongoose.Schema(
  {
    q: { type: String, required: true },
    a: { type: String, required: true },
  },
  { _id: false }
)

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    hook: { type: String, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    howItWorks: [{ type: String }],
    pricing: [pricingTierSchema],
    faq: [faqItemSchema],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema)