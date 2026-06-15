// Phase 1: Mock OTP — replace with MSG91 in production
export const generateOTP = () => {
  return "123456" // Hardcoded for demo MVP
}

export const sendOTP = async (phone, otp) => {
  // TODO: Replace with MSG91 API call in production
  console.log(`[DEV] OTP for ${phone}: ${otp}`)
  return true
}