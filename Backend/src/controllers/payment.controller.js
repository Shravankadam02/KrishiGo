import crypto from 'crypto'
import razorpay from '../config/razorpay.js'
import Booking from '../models/Booking.js'

// POST /api/payments/create-order
// Called when farmer wants to pay advance or full amount
export const createOrder = async (req, res) => {
  try {
    const { bookingId, paymentType } = req.body
    // paymentType: 'advance' | 'full' | 'remaining'

    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    let amount

    if (paymentType === 'advance') {
      if (!booking.advance.required) {
        return res.status(400).json({
          success: false,
          message: 'No advance required for this booking'
        })
      }
      if (booking.advance.collected) {
        return res.status(400).json({
          success: false,
          message: 'Advance already collected'
        })
      }
      amount = booking.advance.amount

    } else if (paymentType === 'remaining') {
      if (!booking.advance.collected) {
        return res.status(400).json({
          success: false,
          message: 'Advance not yet collected'
        })
      }
      amount = booking.totalPrice - booking.advance.amount

    } else if (paymentType === 'full') {
      amount = booking.totalPrice

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type. Must be advance, full or remaining'
      })
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `booking_${bookingId}_${paymentType}`,
      notes: {
        bookingId: bookingId.toString(),
        paymentType,
        farmerId: req.user._id.toString()
      }
    })

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      keyId: process.env.RAZORPAY_KEY_ID,
      booking: {
        id: booking._id,
        totalPrice: booking.totalPrice,
        advanceAmount: booking.advance.amount
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/payments/verify
// Called after payment is done on frontend to verify signature
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      paymentType
    } = req.body

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      })
    }

    // Signature valid — update booking
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (paymentType === 'advance') {
      await Booking.findByIdAndUpdate(bookingId, {
        'advance.collected': true,
        'advance.razorpayOrderId': razorpay_order_id,
        'advance.razorpayPaymentId': razorpay_payment_id
      })

      return res.json({
        success: true,
        message: 'Advance payment verified successfully'
      })
    }

    if (paymentType === 'full') {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'collected',
        paymentConfirmedAt: new Date(),
        status: 'completed',
        'payment.razorpayOrderId': razorpay_order_id,
        'payment.razorpayPaymentId': razorpay_payment_id
      })

      return res.json({
        success: true,
        message: 'Payment verified. Booking completed.'
      })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/payments/webhook
// Razorpay webhook for payment events
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    const signature = req.headers['x-razorpay-signature']

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex')

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
    }

    const event = req.body.event
    const payment = req.body.payload.payment?.entity

    if (event === 'payment.failed') {
      // Log failed payment — can notify farmer
      console.log(`Payment failed for order: ${payment.order_id}`)
    }

    if (event === 'payment.captured') {
      console.log(`Payment captured: ${payment.id}`)
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/payments/booking/:bookingId
// Get payment status for a booking
export const getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .select('totalPrice paymentStatus advance status')

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    res.json({
      success: true,
      payment: {
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        advanceRequired: booking.advance.required,
        advanceAmount: booking.advance.amount,
        advanceCollected: booking.advance.collected,
        bookingStatus: booking.status
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}