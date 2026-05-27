import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/
  },
  role: {
    type: String,
    enum: ['farmer', 'owner', 'admin'],
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'mr'],
    default: 'mr'
  },
  village: String,
  taluka: String,
  district: {
    type: String,
    default: 'Nashik'
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  isProfileComplete: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  trustScore: { type: Number, default: 50, min: 0, max: 100 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  completedBookings: { type: Number, default: 0 },
  cancellationsThisMonth: { type: Number, default: 0 },
  warnings: { type: Number, default: 0 },
  suspendedUntil: Date,

  // Owner specific
  bankAccount: {
    accountNumber: String,
    ifscCode: String,
    accountName: String,
    verified: { type: Boolean, default: false }
  },
  aadhaarUrl: String,
  panUrl: String,


kyc: {
  status: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  rejectionReason: String,
  submittedAt: Date,
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},

  // Farmer specific
  landSize: Number, // in acres
}, { timestamps: true })

userSchema.index({ location: '2dsphere' })

export default mongoose.model('User', userSchema)