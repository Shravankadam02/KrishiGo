import express from 'express'
import {
  submitKYC,
  getKYCStatus,
  reviewKYC,
  getKYCQueue
} from '../controllers/kyc.controller.js'
import { protect, restrictTo } from '../middlewares/auth.js'
import { upload } from '../config/multer.js'

const router = express.Router()

// Owner routes
router.post(
  '/submit',
  protect,
  restrictTo('owner'),
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 }
  ]),
  submitKYC
)
router.get('/status', protect, restrictTo('owner'), getKYCStatus)

// Admin routes
router.get('/admin/queue', protect, restrictTo('admin'), getKYCQueue)
router.put('/admin/:userId', protect, restrictTo('admin'), reviewKYC)

export default router