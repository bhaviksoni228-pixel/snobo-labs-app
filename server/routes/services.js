const express = require('express')
const router = express.Router()
const {
  getPublicServices,
  getServiceBySlug,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/', getPublicServices)
router.get('/slug/:slug', getServiceBySlug)

router.get('/admin/all', protect, adminOnly, getAllServices)
router.get('/admin/:id', protect, adminOnly, getServiceById)
router.post('/', protect, adminOnly, createService)
router.patch('/:id', protect, adminOnly, updateService)
router.delete('/:id', protect, adminOnly, deleteService)

module.exports = router