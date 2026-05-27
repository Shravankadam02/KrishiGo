import express from 'express'
import {
  createBooking,
  getFarmerBookings,
  getOwnerBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  confirmPayment,
  submitRating,
  fileDispute
} from '../controllers/booking.controller.js'
import { protect, restrictTo } from '../middlewares/auth.js'
import { upload } from '../config/multer.js'

const router = express.Router()

router.post('/', protect, restrictTo('farmer'), createBooking)
router.get('/farmer/mine', protect, restrictTo('farmer'), getFarmerBookings)
router.get('/owner/mine', protect, restrictTo('owner'), getOwnerBookings)
router.get('/:id', protect, getBookingById)

router.put('/:id/accept', protect, restrictTo('owner'), acceptBooking)
router.put('/:id/reject', protect, restrictTo('owner'), rejectBooking)
router.put('/:id/cancel', protect, cancelBooking)
router.put('/:id/complete', protect, restrictTo('owner'), completeBooking)
router.put('/:id/payment', protect, restrictTo('owner'), confirmPayment)
router.put('/:id/rate', protect, submitRating)
router.post(
  '/:id/dispute',
  protect,
  upload.fields([{ name: 'evidence', maxCount: 5 }]),
  fileDispute
)

export default router