const mongoose = require('mongoose')

const auditLeadSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    report: { type: String, default: '' },
    signals: { type: Object, default: {} },
  },
  { timestamps: true }
)

module.exports = mongoose.models.AuditLead || mongoose.model('AuditLead', auditLeadSchema)
