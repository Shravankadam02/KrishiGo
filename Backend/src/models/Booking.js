import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  serviceDate: { type: Date, required: true },
  landSize: { type: Number, required: true },
  pricePerAcre: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  commission: { type: Number, required: true },
  ownerEarnings: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed',
           'cancelled_farmer', 'cancelled_owner', 'cancelled_weather',
           'disputed', 'expired'],
    default: 'pending'
  },
  ownerResponseDeadline: Date,
  cancellation: {
    cancelledBy: { type: String, enum: ['farmer', 'owner'] },
    reason: String,
    cancelledAt: Date,
    penalty: Number,
    hoursBeforeService: Number
  },
  advance: {
    required: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    collected: { type: Boolean, default: false },
    forfeited: { type: Boolean, default: false },
    reason: String,
    razorpayOrderId: String,
    razorpayPaymentId: String
  },
  payment: {
    razorpayOrderId: String,
    razorpayPaymentId: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'collected', 'disputed', 'refunded'],
    default: 'pending'
  },
  paymentConfirmedAt: Date,
  paymentMethod: {
  type: String,
  enum: ['cash', 'online'],
  default: 'cash'
},
  farmerRating: {
    equipmentQuality: Number,
    operatorBehavior: Number,
    timeliness: Number,
    overall: Number,
    comment: String,
    submittedAt: Date
  },
  ownerRating: {
    paymentPromptness: Number,
    communication: Number,
    fieldReadiness: Number,
    overall: Number,
    comment: String,
    submittedAt: Date
  },
  completedAt: Date
}, { timestamps: true })

bookingSchema.index({ farmer: 1, status: 1 })
bookingSchema.index({ owner: 1, status: 1 })
bookingSchema.index({ serviceDate: 1 })

export default mongoose.model('Booking', bookingSchema)