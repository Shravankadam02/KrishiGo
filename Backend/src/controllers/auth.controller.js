import User from '../models/User.js'
import Otp from '../models/Otp.js'
import { generateOTP, sendOTP } from '../utils/otp.js'
import { generateToken } from '../utils/jwt.js'

// POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body

        if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number' })
        }

        // Delete any existing OTP for this phone
        await Otp.deleteMany({ phone })

        const otp = generateOTP()

        await Otp.create({ phone, otp })

        await sendOTP(phone, otp)

        res.json({ success: true, message: 'OTP sent successfully' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP required' })
        }

        const otpRecord = await Otp.findOne({ phone, verified: false })

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP not found or already used' })
        }

        // Check expiry
        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpRecord._id })
            return res.status(400).json({ success: false, message: 'OTP expired' })
        }

        // Check attempts
        if (otpRecord.attempts >= 5) {
            return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP' })
        }

        // Wrong OTP
        if (otpRecord.otp !== otp) {
            await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } })
            return res.status(400).json({ success: false, message: 'Incorrect OTP' })
        }

        // OTP correct — mark as verified and delete
        await Otp.deleteOne({ _id: otpRecord._id })

        // Check if user exists
        let user = await User.findOne({ phone })
        const isNewUser = !user

        if (isNewUser) {
            // Create minimal user — profile completion happens next
            user = await User.create({ phone, name: 'new user', role: 'farmer', isProfileComplete: false })
        }

        const token = generateToken(user._id)

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.json({
            success: true,
            isNewUser,
            user: {
                _id: user._id,
                phone: user.phone,
                name: user.name,
                role: user.role,
                isProfileComplete: user.isProfileComplete
            },
            token
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// POST /api/auth/complete-profile
export const completeProfile = async (req, res) => {
    try {
        const { name, role, village, taluka, district, language, landSize } = req.body

        if (!name || !role) {
            return res.status(400).json({ success: false, message: 'Name and role are required' })
        }

        if (!['farmer', 'owner'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be farmer or owner' })
        }

        const updateData = {
            name,
            role,
            village,
            taluka,
            district: district || 'Nashik',
            language: language || 'mr',
            isProfileComplete: true
        }

        if (role === 'owner') {
            updateData['kyc.status'] = 'not_submitted'
        }

        if (role === 'farmer' && landSize) {
            updateData.landSize = landSize
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        )

        res.json({ success: true, user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        res.json({ success: true, user: req.user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// POST /api/auth/logout
export const logout = async (req, res) => {
    res.clearCookie('token')
    res.json({ success: true, message: 'Logged out successfully' })
}