import express from 'express'
import {
  sendOtp,
  verifyOtp,
  completeProfile,
  getMe,
  logout
} from '../controllers/auth.controller.js'
import { protect } from '../middlewares/auth.js'


const router = express.Router()

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/complete-profile', protect, completeProfile)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

export default router