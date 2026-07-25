const express = require('express')
const router = express.Router()
const { sendMessage, getConversations } = require('../controllers/chatController')
const { protect, adminOnly } = require('../middleware/auth')

router.post('/', sendMessage)
router.get('/', protect, adminOnly, getConversations)

module.exports = router
