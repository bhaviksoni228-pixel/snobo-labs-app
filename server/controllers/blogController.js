const Blog = require('../models/Blog')

async function getPublicBlogs(req, res) {
  try {
    const blogs = await Blog.find({ published: true })
      .select('slug title excerpt coverImage author publishedAt')
      .sort({ publishedAt: -1 })
    res.json({ blogs })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

async function getBlogBySlug(req, res) {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true })
    if (!blog) return res.status(404).json({ message: 'Not found' })
    res.json({ blog })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

async function getAllBlogs(req, res) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 })
    res.json({ blogs })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

async function getBlogById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Not found' })
    res.json({ blog })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

async function createBlog(req, res) {
  try {
    const blog = await Blog.create(req.body)
    res.status(201).json({ blog })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A post with this slug already exists' })
    }
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function updateBlog(req, res) {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!blog) return res.status(404).json({ message: 'Not found' })
    res.json({ blog })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

async function deleteBlog(req, res) {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getPublicBlogs,
  getBlogBySlug,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
}