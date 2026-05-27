import mongoose from "mongoose"

const equipmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['tractor_plowing', 'tractor_rotavator', 'harvester_wheat',
      'harvester_paddy', 'seed_drill', 'sprayer', 'baler', 'other'],
    required: true
  },
  model: String,
  year: Number,
  specs: {
    type: mongoose.Schema.Types.Mixed // stores any key-value spec pairs
  },
  attachments: [String],
  photos: [String], // Cloudinary URLs, min 3
  rcUrl: String,
  insuranceUrl: String,
  insuranceExpiry: Date,
  pricePerAcre: { type: Number, required: true },
  pricePerHour: Number,
  serviceRadius: { type: Number, min: 5, max: 20, default: 10 }, // km
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  village: String,
  taluka: String,
  district: { type: String, default: 'Nashik' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'inactive', 'suspended'],
    default: 'pending'
  },
  rejectionReason: String,
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  completionRate: { type: Number, default: 100 },
  totalBookings: { type: Number, default: 0 },
  availabilityCalendar: [{
    date: Date,
    available: { type: Boolean, default: true }
  }]
}, { timestamps: true })

equipmentSchema.index({ location: '2dsphere' })
equipmentSchema.index({ type: 1, status: 1 })

export default mongoose.model('Equipment', equipmentSchema)