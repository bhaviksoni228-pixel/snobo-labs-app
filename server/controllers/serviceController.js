const Service = require('../models/Service')

// Public: all published services, for homepage list + nav
async function getPublicServices(req, res) {
  try {
    const services = await Service.find({ published: true }).sort({ order: 1 })
    res.json({ services })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Public: single service by slug, for the service detail page
async function getServiceBySlug(req, res) {
  try {
    const service = await Service.findOne({ slug: req.params.slug, published: true })
    if (!service) return res.status(404).json({ message: 'Not found' })
    res.json({ service })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Admin: all services including unpublished
async function getAllServices(req, res) {
  try {
    const services = await Service.find().sort({ order: 1 })
    res.json({ services })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

async function getServiceById(req, res) {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) return res.status(404).json({ message: 'Not found' })
    res.json({ service })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

async function createService(req, res) {
  try {
    const service = await Service.create(req.body)
    res.status(201).json({ service })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A service with this slug already exists' })
    }
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function updateService(req, res) {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!service) return res.status(404).json({ message: 'Not found' })
    res.json({ service })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function deleteService(req, res) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id)
    if (!service) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getPublicServices,
  getServiceBySlug,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
}