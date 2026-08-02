const express = require('express')
const router = express.Router()
const {
  getPublicBlogs,
  getBlogBySlug,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/', getPublicBlogs)
router.get('/slug/:slug', getBlogBySlug)

router.get('/admin/all', protect, adminOnly, getAllBlogs)
router.get('/admin/:id', protect, adminOnly, getBlogById)
router.post('/', protect, adminOnly, createBlog)
router.patch('/:id', protect, adminOnly, updateBlog)
router.delete('/:id', protect, adminOnly, deleteBlog)

module.exports = router