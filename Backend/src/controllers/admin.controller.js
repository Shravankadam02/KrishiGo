import User from '../models/User.js'
import Equipment from '../models/Equipment.js'
import Booking from '../models/Booking.js'
import Dispute from '../models/Dispute.js'
import Payout from '../models/Payout.js'

// GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    const [
      totalFarmers,
      totalOwners,
      totalEquipment,
      pendingKYC,
      pendingEquipment,
      openDisputes,
      totalBookings,
      completedBookings,
      weeklyBookings
    ] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'owner' }),
      Equipment.countDocuments({ status: 'approved' }),
      User.countDocuments({ 'kyc.status': 'pending' }),
      Equipment.countDocuments({ status: 'pending' }),
      Dispute.countDocuments({ status: 'open' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.find({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }).select('totalPrice status')
    ])

    // Weekly GMV
    const weeklyGMV = weeklyBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0)

    // Weekly commission earned
    const weeklyCommission = weeklyBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalPrice * 0.1), 0)

    res.json({
      success: true,
      dashboard: {
        users: { farmers: totalFarmers, owners: totalOwners },
        equipment: { active: totalEquipment, pendingVerification: pendingEquipment },
        bookings: { total: totalBookings, completed: completedBookings },
        disputes: { open: openDisputes },
        kyc: { pending: pendingKYC },
        weekly: {
          gmv: weeklyGMV,
          commission: Math.round(weeklyCommission),
          bookings: weeklyBookings.length
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query

    const query = {}
    if (role) query.role = role
    if (status === 'suspended') query.suspendedUntil = { $gt: new Date() }
    if (status === 'inactive') query.isActive = false
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-bankAccount.accountNumber -aadhaarUrl -panUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ])

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/admin/users/:id/suspend
export const suspendUser = async (req, res) => {
  try {
    const { days, reason } = req.body

    if (!days || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Suspension duration and reason are required'
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot suspend admin' })
    }

    const suspendedUntil = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000)

    await User.findByIdAndUpdate(req.params.id, {
      suspendedUntil,
      $inc: { warnings: 1 }
    })

    res.json({
      success: true,
      message: `User suspended for ${days} days`,
      suspendedUntil
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/admin/users/:id/activate
export const activateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      isActive: true,
      suspendedUntil: null
    })

    res.json({ success: true, message: 'User activated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/admin/disputes
export const getDisputes = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query

    const query = {}
    if (status) query.status = status
    if (priority) query.priority = priority

    const skip = (Number(page) - 1) * Number(limit)

    const [disputes, total] = await Promise.all([
      Dispute.find(query)
        .populate('booking', 'serviceDate totalPrice equipment')
        .populate('filedBy', 'name phone role')
        .populate('filedAgainst', 'name phone role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Dispute.countDocuments(query)
    ])

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      disputes
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/admin/disputes/:id/resolve
export const resolveDispute = async (req, res) => {
  try {
    const { ruling, refundAmount, penalty, adminNotes } = req.body

    const validRulings = ['farmer_right', 'farmer_partial', 'split', 'owner_right', 'insufficient']

    if (!ruling || !validRulings.includes(ruling)) {
      return res.status(400).json({
        success: false,
        message: `Ruling must be one of: ${validRulings.join(', ')}`
      })
    }

    const dispute = await Dispute.findById(req.params.id)

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' })
    }

    if (dispute.status === 'resolved') {
      return res.status(400).json({ success: false, message: 'Dispute already resolved' })
    }

    await Dispute.findByIdAndUpdate(req.params.id, {
      status: 'resolved',
      ruling,
      refundAmount: refundAmount || 0,
      penalty: penalty || 0,
      adminNotes,
      resolvedAt: new Date(),
      resolvedBy: req.user._id
    })

    // Update booking status back to completed
    await Booking.findByIdAndUpdate(dispute.booking, {
      status: 'completed'
    })

    res.json({ success: true, message: 'Dispute resolved successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/admin/payouts
export const getPayouts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const query = {}
    if (status) query.status = status

    const skip = (Number(page) - 1) * Number(limit)

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .populate('owner', 'name phone village bankAccount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payout.countDocuments(query)
    ])

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      payouts
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/admin/payouts/:id
export const processPayout = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id)

    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout not found' })
    }

    if (payout.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Payout already processed' })
    }

    await Payout.findByIdAndUpdate(req.params.id, {
      status: 'paid',
      processedAt: new Date()
    })

    res.json({ success: true, message: 'Payout marked as paid' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/admin/payouts/generate — generate weekly payouts
export const generatePayouts = async (req, res) => {
  try {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Get all completed bookings this week not yet in a payout
    const completedBookings = await Booking.find({
      status: 'completed',
      paymentStatus: 'collected',
      completedAt: { $gte: weekStart, $lte: weekEnd }
    })

    if (completedBookings.length === 0) {
      return res.json({ success: true, message: 'No bookings to process this week' })
    }

    // Group by owner
    const ownerMap = {}
    for (const booking of completedBookings) {
      const ownerId = booking.owner.toString()
      if (!ownerMap[ownerId]) ownerMap[ownerId] = []
      ownerMap[ownerId].push(booking)
    }

    const payouts = []
    for (const [ownerId, bookings] of Object.entries(ownerMap)) {
      const grossAmount = bookings.reduce((sum, b) => sum + b.totalPrice, 0)
      const commission = bookings.reduce((sum, b) => sum + b.commission, 0)
      const netAmount = grossAmount - commission

      const payout = await Payout.create({
        owner: ownerId,
        bookings: bookings.map(b => b._id),
        grossAmount,
        commission,
        penalties: 0,
        netAmount,
        weekStart,
        weekEnd,
        status: 'pending'
      })

      payouts.push(payout)
    }

    res.json({
      success: true,
      message: `Generated ${payouts.length} payouts`,
      payouts
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query
    const days = Number(period)

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [bookingTrend, topEquipment, locationBreakdown] = await Promise.all([
      // Daily booking counts
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            gmv: { $sum: '$totalPrice' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Top equipment by bookings
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$equipment', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'equipment', localField: '_id', foreignField: '_id', as: 'equipment' } },
        { $unwind: '$equipment' },
        { $project: { 'equipment.type': 1, 'equipment.village': 1, count: 1, revenue: 1 } }
      ]),

      // Bookings by taluka
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $lookup: {
            from: 'equipment',
            localField: 'equipment',
            foreignField: '_id',
            as: 'equipmentData'
          }
        },
        { $unwind: '$equipmentData' },
        {
          $group: {
            _id: '$equipmentData.taluka',
            bookings: { $sum: 1 },
            gmv: { $sum: '$totalPrice' }
          }
        },
        { $sort: { bookings: -1 } }
      ])
    ])

    res.json({
      success: true,
      analytics: {
        bookingTrend,
        topEquipment,
        locationBreakdown
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}