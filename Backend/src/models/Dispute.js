import mongoose from "mongoose"

const disputeSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  filedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filedAgainst: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['equipment_service', 'pricing', 'behavioral', 'force_majeure'],
    required: true
  },
  description: { type: String, required: true },
  evidence: [String], // Cloudinary URLs
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'appealed', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: String,
  ruling: {
    type: String,
    enum: ['farmer_right', 'farmer_partial', 'split', 'owner_right', 'insufficient']
  },
  refundAmount: Number,
  penalty: Number,
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appeal: {
    filedAt: Date,
    additionalEvidence: [String],
    finalRuling: String,
    finalResolvedAt: Date
  }
}, { timestamps: true })

disputeSchema.index({ status: 1 })
disputeSchema.index({ booking: 1 })

export default mongoose.model('Dispute', disputeSchema)