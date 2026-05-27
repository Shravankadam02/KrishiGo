import mongoose from "mongoose"

const payoutSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  grossAmount: { type: Number, required: true },
  commission: { type: Number, required: true },
  penalties: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  weekStart: Date,
  weekEnd: Date,
  processedAt: Date
}, { timestamps: true })

payoutSchema.index({ owner: 1, status: 1 })
payoutSchema.index({ weekStart: 1 })

export default mongoose.model('Payout', payoutSchema)