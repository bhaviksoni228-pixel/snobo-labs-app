const mongoose = require('mongoose')

// Flexible key-value store for editable text blocks across the site
// (hero headline, manifesto text, footer text, etc.) — one document per section key.
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "hero", "manifesto", "footer"
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.models.SiteContent || mongoose.model('SiteContent', siteContentSchema)