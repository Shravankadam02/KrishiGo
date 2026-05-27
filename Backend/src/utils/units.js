// All land sizes stored in acres internally
export const toAcres = (value, unit) => {
  switch (unit) {
    case 'bigha':    return value * 0.619
    case 'hectare':  return value * 2.471
    case 'acres':    
    default:         return value
  }
}

export const fromAcres = (acres, unit) => {
  switch (unit) {
    case 'bigha':    return acres / 0.619
    case 'hectare':  return acres / 2.471
    case 'acres':    
    default:         return acres
  }
}