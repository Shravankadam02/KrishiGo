import cron from 'node-cron'
import Booking from '../models/Booking.js'
import User from '../models/User.js'

export const startCronJobs = () => {
  // Every 10 minutes: expire pending bookings
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date()
      const result = await Booking.updateMany(
        { status: 'pending', ownerResponseDeadline: { $lt: now } },
        { $set: { status: 'expired' } }
      )
      if (result.modifiedCount > 0) {
        console.log(`[CRON] Expired ${result.modifiedCount} bookings`)
      }
    } catch (error) {
      console.error('[CRON] Error expiring bookings:', error)
    }
  })

  // 1st of each month at 00:00: reset cancellationsThisMonth
  cron.schedule('0 0 1 * *', async () => {
    try {
      await User.updateMany({}, { $set: { cancellationsThisMonth: 0 } })
      console.log('[CRON] Reset cancellationsThisMonth for all users')
    } catch (error) {
      console.error('[CRON] Error resetting cancellations:', error)
    }
  })
}
