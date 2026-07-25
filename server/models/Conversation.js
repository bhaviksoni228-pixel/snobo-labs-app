const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { _id: false }
)

const conversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    messages: [messageSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema)
