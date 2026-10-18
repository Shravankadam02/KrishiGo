import Booking from '../models/Booking.js'
import Equipment from '../models/Equipment.js'
import User from '../models/User.js'
import Dispute from '../models/Dispute.js'
import { uploadFile } from '../config/cloudinary.js'
import {
  calculateCommission,
  checkAdvanceRequired,
  calculateCancellationPenalty,
  toAcres
} from '../utils/booking.js'
import { sendTransactionalSMS } from '../utils/sms.js'

// POST /api/bookings — farmer creates booking
export const createBooking = async (req, res) => {
  try {
    const { equipmentId, serviceDate, landSize, landUnit, paymentMethod } = req.body

    if (!equipmentId || !serviceDate || !landSize) {
      return res.status(400).json({
        success: false,
        message: 'Equipment, service date and land size are required'
      })
    }

    if (Number(landSize) <= 0) {
      return res.status(400).json({ success: false, message: 'Land size must be a positive number' })
    }

    // Check profile complete
    if (!req.user.isProfileComplete) {
      return res.status(403).json({
        success: false,
        message: 'Complete your profile before booking',
        redirectTo: '/complete-profile'
      })
    }

    const equipment = await Equipment.findById(equipmentId)

    if (!equipment || equipment.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Equipment not available' })
    }

    // Normalize to start of day in IST (UTC+5:30)
    let bookingDate = new Date(serviceDate)
    bookingDate.setUTCHours(0, 0, 0, 0)
    // Actually, to align strictly to IST start of day, we need to subtract the 5h30m offset from midnight UTC or manipulate it properly.
    // The prompt says: Normalize serviceDate to the start of the day (in IST)
    // A simple way is to parse the local date string "YYYY-MM-DD" as a UTC date and just assume it represents the start of the day. 
    // Or we can shift by 5.5 hours. Since it's saved in DB as UTC, if we just do `new Date(serviceDate + 'T00:00:00+05:30')` it works.
    
    // Let's use the Date constructor properly
    const dateStr = bookingDate.toISOString().split('T')[0] // Get YYYY-MM-DD
    bookingDate = new Date(`${dateStr}T00:00:00+05:30`)

    if (bookingDate < new Date(new Date().setUTCHours(0,0,0,0))) {
      return res.status(400).json({ success: false, message: 'Service date cannot be in the past' })
    }

    const isBlocked = equipment.availabilityCalendar.find(entry =>
      new Date(entry.date).toDateString() === bookingDate.toDateString() &&
      entry.available === false
    )

    if (isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'Equipment not available on this date'
      })
    }

    // Calculate price
    const acres = toAcres(Number(landSize), landUnit || 'acres')
    const totalPrice = Math.round(acres * equipment.pricePerAcre)
    const { commission, ownerEarnings } = calculateCommission(totalPrice)

    // Check advance requirement
    const farmer = await User.findById(req.user._id)
    const advance = checkAdvanceRequired(farmer, totalPrice)

    // Set owner response deadline (6 hours)
    const ownerResponseDeadline = new Date(Date.now() + 6 * 60 * 60 * 1000)

    const booking = await Booking.create({
      farmer: req.user._id,
      owner: equipment.owner,
      equipment: equipmentId,
      serviceDate: bookingDate,
      landSize: acres,
      pricePerAcre: equipment.pricePerAcre,
      totalPrice,
      commission,
      ownerEarnings,
      ownerResponseDeadline,
      advance: {
        required: advance.required,
        amount: advance.amount,
        reason: advance.reason,
        collected: false
      },
      status: 'pending',
      paymentMethod: paymentMethod || 'cash'
    })

    await booking.populate([
      { path: 'equipment', select: 'type model photos' },
      { path: 'owner', select: 'name phone village' }
    ])

    await sendTransactionalSMS(booking.owner.phone, 'new_booking', {
      farmerName: req.user.name || 'A farmer',
      equipment: equipment.type,
      date: bookingDate.toDateString()
    })

    res.status(201).json({
      success: true,
      message: 'Booking request submitted',
      booking,
      advanceRequired: advance.required,
      advanceAmount: advance.amount,
      advanceReason: advance.reason
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Equipment already booked on this date' })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/bookings/farmer/mine
export const getFarmerBookings = async (req, res) => {
  try {
    const { status } = req.query

    const query = { farmer: req.user._id }
    if (status) query.status = status

    const bookings = await Booking.find(query)
      .populate('equipment', 'type model photos village')
      .populate('owner', 'name phone village')
      .sort({ createdAt: -1 })

    const processed = bookings.map(b => {
      const obj = b.toObject()
      if (obj.status === 'pending') {
        if (obj.owner) delete obj.owner.phone
      }
      if (obj.status === 'confirmed' && obj.advance?.required && !obj.advance?.collected) {
        if (obj.owner) delete obj.owner.phone
      }
      return obj
    })

    res.json({ success: true, count: processed.length, bookings: processed })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/bookings/owner/mine
export const getOwnerBookings = async (req, res) => {
  try {
    const { status } = req.query

    const query = { owner: req.user._id }
    if (status) query.status = status

    const bookings = await Booking.find(query)
      .populate('equipment', 'type model photos')
      .populate('farmer', 'name phone village landSize trustScore')
      .sort({ createdAt: -1 })

    const processed = bookings.map(b => {
      const obj = b.toObject()
      if (obj.status === 'pending') {
        if (obj.farmer) delete obj.farmer.phone
      }
      return obj
    })

    res.json({ success: true, count: processed.length, bookings: processed })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('equipment', 'type model photos pricePerAcre village taluka')
      .populate('farmer', 'name phone village landSize trustScore rating')
      .populate('owner', 'name phone village rating')

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    // Only allow farmer, owner, or admin to view
    const userId = req.user._id.toString()
    const isAllowed =
      booking.farmer._id.toString() === userId ||
      booking.owner._id.toString() === userId ||
      req.user.role === 'admin'

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const obj = booking.toObject()
    const isFarmerView = obj.farmer._id.toString() === userId
    const isOwnerView = obj.owner._id.toString() === userId

    if (obj.status === 'pending') {
      if (isFarmerView && obj.owner) delete obj.owner.phone
      if (isOwnerView && obj.farmer) delete obj.farmer.phone
    }

    if (obj.status === 'confirmed' && obj.advance?.required && !obj.advance?.collected) {
      if (isFarmerView && obj.owner) delete obj.owner.phone
    }

    res.json({ success: true, booking: obj })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/bookings/:id/accept — owner accepts
export const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      owner: req.user._id,
      status: 'pending'
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already processed'
      })
    }

    // Check response deadline
    if (new Date() > booking.ownerResponseDeadline) {
      await Booking.findByIdAndUpdate(booking._id, { status: 'expired' })
      return res.status(400).json({
        success: false,
        message: 'Response deadline passed. Booking expired.'
      })
    }

    // Block date on equipment calendar
    await Equipment.findByIdAndUpdate(booking.equipment, {
      $push: {
        availabilityCalendar: {
          date: booking.serviceDate,
          available: false
        }
      }
    })

    await Booking.findByIdAndUpdate(booking._id, { status: 'confirmed' })

    const farmer = await User.findById(booking.farmer)
    await sendTransactionalSMS(farmer.phone, 'booking_accepted', {
      equipment: booking.equipment.type || 'Equipment',
      date: booking.serviceDate.toDateString()
    })

    res.json({ success: true, message: 'Booking confirmed' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/bookings/:id/reject — owner rejects
export const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body

    const booking = await Booking.findOne({
      _id: req.params.id,
      owner: req.user._id,
      status: 'pending'
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already processed'
      })
    }

    await Booking.findByIdAndUpdate(booking._id, {
      status: 'cancelled_owner',
      'cancellation.cancelledBy': 'owner',
      'cancellation.reason': reason || 'Rejected by owner',
      'cancellation.cancelledAt': new Date(),
      'cancellation.penalty': 0
    })

    res.json({ success: true, message: 'Booking rejected' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/bookings/:id/cancel — farmer or owner cancels
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    const userId = req.user._id.toString()
    const isFarmer = booking.farmer.toString() === userId
    const isOwner = booking.owner.toString() === userId

    if (!isFarmer && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that is already completed or cancelled'
      })
    }

    if (isOwner && booking.status === 'confirmed' && booking.advance?.collected) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel after advance is collected. Contact support.'
      })
    }

    const cancelledBy = isFarmer ? 'farmer' : 'owner'
    const { penalty, ratingDrop } = calculateCancellationPenalty(
      booking, cancelledBy, new Date()
    )

    const hoursUntilService =
      (new Date(booking.serviceDate) - new Date()) / (1000 * 60 * 60)

    const newStatus = isFarmer ? 'cancelled_farmer' : 'cancelled_owner'

    await Booking.findByIdAndUpdate(booking._id, {
      status: newStatus,
      'cancellation.cancelledBy': cancelledBy,
      'cancellation.reason': reason || 'No reason provided',
      'cancellation.cancelledAt': new Date(),
      'cancellation.penalty': penalty,
      'cancellation.hoursBeforeService': Math.round(hoursUntilService)
    })

    // Apply rating drop if any
    if (ratingDrop > 0) {
      const userToUpdate = isFarmer ? booking.farmer : booking.owner
      await User.findByIdAndUpdate(userToUpdate, {
        $inc: { rating: -ratingDrop, cancellationsThisMonth: 1 }
      })
    } else {
      // If there is no rating drop, we should not increment cancellationsThisMonth
    }

    // Unblock date on equipment calendar
    await Equipment.findByIdAndUpdate(booking.equipment, {
      $pull: {
        availabilityCalendar: { date: booking.serviceDate }
      }
    })

    res.json({
      success: true,
      message: 'Booking cancelled',
      penalty,
      penaltyMessage: penalty > 0
        ? `A penalty of ₹${penalty} applies for late cancellation`
        : 'No penalty applied'
    })

    // Notify victim
    const victimUser = isFarmer ? await User.findById(booking.owner) : await User.findById(booking.farmer)
    await sendTransactionalSMS(victimUser.phone, 'booking_cancelled', {
      by: isFarmer ? 'Farmer' : 'Owner',
      date: booking.serviceDate.toDateString()
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/bookings/:id/complete — owner marks job done
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      owner: req.user._id,
      status: 'confirmed'
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not in confirmed state'
      })
    }

    if (booking.paymentStatus === 'collected') {
      await Booking.findByIdAndUpdate(booking._id, {
        status: 'completed',
        completedAt: new Date()
      })
      await Equipment.findByIdAndUpdate(booking.equipment, { $inc: { totalBookings: 1 } })
      await User.findByIdAndUpdate(booking.farmer, { $inc: { totalBookings: 1, completedBookings: 1 } })
      await User.findByIdAndUpdate(booking.owner, { $inc: { totalBookings: 1, completedBookings: 1 } })
      return res.json({ success: true, message: 'Job and payment completed.' })
    }

    await Booking.findByIdAndUpdate(booking._id, {
      status: 'in_progress',
      completedAt: new Date()
    })

    // Update equipment total bookings
    await Equipment.findByIdAndUpdate(booking.equipment, {
      $inc: { totalBookings: 1 }
    })

    res.json({ success: true, message: 'Job marked as completed. Awaiting payment confirmation.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/bookings/:id/payment — owner confirms cash received
export const confirmPayment = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      owner: req.user._id,
      status: 'in_progress'
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or payment already confirmed'
      })
    }

    await Booking.findByIdAndUpdate(booking._id, {
      status: 'completed',
      paymentStatus: 'collected',
      paymentConfirmedAt: new Date()
    })

    // Update user stats
    await User.findByIdAndUpdate(booking.farmer, {
      $inc: { totalBookings: 1, completedBookings: 1 }
    })
    await User.findByIdAndUpdate(booking.owner, {
      $inc: { totalBookings: 1, completedBookings: 1 }
    })

    res.json({ success: true, message: 'Payment confirmed. Booking completed.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/bookings/:id/rate — farmer or owner submits rating
export const submitRating = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    const userId = req.user._id.toString()
    const isFarmer = booking.farmer.toString() === userId
    const isOwner = booking.owner.toString() === userId

    if (!isFarmer && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    // Determine if rating is allowed based on status and who cancelled
    let canRate = false
    if (booking.status === 'completed') {
      canRate = true
    } else if (booking.status === 'cancelled_farmer' && isOwner) {
      canRate = true
    } else if (booking.status === 'cancelled_owner' && isFarmer) {
      canRate = true
    }

    if (!canRate) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rate this booking. Only completed bookings or victims of a cancellation can rate.'
      })
    }

    const { overall, comment, ...dimensions } = req.body

    if (!overall || overall < 1 || overall > 5) {
      return res.status(400).json({
        success: false,
        message: 'Overall rating (1-5) is required'
      })
    }

    if (isFarmer) {
      if (booking.farmerRating?.submittedAt) {
        return res.status(400).json({ success: false, message: 'Already rated' })
      }

      await Booking.findByIdAndUpdate(booking._id, {
        farmerRating: {
          ...dimensions,
          overall,
          comment,
          submittedAt: new Date()
        }
      })

      // Update equipment rating
      const equipment = await Equipment.findById(booking.equipment)
      const newCount = equipment.ratingCount + 1
      const newRating = ((equipment.rating * equipment.ratingCount) + overall) / newCount

      await Equipment.findByIdAndUpdate(booking.equipment, {
        rating: Math.round(newRating * 10) / 10,
        ratingCount: newCount
      })

      // Update owner rating
      const owner = await User.findById(booking.owner)
      const ownerNewCount = owner.ratingCount + 1
      const ownerNewRating = ((owner.rating * owner.ratingCount) + overall) / ownerNewCount

      await User.findByIdAndUpdate(booking.owner, {
        rating: Math.round(ownerNewRating * 10) / 10,
        ratingCount: ownerNewCount
      })
    }

    if (isOwner) {
      if (booking.ownerRating?.submittedAt) {
        return res.status(400).json({ success: false, message: 'Already rated' })
      }

      await Booking.findByIdAndUpdate(booking._id, {
        ownerRating: {
          ...dimensions,
          overall,
          comment,
          submittedAt: new Date()
        }
      })

      // Update farmer rating
      const farmer = await User.findById(booking.farmer)
      const farmerNewCount = farmer.ratingCount + 1
      const farmerNewRating = ((farmer.rating * farmer.ratingCount) + overall) / farmerNewCount

      await User.findByIdAndUpdate(booking.farmer, {
        rating: Math.round(farmerNewRating * 10) / 10,
        ratingCount: farmerNewCount
      })
    }

    res.json({ success: true, message: 'Rating submitted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/bookings/:id/dispute — file a dispute
export const fileDispute = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    const userId = req.user._id.toString()
    const isFarmer = booking.farmer.toString() === userId
    const isOwner = booking.owner.toString() === userId

    if (!isFarmer && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const { type, description } = req.body

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Dispute type and description are required'
      })
    }

    // Upload evidence if any
    let evidence = []
    if (req.files?.evidence) {
      for (const file of req.files.evidence) {
        const url = await uploadFile(file.buffer, 'disputes/evidence')
        evidence.push(url)
      }
    }

    const filedAgainst = isFarmer ? booking.owner : booking.farmer

    const dispute = await Dispute.create({
      booking: booking._id,
      filedBy: req.user._id,
      filedAgainst,
      type,
      description,
      evidence,
      status: 'open'
    })

    await Booking.findByIdAndUpdate(booking._id, { status: 'disputed' })

    res.status(201).json({ success: true, message: 'Dispute filed successfully', dispute })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}