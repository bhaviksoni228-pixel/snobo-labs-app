require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth')
const inquiryRoutes = require('./routes/inquiries')
const portfolioRoutes = require('./routes/portfolio')
const auditRoutes = require('./routes/audit')
const chatRoutes = require('./routes/chat')

const app = express()

connectDB()

app.set('trust proxy', 1) // required for correct client IPs behind Render/Vercel proxies (rate limiting depends on this)

app.use(helmet())

const ALLOWED_ORIGINS = [
  'https://snobolabs.in',
  'https://www.snobolabs.in',
  'https://snobo-labs-app.vercel.app',
  'http://localhost:3000',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true, // required for httpOnly cookies to be sent cross-origin (frontend/backend are separate domains)
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.json({ status: 'Snobo Labs API running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/inquiries', inquiryRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/chat', chatRoutes)

// generic error handler — never leak internals to the client
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Snobo Labs API running on port ${PORT}`))