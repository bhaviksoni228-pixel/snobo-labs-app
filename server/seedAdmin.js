// Run this once to create your admin login: node seedAdmin.js
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)

  const email = 'snobolabs.in@gmail.com'
  const existing = await User.findOne({ email })
  if (existing) {
    console.log('Admin already exists:', email)
    process.exit(0)
  }

  const admin = await User.create({
    name: 'Bhavik',
    email,
    password: 'ChangeThisPassword123', // CHANGE THIS after first login
    role: 'admin',
  })

  console.log('Admin created:', admin.email)
  console.log('Login with password: ChangeThisPassword123 — change it soon.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
