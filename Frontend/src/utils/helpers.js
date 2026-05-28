// Format price in Indian style
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Time ago
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Land size converter
export const toAcres = (value, unit) => {
  switch (unit) {
    case 'bigha':   return value * 0.619
    case 'hectare': return value * 2.471
    default:        return value
  }
}

export const formatLandSize = (acres) => {
  if (acres < 1) return `${(acres * 100).toFixed(0)} cents`
  return `${acres.toFixed(1)} acres`
}

// Equipment type labels
export const equipmentLabels = {
  tractor_plowing:    { en: 'Tractor (Plowing)',    mr: 'ट्रॅक्टर (नांगरणी)' },
  tractor_rotavator:  { en: 'Tractor (Rotavator)',  mr: 'ट्रॅक्टर (रोटाव्हेटर)' },
  harvester_wheat:    { en: 'Wheat Harvester',      mr: 'गहू कापणी यंत्र' },
  harvester_paddy:    { en: 'Paddy Harvester',      mr: 'भात कापणी यंत्र' },
  seed_drill:         { en: 'Seed Drill',           mr: 'बियाणे ड्रिल' },
  sprayer:            { en: 'Sprayer',              mr: 'फवारणी यंत्र' },
  baler:              { en: 'Baler',                mr: 'बेलर' },
  other:              { en: 'Other',                mr: 'इतर' }
}

// Booking status labels + colors
export const bookingStatusConfig = {
  pending:            { label: 'Pending',     color: 'yellow' },
  confirmed:          { label: 'Confirmed',   color: 'blue' },
  in_progress:        { label: 'In Progress', color: 'purple' },
  completed:          { label: 'Completed',   color: 'green' },
  cancelled_farmer:   { label: 'Cancelled',   color: 'red' },
  cancelled_owner:    { label: 'Cancelled',   color: 'red' },
  cancelled_weather:  { label: 'Cancelled',   color: 'gray' },
  disputed:           { label: 'Disputed',    color: 'orange' },
  expired:            { label: 'Expired',     color: 'gray' }
}

// Get user initials for avatar
export const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Validate Indian phone number
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone)
}