import Equipment from '../models/Equipment.js'
import User from '../models/User.js'
import { uploadFile } from '../config/cloudinary.js'

// POST /api/equipment — owner creates listing
export const createEquipment = async (req, res) => {
  try {
    const owner = await User.findById(req.user._id)

    if (owner.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only owners can list equipment' })
    }

    if (owner.kyc.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Complete KYC verification before listing equipment'
      })
    }

    const {
      type, attachments, pricePerAcre, pricePerHour,
      serviceRadius, lng, lat, village, taluka, district,
      specs // ← replaces horsePower, capacity, model, year
    } = req.body

    if (!type || !pricePerAcre || !lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Type, price, and location are required'
      })
    }

    // Validate specs exist for the type
    if (!specs) {
      return res.status(400).json({
        success: false,
        message: 'Equipment specifications are required'
      })
    }

    // Handle photo uploads
    let photos = []
    if (req.files?.photos) {
      if (req.files.photos.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Minimum 3 photos required'
        })
      }
      for (const file of req.files.photos) {
        const url = await uploadFile(file.buffer, 'equipment/photos')
        photos.push(url)
      }
    }

    // Handle document uploads
    let rcUrl, insuranceUrl
    if (req.files?.rc) {
      rcUrl = await uploadFile(req.files.rc[0].buffer, 'equipment/rc')
    }
    if (req.files?.insurance) {
      insuranceUrl = await uploadFile(req.files.insurance[0].buffer, 'equipment/insurance')
    }

    const equipment = await Equipment.create({
      owner: req.user._id,
      type,
      specs: typeof specs === 'string' ? JSON.parse(specs) : specs,
      attachments: attachments ? JSON.parse(attachments) : [],
      photos,
      rcUrl,
      insuranceUrl,
      pricePerAcre: Number(pricePerAcre),
      pricePerHour: pricePerHour ? Number(pricePerHour) : undefined,
      serviceRadius: Number(serviceRadius) || 10,
      location: {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      },
      village,
      taluka,
      district: district || 'Nashik',
      status: 'pending'
    })

    res.status(201).json({
      success: true,
      message: 'Equipment submitted for verification',
      equipment
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/equipment — farmer searches
export const searchEquipment = async (req, res) => {
  try {
    const {
      type, date, lat, lng,
      minPrice, maxPrice, radius
    } = req.query

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Location (lat, lng) is required for search'
      })
    }

    const searchRadius = Number(radius) || 20 // km
    const query = {
      status: 'approved',
    }

    if (type) query.type = type

    if (minPrice || maxPrice) {
      query.pricePerAcre = {}
      if (minPrice) query.pricePerAcre.$gte = Number(minPrice)
      if (maxPrice) query.pricePerAcre.$lte = Number(maxPrice)
    }

    // Geospatial query
    let equipment = await Equipment.find({
      ...query,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: searchRadius * 1000 // convert km to meters
        }
      }
    }).populate('owner', 'name village rating ratingCount trustScore')

    // Filter by date availability if provided
    if (date) {
      const searchDate = new Date(date)
      equipment = equipment.filter(eq => {
        const blocked = eq.availabilityCalendar.find(entry => {
          return (
            new Date(entry.date).toDateString() === searchDate.toDateString() &&
            entry.available === false
          )
        })
        return !blocked
      })
    }

    // Calculate distance for each result
    const results = equipment.map(eq => {
      const [eLng, eLat] = eq.location.coordinates
      const distanceKm = getDistanceKm(
        Number(lat), Number(lng),
        eLat, eLng
      )
      return {
        ...eq.toObject(),
        distanceKm: Math.round(distanceKm * 10) / 10
      }
    })

    // Sort: distance → rating → price
    results.sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm
      if (b.rating !== a.rating) return b.rating - a.rating
      return a.pricePerAcre - b.pricePerAcre
    })

    res.json({ success: true, count: results.length, equipment: results })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/equipment/:id — single equipment detail
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('owner', 'name village taluka rating ratingCount trustScore phone')

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' })
    }

    if (equipment.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Equipment not available' })
    }

    res.json({ success: true, equipment })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/equipment/owner/mine — owner sees own listings
export const getOwnerEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ owner: req.user._id })
      .sort({ createdAt: -1 })

    // Add status tracker to each listing
    const listings = equipment.map(eq => ({
      ...eq.toObject(),
      statusTracker: getStatusTracker(eq.status, eq.rejectionReason)
    }))

    res.json({ success: true, count: listings.length, equipment: listings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/equipment/:id — owner updates listing
export const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      owner: req.user._id
    })

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' })
    }

    // Price change resets to pending for re-verification
    const needsReview = req.body.pricePerAcre &&
      Number(req.body.pricePerAcre) !== equipment.pricePerAcre

    const updateData = { ...req.body }
    if (needsReview) {
      updateData.status = 'pending'
    }

    const updated = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    res.json({
      success: true,
      message: needsReview
        ? 'Price updated — listing sent for re-verification'
        : 'Equipment updated',
      equipment: updated
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /api/equipment/:id — owner deactivates
export const deactivateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      owner: req.user._id
    })

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' })
    }

    await Equipment.findByIdAndUpdate(req.params.id, { status: 'inactive' })

    res.json({ success: true, message: 'Equipment deactivated' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin — GET /api/admin/equipment/queue
export const getEquipmentQueue = async (req, res) => {
  try {
    const queue = await Equipment.find({ status: 'pending' })
      .populate('owner', 'name phone village kyc')
      .sort({ createdAt: 1 })

    res.json({ success: true, count: queue.length, queue })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin — PUT /api/admin/equipment/:id
export const reviewEquipment = async (req, res) => {
  try {
    const { action, reason } = req.body

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' })
    }

    if (action === 'reject' && !reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason required' })
    }

    const equipment = await Equipment.findById(req.params.id)

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' })
    }

    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      verifiedAt: new Date(),
      verifiedBy: req.user._id
    }

    if (action === 'reject') updateData.rejectionReason = reason

    await Equipment.findByIdAndUpdate(req.params.id, updateData)

    res.json({
      success: true,
      message: `Equipment ${action === 'approve' ? 'approved' : 'rejected'}`
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ── Helpers ──────────────────────────────────────────

// Haversine formula — distance between two lat/lng points in km
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const deg2rad = (deg) => deg * (Math.PI / 180)

// Status tracker for owner listing view
const getStatusTracker = (status, rejectionReason) => {
  const steps = [
    {
      step: 1,
      title: 'Listing Submitted',
      titleMr: 'यादी सादर केली',
      done: true
    },
    {
      step: 2,
      title: 'Under Review',
      titleMr: 'तपासणी सुरू',
      done: ['approved', 'rejected'].includes(status)
    },
    {
      step: 3,
      title: 'Approved & Live',
      titleMr: 'मंजूर व सक्रिय',
      done: status === 'approved'
    }
  ]

  return {
    steps,
    currentStatus: status,
    rejectionReason: rejectionReason || null
  }
}