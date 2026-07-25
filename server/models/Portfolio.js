const mongoose = require('mongoose')

const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tag: { type: String, default: 'Demo' }, // e.g. "Demo", "Client Work"
    link: { type: String, default: '' }, // URL to live demo, if any
    imageUrl: { type: String, default: '' },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // for manual sort control
  },
  { timestamps: true }
)

module.exports = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema)
