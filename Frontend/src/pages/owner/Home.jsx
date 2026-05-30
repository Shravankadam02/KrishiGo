import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiBell, HiPlus } from 'react-icons/hi'
import { MdArrowForward, MdCalendarToday, MdVerified, MdWarning } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import OwnerLayout from '../../components/layout/OwnerLayout'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import { formatPrice, formatDate } from '../../utils/helpers'

export default function OwnerHome() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const lang = localStorage.getItem('language') || 'en'

  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    completedBookings: 0
  })
  const [pendingBookings, setPendingBookings] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bookingsRes, listingsRes] = await Promise.all([
        api.get('/api/bookings/owner/mine', { params: { status: 'pending' } }),
        api.get('/api/equipment/owner/mine')
      ])

      const pending = bookingsRes.data.bookings || []
      const allListings = listingsRes.data.equipment || []

      setPendingBookings(pending.slice(0, 3))
      setListings(allListings.slice(0, 3))

      setStats({
        totalListings: allListings.length,
        activeListings: allListings.filter(l => l.status === 'approved').length,
        pendingRequests: pending.length,
        completedBookings: user?.completedBookings || 0,
        totalEarnings: 0
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return lang === 'en' ? 'Good Morning' : 'सुप्रभात'
    if (hour < 17) return lang === 'en' ? 'Good Afternoon' : 'नमस्कार'
    return lang === 'en' ? 'Good Evening' : 'शुभ संध्या'
  }

  return (
    <OwnerLayout>
      {/* Header */}
      <div className='bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-5 pt-12 pb-20 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />

        <div className='relative flex items-center justify-between mb-1'>
          <div>
            <p className='text-white/60 text-xs font-medium'>{greeting()}</p>
            <h1 className='text-white text-lg font-black'>{user?.name || 'Owner'}</h1>
          </div>
          <button className='w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center relative'>
            <HiBell size={18} className='text-white' />
            {stats.pendingRequests > 0 && (
              <span className='absolute -top-1 -right-1 w-4 h-4 bg-[#E76F51] rounded-full text-white text-[10px] font-black flex items-center justify-center'>
                {stats.pendingRequests}
              </span>
            )}
          </button>
        </div>

        {/* KYC status */}
        <div className='relative mb-4'>
          {user?.kyc?.status === 'approved' ? (
            <div className='flex items-center gap-1'>
              <MdVerified size={13} className='text-[#95D5B2]' />
              <span className='text-white/60 text-xs'>
                {lang === 'en' ? 'KYC Verified' : 'KYC सत्यापित'}
              </span>
            </div>
          ) : (
            <div
              className='flex items-center gap-1 cursor-pointer'
              onClick={() => navigate('/owner/kyc')}
            >
              <MdWarning size={13} className='text-amber-400' />
              <span className='text-amber-400 text-xs font-semibold'>
                {lang === 'en' ? 'Complete KYC to list equipment' : 'KYC पूर्ण करा'}
              </span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className='relative grid grid-cols-3 gap-3'>
          {[
            {
              value: stats.activeListings,
              label: lang === 'en' ? 'Active' : 'सक्रिय',
              action: () => navigate('/owner/listings')
            },
            {
              value: stats.pendingRequests,
              label: lang === 'en' ? 'Requests' : 'विनंत्या',
              action: () => navigate('/owner/requests'),
              highlight: stats.pendingRequests > 0
            },
            {
              value: stats.completedBookings,
              label: lang === 'en' ? 'Completed' : 'पूर्ण',
              action: () => navigate('/owner/earnings')
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.97 }}
              onClick={stat.action}
              className={`rounded-2xl p-3 text-center cursor-pointer ${
                stat.highlight ? 'bg-[#E76F51]' : 'bg-white/10'
              }`}
            >
              <p className='text-white font-black text-xl'>{stat.value}</p>
              <p className='text-white/60 text-[11px]'>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className='px-4 -mt-10 relative z-10 flex flex-col gap-4'>

        {/* Pending requests */}
        <AnimatePresence>
          {pendingBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-[#E76F51] rounded-3xl p-4 shadow-lg'
            >
              <div className='flex items-center justify-between mb-3'>
                <p className='text-white font-black text-sm'>
                  {stats.pendingRequests} {lang === 'en' ? 'Pending Requests' : 'प्रलंबित विनंत्या'}
                </p>
                <button
                  onClick={() => navigate('/owner/requests')}
                  className='flex items-center gap-1 text-white/80 text-xs font-bold'
                >
                  {lang === 'en' ? 'View All' : 'सर्व पहा'}
                  <MdArrowForward size={14} />
                </button>
              </div>
              {pendingBookings.map(booking => (
                <div
                  key={booking._id}
                  onClick={() => navigate('/owner/requests')}
                  className='bg-white/15 rounded-2xl p-3 mb-2 last:mb-0 cursor-pointer'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-white font-black text-xs capitalize'>
                        {booking.equipment?.type?.replace(/_/g, ' ')}
                      </p>
                      <p className='text-white/70 text-[11px]'>
                        {booking.farmer?.name} · {formatDate(booking.serviceDate)}
                      </p>
                    </div>
                    <p className='text-white font-black text-sm'>
                      {formatPrice(booking.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions */}
        <div className='grid grid-cols-2 gap-3'>
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/owner/add-equipment')}
            className='bg-[#2D6A4F] rounded-3xl p-4 cursor-pointer'
          >
            <div className='w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center mb-2'>
              <HiPlus size={20} className='text-white' />
            </div>
            <h3 className='font-black text-white text-sm'>
              {lang === 'en' ? 'Add Equipment' : 'उपकरण जोडा'}
            </h3>
            <p className='text-white/60 text-xs mt-0.5'>
              {lang === 'en' ? 'List new machine' : 'नवीन यंत्र नोंदवा'}
            </p>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/owner/requests')}
            className='bg-white rounded-3xl p-4 cursor-pointer shadow-sm'
          >
            <div className='w-9 h-9 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center mb-2'>
              <MdCalendarToday size={18} className='text-[#2D6A4F]' />
            </div>
            <h3 className='font-black text-neutral-900 text-sm'>
              {lang === 'en' ? 'Manage Requests' : 'विनंत्या व्यवस्थापित करा'}
            </h3>
            <p className='text-neutral-400 text-xs mt-0.5'>
              {lang === 'en' ? 'Accept or reject' : 'स्वीकार किंवा नकार'}
            </p>
          </motion.div>
        </div>

        {/* My listings */}
        {listings.length > 0 && (
          <div>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='font-black text-neutral-900 text-sm'>
                {lang === 'en' ? 'My Listings' : 'माझ्या यादी'}
              </h2>
              <button
                onClick={() => navigate('/owner/listings')}
                className='text-[#2D6A4F] text-xs font-bold flex items-center gap-1'
              >
                {lang === 'en' ? 'See All' : 'सर्व पहा'}
                <MdArrowForward size={14} />
              </button>
            </div>
            <div className='flex flex-col gap-3'>
              {listings.map(eq => (
                <div
                  key={eq._id}
                  className='bg-white rounded-3xl p-3 shadow-sm flex gap-3 items-center'
                >
                  <div className='w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0'>
                    {eq.photos?.[0] ? (
                      <img src={eq.photos[0]} alt='' className='w-full h-full object-cover' />
                    ) : (
                      <div className='w-full h-full bg-[#2D6A4F]/10 flex items-center justify-center'>
                        <FaTractor size={20} className='text-[#2D6A4F]' />
                      </div>
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='font-black text-neutral-900 text-sm capitalize'>
                      {eq.type.replace(/_/g, ' ')}
                    </p>
                    <p className='text-xs text-neutral-400 mt-0.5'>
                      {formatPrice(eq.pricePerAcre)}/acre
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-xl text-[10px] font-bold ${
                    eq.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : eq.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {eq.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No listings CTA */}
        {!loading && listings.length === 0 && (
          <div className='bg-white rounded-3xl p-8 text-center shadow-sm'>
            <FaTractor size={36} className='text-neutral-200 mx-auto mb-3' />
            <p className='text-neutral-400 font-semibold text-sm mb-4'>
              {lang === 'en' ? 'No equipment listed yet' : 'अद्याप कोणतेही उपकरण नोंदवले नाही'}
            </p>
            <button
              onClick={() => navigate('/owner/add-equipment')}
              className='px-6 py-2.5 bg-[#2D6A4F] text-white text-sm font-bold rounded-2xl'
            >
              {lang === 'en' ? 'Add Your First Equipment' : 'पहिले उपकरण जोडा'}
            </button>
          </div>
        )}

      </div>
    </OwnerLayout>
  )
}