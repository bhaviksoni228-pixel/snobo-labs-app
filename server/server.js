require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth')
const inquiryRoutes = require('./routes/inquiries')
const portfolioRoutes = require('./routes/portfolio')
const auditRoutes = require('./routes/audit')
const chatRoutes = require('./routes/chat')

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'Snobo Labs API running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/inquiries', inquiryRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/chat', chatRoutes)

// generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Snobo Labs API running on port ${PORT}`))
