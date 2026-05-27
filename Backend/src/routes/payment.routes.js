import express from 'express'
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentStatus
} from '../controllers/payment.controller.js'
import { protect, restrictTo } from '../middlewares/auth.js'

const router = express.Router()

// Webhook — no auth, raw body needed
router.post('/webhook', handleWebhook)

// Protected routes
router.post('/create-order', protect, restrictTo('farmer'), createOrder)
router.post('/verify', protect, restrictTo('farmer'), verifyPayment)
router.get('/booking/:bookingId', protect, restrictTo('farmer'), getPaymentStatus)

export default router