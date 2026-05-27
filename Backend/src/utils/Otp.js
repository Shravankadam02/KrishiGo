// Phase 1: Mock OTP — replace with MSG91 in production
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const sendOTP = async (phone, otp) => {
  // TODO: Replace with MSG91 API call in production
  console.log(`[DEV] OTP for ${phone}: ${otp}`)
  return true
}