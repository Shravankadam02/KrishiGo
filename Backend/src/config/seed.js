import mongoose from 'mongoose'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    // If user exists with this phone, just update role to admin
    const existing = await User.findOne({ phone: process.env.ADMIN_PHONE })

    if (existing) {
      await User.findByIdAndUpdate(existing._id, {
        role: 'admin',
        name: 'KrishiGo Admin',
        isProfileComplete: true,
        isActive: true,
        trustScore: 100,
        'kyc.status': 'approved',
        'kyc.verifiedAt': new Date()
      })
      console.log('Existing user updated to admin successfully')
      process.exit(0)
    }

    await User.create({
      phone: process.env.ADMIN_PHONE,
      name: 'KrishiGo Admin',
      role: 'admin',
      isProfileComplete: true,
      isActive: true,
      trustScore: 100,
      kyc: {
        status: 'approved',
        verifiedAt: new Date()
      }
    })

    console.log('Admin seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error.message)
    process.exit(1)
  }
}

seedAdmin()