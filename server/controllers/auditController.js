const AuditLead = require('../models/AuditLead')

const { fetchSite } = require('../services/audit/fetchSite')
const { analyzeHtml } = require('../services/audit/analyzeHtml')
const { checkTechnical } = require('../services/audit/technical')
const { buildFindings } = require('../services/audit/findings')
const {
  buildReport,
  formatReportForEmail,
} = require('../services/audit/report')
const {
  sendAuditEmail,
} = require('../services/audit/email')

function normalizeUrl(input) {
  let url = String(input || '').trim()

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  return url
}

async function runAudit(req, res) {
  try {
    const {
      url: rawUrl,
      email,
    } = req.body

    if (!rawUrl || !email) {
      return res.status(400).json({
        message: 'URL and email are required',
      })
    }

    const url = normalizeUrl(rawUrl)

    let parsedUrl

    try {
      parsedUrl = new URL(url)
    } catch {
      return res.status(400).json({
        message: 'Please enter a valid website URL.',
      })
    }

    if (
      !['http:', 'https:'].includes(
        parsedUrl.protocol
      )
    ) {
      return res.status(400).json({
        message:
          'Only HTTP and HTTPS websites can be audited.',
      })
    }

    // -----------------------------------------
    // 1. FETCH WEBSITE
    // -----------------------------------------

    let site

    try {
      site = await fetchSite(url)
    } catch (err) {
      console.error(
        'Audit fetch error:',
        err.message
      )

      return res.status(400).json({
        message:
          `Couldn't reach that site. Double-check the URL and try again. (${err.message})`,
      })
    }

    // -----------------------------------------
    // 2. ANALYZE HTML
    // -----------------------------------------

    const signals = analyzeHtml(
      site.html,
      site
    )

    // -----------------------------------------
    // 3. TECHNICAL SEO CHECKS
    // -----------------------------------------

    let technical = {
      robotsTxt: {
        reachable: false,
        status: null,
        content: '',
      },
      sitemap: {
        reachable: false,
        status: null,
        url: null,
      },
    }

    try {
      technical =
        await checkTechnical(
          site.finalUrl
        )
    } catch (err) {
      console.error(
        'Technical audit error:',
        err.message
      )
    }

    // -----------------------------------------
    // 4. BUILD EVIDENCE-BASED FINDINGS
    // -----------------------------------------

    const findings =
      buildFindings(
        signals,
        technical,
        null
      )

    // -----------------------------------------
    // 5. BUILD STRUCTURED REPORT
    // -----------------------------------------

    const report =
      buildReport({
        signals,
        technical,
        findings,
        pageSpeed: null,
      })

    // -----------------------------------------
    // 6. CREATE EMAIL VERSION
    // -----------------------------------------

    report.emailText =
      formatReportForEmail(report)

    // -----------------------------------------
    // 7. SAVE AUDIT
    // -----------------------------------------

    const audit =
      await AuditLead.create({
        url,
        email,
        report: report.emailText,
        signals: {
          ...signals,
          technical,
          score: report.score,
          grade: report.grade,
        },
      })

    // -----------------------------------------
    // 8. SEND EMAIL
    // -----------------------------------------

    let emailResult = null
    let emailError = null

    try {
      emailResult =
        await sendAuditEmail({
          to: email,
          report,
        })
    } catch (err) {
      emailError = err.message

      console.error(
        'Audit email error:',
        err.message
      )
    }

    // -----------------------------------------
    // 9. RESPONSE
    // -----------------------------------------

    return res.json({
      success: true,

      auditId:
        audit._id,

      report:
        report.emailText,

      audit: report,

      signals: {
        ...signals,
        technical,
      },

      email: {
        sent:
          Boolean(emailResult?.sent),

        error:
          emailError,
      },
    })
  } catch (err) {
    console.error(
      'Audit controller error:',
      err
    )

    return res.status(500).json({
      message:
        'Server error while running the audit.',
      error:
        err.message,
    })
  }
}

async function getAuditLeads(req, res) {
  try {
    const leads =
      await AuditLead
        .find()
        .sort({
          createdAt: -1,
        })

    return res.json({
      leads,
    })
  } catch (err) {
    console.error(
      'Get audit leads error:',
      err.message
    )

    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    })
  }
}

module.exports = {
  runAudit,
  getAuditLeads,
}