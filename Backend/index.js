import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import connectDB from "./src/config/db.js"


//models
import './src/models/User.js'
import './src/models/Otp.js'
import './src/models/Equipment.js'
import './src/models/Booking.js'
import './src/models/Dispute.js'
import './src/models/Payout.js'

//routes
import authRoutes from './src/routes/auth.routes.js'
import kycRoutes from './src/routes/kyc.routes.js'
import equipmentRoutes from './src/routes/equipment.routes.js'
import bookingRoutes from './src/routes/booking.routes.js'
import adminRoutes from './src/routes/admin.routes.js'
import paymentRoutes from './src/routes/payment.routes.js'


dotenv.config()
const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(morgan('dev'))
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ].filter(Boolean),
  credentials: true
}))

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KrishiGo API is running' })
})

const sendOtpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 })
const verifyOtpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })

app.use('/api/auth/send-otp', sendOtpLimiter)
app.use('/api/auth/verify-otp', verifyOtpLimiter)
app.use('/api/', apiLimiter)

app.use('/api/auth', authRoutes)

app.use('/api/kyc', kycRoutes)

app.use('/api/equipment', equipmentRoutes)

app.use('/api/bookings', bookingRoutes)

app.use('/api/admin', adminRoutes)

app.use('/api/payments', paymentRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true' && !process.env.MSG91_AUTH_KEY) {
  console.error("ERROR: In production without DEMO_MODE, you must provide MSG91_AUTH_KEY for SMS.")
  process.exit(1)
}

import { startCronJobs } from './src/utils/cron.js'

connectDB().then(() => {
  startCronJobs()
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
  })
})