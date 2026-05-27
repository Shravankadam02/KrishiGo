// Calculate commission based on booking value
export const calculateCommission = (totalPrice) => {
  const rate = totalPrice >= 5000 ? 0.15 : 0.10
  const commission = Math.round(totalPrice * rate)
  const ownerEarnings = totalPrice - commission
  return { commission, ownerEarnings, rate }
}

// Advance payment check
export const checkAdvanceRequired = (farmer, totalPrice, isPeakSeason = false) => {
  if (farmer.cancellationsThisMonth >= 2)
    return { required: true, amount: 300, reason: 'cancellation_pattern' }
  if (farmer.rating < 3.5 && farmer.ratingCount >= 3)
    return { required: true, amount: 300, reason: 'low_rating' }
  if (totalPrice > 5000)
    return { required: true, amount: 500, reason: 'high_value' }
  if (isPeakSeason)
    return { required: true, amount: 200, reason: 'peak_season' }
  return { required: false, amount: 0, reason: null }
}

// Cancellation penalty calculator
export const calculateCancellationPenalty = (booking, cancelledBy, cancelTime) => {
  const hoursUntilService =
    (new Date(booking.serviceDate) - new Date(cancelTime)) / (1000 * 60 * 60)

  if (cancelledBy === 'farmer') {
    if (hoursUntilService > 24) return { penalty: 0, ratingDrop: 0 }
    if (hoursUntilService > 12) return { penalty: Math.round(booking.totalPrice * 0.25), ratingDrop: 0 }
    if (hoursUntilService > 6)  return { penalty: Math.round(booking.totalPrice * 0.50), ratingDrop: 0.2 }
    return { penalty: Math.round(booking.totalPrice * 0.75), ratingDrop: 0.5 }
  }

  if (cancelledBy === 'owner') {
    if (hoursUntilService > 24) return { penalty: 0, ratingDrop: 0 }
    if (hoursUntilService > 6)  return { penalty: 500, ratingDrop: 0.3 }
    return { penalty: 1000, ratingDrop: 0.5 }
  }
}

// Convert land size to acres
export const toAcres = (value, unit) => {
  switch (unit) {
    case 'bigha':   return value * 0.619
    case 'hectare': return value * 2.471
    default:        return value
  }
}