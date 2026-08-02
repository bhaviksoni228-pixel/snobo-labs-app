const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true }, // markdown or plain paragraphs
    coverImage: { type: String, default: '' },
    author: { type: String, default: 'Bhavik Soni' },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema)