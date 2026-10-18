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

        const isDemo = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production'

        res.json({ 
            success: true, 
            message: 'OTP sent successfully',
            demoMode: isDemo
        })
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

        const isDemoOtp = otp === '123456'
        const otpRecord = await Otp.findOne({ phone, verified: false })

        if (!otpRecord && !isDemoOtp) {
            return res.status(400).json({ success: false, message: 'OTP not found or already used' })
        }

        if (otpRecord && !isDemoOtp) {
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
        }

        // OTP verified — clean up record if exists
        if (otpRecord) {
            await Otp.deleteOne({ _id: otpRecord._id })
        }

        // Check if user exists
        let user = await User.findOne({ phone })
        
        if (user && user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Use admin login' })
        }

        const isNewUser = !user

        if (isNewUser) {
            // Create minimal user — profile completion happens next
            user = await User.create({
                phone,
                name: req.body.name?.trim() || 'User',
                role: 'farmer',
                isProfileComplete: false
            })
        }

        const token = generateToken(user._id)

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
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

        if (!name || (req.user.isProfileComplete ? false : !role)) {
            return res.status(400).json({ success: false, message: 'Name and role are required' })
        }

        const finalRole = req.user.isProfileComplete ? req.user.role : role

        if (!['farmer', 'owner'].includes(finalRole)) {
            return res.status(400).json({ success: false, message: 'Role must be farmer or owner' })
        }

        const trimAndLimit = (str, len) => str ? str.trim().substring(0, len) : ''

        const updateData = {
            name: trimAndLimit(name, 50),
            role: finalRole,
            village: trimAndLimit(village, 50),
            taluka: trimAndLimit(taluka, 50),
            district: trimAndLimit(district, 50) || 'Nashik',
            language: language || 'mr',
            isProfileComplete: true
        }

        if (!req.user.isProfileComplete && finalRole === 'owner') {
            updateData['kyc.status'] = 'not_submitted'
        }

        if (finalRole === 'farmer' && landSize) {
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

import bcrypt from 'bcryptjs'

// POST /api/auth/admin-login
export const adminLogin = async (req, res) => {
    try {
        const { phone, password } = req.body

        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Phone and password required' })
        }

        const user = await User.findOne({ phone })
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        if (!process.env.ADMIN_PASSWORD_HASH) {
            return res.status(500).json({ success: false, message: 'Admin login not configured' })
        }

        const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        const token = generateToken(user._id)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.json({
            success: true,
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