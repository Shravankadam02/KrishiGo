import crypto from 'crypto'
import razorpay from '../config/razorpay.js'
import Booking from '../models/Booking.js'
import User from '../models/User.js'
import { sendTransactionalSMS } from '../utils/sms.js'

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

    if (['cancelled_farmer', 'cancelled_owner', 'cancelled_weather', 'expired', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot create order for booking in ${booking.status} status` })
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
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `booking_${bookingId}_${paymentType}`,
      notes: {
        bookingId: bookingId.toString(),
        paymentType,
        farmerId: req.user._id.toString()
      }
    })

    if (paymentType === 'advance') {
      booking.advance.razorpayOrderId = order.id
    } else {
      booking.payment.razorpayOrderId = order.id
    }
    await booking.save()

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
    const bodyStr = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(bodyStr)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      })
    }

    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const expectedOrderId = paymentType === 'advance' ? booking.advance.razorpayOrderId : booking.payment.razorpayOrderId
    if (razorpay_order_id !== expectedOrderId) {
      return res.status(400).json({ success: false, message: 'Order ID mismatch' })
    }

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id)
    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      return res.status(400).json({ success: false, message: 'Payment not captured or authorized' })
    }
    if (paymentDetails.order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Payment order ID mismatch' })
    }
    
    let expectedAmount = paymentType === 'advance' ? booking.advance.amount : (paymentType === 'full' ? booking.totalPrice : booking.totalPrice - booking.advance.amount)
    if (paymentDetails.amount !== Math.round(expectedAmount * 100)) {
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' })
    }

    if (paymentType === 'advance') {
      if (booking.advance.collected) {
        return res.json({ success: true, message: 'Advance already verified' })
      }
      await Booking.findByIdAndUpdate(bookingId, {
        'advance.collected': true,
        'advance.razorpayPaymentId': razorpay_payment_id
      })
      
      const owner = await User.findById(booking.owner)
      await sendTransactionalSMS(owner.phone, 'advance_paid', {
        amount: expectedAmount,
        bookingId: booking._id.toString()
      })
      
      return res.json({ success: true, message: 'Advance payment verified successfully' })
    }

    if (paymentType === 'full' || paymentType === 'remaining') {
      if (booking.paymentStatus === 'collected') {
        return res.json({ success: true, message: 'Payment already verified' })
      }
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'collected',
        paymentConfirmedAt: new Date(),
        'payment.razorpayPaymentId': razorpay_payment_id
      })
      return res.json({ success: true, message: 'Payment verified successfully.' })
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

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
    }

    const payload = JSON.parse(req.body.toString())
    const event = payload.event
    const payment = payload.payload.payment?.entity

    if (event === 'payment.failed') {
      console.log(`Payment failed for order: ${payment.order_id}`)
    }

    if (event === 'payment.captured') {
      const orderId = payment.order_id
      const booking = await Booking.findOne({
        $or: [
          { 'advance.razorpayOrderId': orderId },
          { 'payment.razorpayOrderId': orderId }
        ]
      })

      if (booking) {
        if (booking.advance.razorpayOrderId === orderId && !booking.advance.collected) {
          booking.advance.collected = true
          booking.advance.razorpayPaymentId = payment.id
          await booking.save()
        } else if (booking.payment.razorpayOrderId === orderId && booking.paymentStatus !== 'collected') {
          booking.paymentStatus = 'collected'
          booking.paymentConfirmedAt = new Date()
          booking.payment.razorpayPaymentId = payment.id
          await booking.save()
        }
      }
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
      .select('totalPrice paymentStatus advance status farmer')

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