import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { MdLocationOn, MdCalendarToday, MdArrowForward } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import FarmerLayout from '../../components/layout/FarmerLayout'
import api from '../../services/api'
import { formatPrice, formatDate } from '../../utils/helpers'

const statusConfig = {
  pending:           { label: 'Pending',     mr: 'प्रलंबित',     color: 'bg-yellow-100 text-yellow-700' },
  confirmed:         { label: 'Confirmed',   mr: 'निश्चित',      color: 'bg-blue-100 text-blue-700' },
  in_progress:       { label: 'In Progress', mr: 'सुरू आहे',     color: 'bg-purple-100 text-purple-700' },
  completed:         { label: 'Completed',   mr: 'पूर्ण झाले',   color: 'bg-green-100 text-green-700' },
  cancelled_farmer:  { label: 'Cancelled',   mr: 'रद्द केले',    color: 'bg-red-100 text-red-700' },
  cancelled_owner:   { label: 'Cancelled',   mr: 'रद्द केले',    color: 'bg-red-100 text-red-700' },
  disputed:          { label: 'Disputed',    mr: 'वादग्रस्त',    color: 'bg-orange-100 text-orange-700' },
  expired:           { label: 'Expired',     mr: 'कालबाह्य',     color: 'bg-gray-100 text-gray-600' },
}

const tabs = [
  { key: 'all',       label: 'All',       mr: 'सर्व' },
  { key: 'pending',   label: 'Pending',   mr: 'प्रलंबित' },
  { key: 'confirmed', label: 'Confirmed', mr: 'निश्चित' },
  { key: 'completed', label: 'Completed', mr: 'पूर्ण' },
]

export default function FarmerBookings() {
  const navigate = useNavigate()
  const lang = localStorage.getItem('language') || 'en'

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [activeTab])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeTab !== 'all') params.status = activeTab
      const { data } = await api.get('/api/bookings/farmer/mine', { params })
      setBookings(data.bookings || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await api.put(`/api/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by farmer'
      })
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed')
    }
  }

  return (
    <FarmerLayout>
      {/* Header */}
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3 mb-4'>
          <button
            onClick={() => navigate('/farmer/home')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <div>
            <h1 className='font-black text-neutral-900 text-base'>
              {lang === 'en' ? 'My Bookings' : 'माझ्या बुकिंग'}
            </h1>
            <p className='text-xs text-neutral-400'>
              {bookings.length} {lang === 'en' ? 'bookings' : 'बुकिंग'}
            </p>
          </div>
        </div>

        {/* Status tabs */}
        <div className='flex gap-2 overflow-x-auto pb-1 -mx-4 px-4'>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all
                ${activeTab === tab.key
                  ? 'bg-[#2D6A4F] text-white'
                  : 'bg-[#F7F5F0] text-neutral-500'}`}
            >
              {lang === 'en' ? tab.label : tab.mr}
            </button>
          ))}
        </div>
      </div>

      <div className='px-4 py-4'>
        {/* Loading */}
        {loading && (
          <div className='flex flex-col gap-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='bg-white rounded-3xl h-32 animate-pulse' />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && bookings.length === 0 && (
          <div className='text-center py-16'>
            <MdCalendarToday size={48} className='text-neutral-200 mx-auto mb-4' />
            <p className='text-neutral-400 font-semibold text-sm'>
              {lang === 'en' ? 'No bookings yet' : 'अद्याप बुकिंग नाही'}
            </p>
            <button
              onClick={() => navigate('/farmer/explore')}
              className='mt-4 px-6 py-2.5 bg-[#2D6A4F] text-white text-sm font-bold rounded-2xl'
            >
              {lang === 'en' ? 'Find Equipment' : 'उपकरण शोधा'}
            </button>
          </div>
        )}

        {/* Bookings list */}
        {!loading && bookings.length > 0 && (
          <div className='flex flex-col gap-3'>
            {bookings.map((booking, i) => {
              const status = statusConfig[booking.status] || statusConfig.pending
              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className='bg-white rounded-3xl p-4 shadow-sm'
                >
                  <div className='flex gap-3'>
                    {/* Photo */}
                    <div className='w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0'>
                      {booking.equipment?.photos?.[0] ? (
                        <img
                          src={booking.equipment.photos[0]}
                          alt=''
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full bg-[#2D6A4F]/10 flex items-center justify-center'>
                          <FaTractor size={20} className='text-[#2D6A4F]' />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <p className='font-black text-neutral-900 text-sm capitalize'>
                          {booking.equipment?.type?.replace(/_/g, ' ')}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${status.color}`}>
                          {lang === 'en' ? status.label : status.mr}
                        </span>
                      </div>

                      <p className='text-xs text-neutral-400 mt-0.5'>
                        {booking.owner?.name}
                      </p>

                      <div className='flex items-center gap-3 mt-2'>
                        <div className='flex items-center gap-1 text-neutral-400 text-xs'>
                          <MdCalendarToday size={12} />
                          <span>{formatDate(booking.serviceDate)}</span>
                        </div>
                        <div className='flex items-center gap-1 text-neutral-400 text-xs'>
                          <MdLocationOn size={12} />
                          <span>{booking.equipment?.village}</span>
                        </div>
                      </div>

                      <div className='flex items-center justify-between mt-2'>
                        <span className='font-black text-[#2D6A4F] text-sm'>
                          {formatPrice(booking.totalPrice)}
                        </span>
                        <span className='text-xs text-neutral-400'>
                          {booking.landSize?.toFixed(1)} acres
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 mt-3 pt-3 border-t border-neutral-100'>
                    <button
                      onClick={() => navigate(`/farmer/booking-detail/${booking._id}`)}
                      className='flex-1 flex items-center justify-center gap-1 py-2 bg-[#F7F5F0] rounded-xl text-xs font-bold text-neutral-600'
                    >
                      {lang === 'en' ? 'View Details' : 'तपशील पहा'}
                      <MdArrowForward size={14} />
                    </button>

                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className='px-4 py-2 bg-red-50 rounded-xl text-xs font-bold text-red-500'
                      >
                        {lang === 'en' ? 'Cancel' : 'रद्द करा'}
                      </button>
                    )}

                    {booking.status === 'completed' && !booking.farmerRating?.submittedAt && (
                      <button
                        onClick={() => navigate(`/farmer/rate/${booking._id}`)}
                        className='px-4 py-2 bg-amber-50 rounded-xl text-xs font-bold text-amber-600'
                      >
                        {lang === 'en' ? 'Rate' : 'रेट करा'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </FarmerLayout>
  )
}