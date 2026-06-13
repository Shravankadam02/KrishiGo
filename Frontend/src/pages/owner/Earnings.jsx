import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { MdCalendarToday, MdAccountBalance } from 'react-icons/md'
import OwnerLayout from '../../components/layout/OwnerLayout'
import api from '../../services/api'
import { formatPrice, formatDate } from '../../utils/helpers'

export default function OwnerEarnings() {
  const navigate = useNavigate()
  const lang = localStorage.getItem('language') || 'en'
  const [bookings, setBookings] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  const totalEarned = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.ownerEarnings, 0)

  const totalCommission = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.commission, 0)

  const pendingPayout = bookings
    .filter(b => b.status === 'completed' && b.paymentStatus === 'collected')
    .reduce((sum, b) => sum + b.ownerEarnings, 0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/bookings/owner/mine')
        setBookings(data.bookings || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <OwnerLayout>
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/owner/home')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <h1 className='font-black text-neutral-900 text-base'>
            {lang === 'en' ? 'Earnings' : 'कमाई'}
          </h1>
        </div>
      </div>

      <div className='px-4 py-4 flex flex-col gap-4'>

        {/* Earnings summary */}
        <div className='bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-3xl p-5'>
          <p className='text-white/60 text-xs font-semibold mb-1'>
            {lang === 'en' ? 'Total Earned' : 'एकूण कमाई'}
          </p>
          <p className='text-white font-black text-3xl mb-4'>
            {formatPrice(totalEarned)}
          </p>
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-white/10 rounded-2xl p-3'>
              <p className='text-white/60 text-[11px]'>
                {lang === 'en' ? 'Pending Payout' : 'प्रलंबित पेआउट'}
              </p>
              <p className='text-white font-black text-lg'>{formatPrice(pendingPayout)}</p>
            </div>
            <div className='bg-white/10 rounded-2xl p-3'>
              <p className='text-white/60 text-[11px]'>
                {lang === 'en' ? 'Commission Paid' : 'कमिशन दिले'}
              </p>
              <p className='text-white font-black text-lg'>{formatPrice(totalCommission)}</p>
            </div>
          </div>
        </div>

        {/* Payout info */}
        <div className='bg-[#2D6A4F]/5 border border-[#2D6A4F]/20 rounded-2xl p-3 flex items-center gap-3'>
          <MdAccountBalance size={20} className='text-[#2D6A4F]' />
          <p className='text-xs text-[#2D6A4F] font-semibold'>
            {lang === 'en'
              ? 'Payouts processed every Monday to your bank account'
              : 'प्रत्येक सोमवारी तुमच्या बँक खात्यात पेआउट केला जातो'}
          </p>
        </div>

        {/* Completed bookings */}
        <div>
          <h2 className='font-black text-neutral-900 text-sm mb-3'>
            {lang === 'en' ? 'Booking History' : 'बुकिंग इतिहास'}
          </h2>

          {loading ? (
            <div className='flex flex-col gap-3'>
              {[1, 2, 3].map(i => (
                <div key={i} className='bg-white rounded-3xl h-20 animate-pulse' />
              ))}
            </div>
          ) : bookings.filter(b => b.status === 'completed').length === 0 ? (
            <div className='text-center py-12 bg-white rounded-3xl'>
              <MdCalendarToday size={36} className='text-neutral-200 mx-auto mb-3' />
              <p className='text-neutral-400 text-sm font-semibold'>
                {lang === 'en' ? 'No completed bookings yet' : 'अद्याप पूर्ण बुकिंग नाही'}
              </p>
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              {bookings
                .filter(b => b.status === 'completed')
                .map((booking, i) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className='bg-white rounded-3xl p-4 shadow-sm'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-black text-neutral-900 text-sm capitalize'>
                          {booking.equipment?.type?.replace(/_/g, ' ')}
                        </p>
                        <div className='flex items-center gap-1 mt-0.5'>
                          <MdCalendarToday size={11} className='text-neutral-400' />
                          <span className='text-xs text-neutral-400'>
                            {formatDate(booking.serviceDate)}
                          </span>
                        </div>
                        <p className='text-xs text-neutral-400 mt-0.5'>
                          {booking.farmer?.name} · {booking.landSize?.toFixed(1)} acres
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-black text-[#2D6A4F] text-base'>
                          {formatPrice(booking.ownerEarnings)}
                        </p>
                        <p className='text-[10px] text-neutral-400'>
                          -{formatPrice(booking.commission)} commission
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

      </div>
    </OwnerLayout>
  )
}