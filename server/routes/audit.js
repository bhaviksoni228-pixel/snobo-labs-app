const express = require('express')
const router = express.Router()
const { runAudit, getAuditLeads } = require('../controllers/auditController')
const { protect, adminOnly } = require('../middleware/auth')

router.post('/', runAudit)
router.get('/', protect, adminOnly, getAuditLeads)

module.exports = router
