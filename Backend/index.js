import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import morgan from "morgan"
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

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
  })
})