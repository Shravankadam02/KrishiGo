import crypto from 'crypto'

export const generateOTP = () => {
  if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production') {
    return '123456'
  }
  return crypto.randomInt(100000, 1000000).toString()
}

export const sendOTP = async (phone, otp) => {
  // TODO: Replace with MSG91 API call in production
  console.log(`[DEV] OTP for ${phone}: ${otp}`)
  return true
}