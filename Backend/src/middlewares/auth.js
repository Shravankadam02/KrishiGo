import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.token

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-bankAccount.accountNumber -aadhaarUrl -panUrl')

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' })
    }
    
    if (user.suspendedUntil && user.suspendedUntil > new Date()) {
      return res.status(403).json({ success: false, message: `Account suspended until ${user.suspendedUntil.toISOString()}` })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' })
  }
}

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      })
    }
    next()
  }
}