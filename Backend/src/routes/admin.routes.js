import express from 'express'
import {
  getDashboard,
  getUsers,
  suspendUser,
  activateUser,
  getDisputes,
  resolveDispute,
  getPayouts,
  processPayout,
  generatePayouts,
  getAnalytics
} from '../controllers/admin.controller.js'
import {
  getKYCQueue,
  reviewKYC
} from '../controllers/kyc.controller.js'
import {
  getEquipmentQueue,
  reviewEquipment
} from '../controllers/equipment.controller.js'
import { protect, restrictTo } from '../middlewares/auth.js'

const router = express.Router()

// All admin routes protected
router.use(protect, restrictTo('admin'))

// Dashboard
router.get('/dashboard', getDashboard)

// Analytics
router.get('/analytics', getAnalytics)

// Users
router.get('/users', getUsers)
router.put('/users/:id/suspend', suspendUser)
router.put('/users/:id/activate', activateUser)

// KYC
router.get('/kyc', getKYCQueue)
router.put('/kyc/:userId', reviewKYC)

// Equipment
router.get('/equipment/queue', getEquipmentQueue)
router.put('/equipment/:id', reviewEquipment)

// Disputes
router.get('/disputes', getDisputes)
router.put('/disputes/:id/resolve', resolveDispute)

// Payouts
router.get('/payouts', getPayouts)
router.put('/payouts/:id', processPayout)
router.post('/payouts/generate', generatePayouts)

export default router