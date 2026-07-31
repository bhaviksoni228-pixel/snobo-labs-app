const { Resend } = require('resend')
const Inquiry = require('../models/Inquiry')

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const SERVICE_NAMES = {
  sites: 'Snobo Sites',
  chat: 'Snobo Chat',
  crm: 'Snobo CRM',
  bots: 'Snobo Bots',
  build: 'Snobo Build',
  'not-sure': 'Not sure yet',
}

const BUDGET_LABELS = {
  'under-10k': 'Under ₹10,000',
  '10k-25k': '₹10,000 – ₹25,000',
  '25k-50k': '₹25,000 – ₹50,000',
  '50k-plus': '₹50,000+',
  'not-sure': 'Not sure yet',
}

async function createInquiry(req, res) {
  try {
    const { name, email, phone, business, service, package: pkg, budget, description, timeline } = req.body

    if (!name || !email || !phone || !service || !description) {
      return res.status(400).json({ message: 'Please fill in all required fields' })
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      business: business || '',
      service,
      package: pkg || '',
      budget: budget || '',
      description,
      timeline: timeline || '',
      userId: req.user?._id || null,
    })

    if (resend) {
      const serviceName = SERVICE_NAMES[service] || service
      const budgetLabel = BUDGET_LABELS[budget] || 'Not specified'
      resend.emails
        .send({
          from: 'Snobo Labs <onboarding@resend.dev>',
          to: process.env.NOTIFY_EMAIL || 'snobolabs@gmail.com',
          subject: `New Hire Request — ${serviceName} from ${name}`,
          html: `
            <h2>New inquiry: ${serviceName}</h2>
            <p><b>Package:</b> ${pkg || 'Not specified'}</p>
            <p><b>Name:</b> ${name}</p>
            <p><b>Business:</b> ${business || 'Not specified'}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone}</p>
            <p><b>Budget:</b> ${budgetLabel}</p>
            <p><b>Timeline:</b> ${timeline || 'Not specified'}</p>
            <p><b>Requirements:</b><br/>${description}</p>
            <hr/>
            <p style="color:#888;font-size:12px;">Payment to be arranged separately — this is a requirements confirmation only.</p>
          `,
        })
        .catch((err) => console.error('Email notify failed:', err.message))

      resend.emails
        .send({
          from: 'Snobo Labs <onboarding@resend.dev>',
          to: email,
          subject: `We got your request — Snobo Labs`,
          html: `
            <p>Hi ${name},</p>
            <p>Thanks for reaching out about <b>${serviceName}</b>${pkg ? ` (${pkg})` : ''}. We've received your requirements and will get back to you shortly — usually within a few hours.</p>
            <p>Payment details will be arranged separately once we confirm everything with you.</p>
            <p>— Snobo Labs</p>
          `,
        })
        .catch((err) => console.error('Confirmation email failed:', err.message))
    }

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function getInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 })
    res.json({ inquiries })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function updateInquiryStatus(req, res) {
  try {
    const { status } = req.body
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' })
    res.json({ inquiry })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function getMyInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json({ inquiries })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { createInquiry, getInquiries, updateInquiryStatus, getMyInquiries }