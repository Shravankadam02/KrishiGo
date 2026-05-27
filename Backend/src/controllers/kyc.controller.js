import User from '../models/User.js'
import { uploadFile } from '../config/cloudinary.js'

// POST /api/kyc/submit
export const submitKYC = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only owners can submit KYC' })
    }

    if (['pending', 'approved'].includes(user.kyc.status)) {
      return res.status(400).json({
        success: false,
        message: `KYC already ${user.kyc.status}`
      })
    }

    const { accountNumber, ifscCode, accountName } = req.body

    if (!accountNumber || !ifscCode || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'Bank account details are required'
      })
    }

    if (!req.files?.aadhaar || !req.files?.pan) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar and PAN documents are required'
      })
    }

    // Upload to Cloudinary
    const aadhaarUrl = await uploadFile(
      req.files.aadhaar[0].buffer,
      'kyc/aadhaar'
    )
    const panUrl = await uploadFile(
      req.files.pan[0].buffer,
      'kyc/pan'
    )

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      aadhaarUrl,
      panUrl,
      bankAccount: {
        accountNumber,
        ifscCode,
        accountName,
        verified: false
      },
      'kyc.status': 'pending',
      'kyc.submittedAt': new Date()
    })

    res.json({
      success: true,
      message: 'KYC submitted successfully. Awaiting admin verification.'
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/kyc/status
export const getKYCStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('kyc aadhaarUrl panUrl bankAccount name phone')

    // Build step tracker
    const steps = [
      {
        step: 1,
        title: 'Profile Complete',
        titleMr: 'प्रोफाइल पूर्ण',
        done: user.isProfileComplete
      },
      {
        step: 2,
        title: 'Documents Submitted',
        titleMr: 'कागदपत्रे सादर केली',
        done: ['pending', 'approved'].includes(user.kyc.status)
      },
      {
        step: 3,
        title: 'KYC Under Review',
        titleMr: 'KYC तपासणी सुरू',
        done: ['pending', 'approved'].includes(user.kyc.status)
      },
      {
        step: 4,
        title: 'KYC Approved',
        titleMr: 'KYC मंजूर',
        done: user.kyc.status === 'approved'
      }
    ]

    res.json({
      success: true,
      kyc: {
        status: user.kyc.status,
        submittedAt: user.kyc.submittedAt,
        verifiedAt: user.kyc.verifiedAt,
        rejectionReason: user.kyc.rejectionReason
      },
      steps
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/admin/kyc/:userId — admin approves or rejects
export const reviewKYC = async (req, res) => {
  try {
    const { action, reason } = req.body
    const { userId } = req.params

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' })
    }

    if (action === 'reject' && !reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (user.kyc.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'No pending KYC for this user' })
    }

    const updateData = {
      'kyc.status': action === 'approve' ? 'approved' : 'rejected',
      'kyc.verifiedAt': new Date(),
      'kyc.verifiedBy': req.user._id
    }

    if (action === 'reject') {
      updateData['kyc.rejectionReason'] = reason
    }

    await User.findByIdAndUpdate(userId, updateData)

    res.json({
      success: true,
      message: `KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/admin/kyc — pending KYC queue
export const getKYCQueue = async (req, res) => {
  try {
    const queue = await User.find({ 'kyc.status': 'pending' })
      .select('name phone village taluka aadhaarUrl panUrl bankAccount kyc createdAt')
      .sort({ 'kyc.submittedAt': 1 }) // oldest first

    res.json({ success: true, count: queue.length, queue })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}