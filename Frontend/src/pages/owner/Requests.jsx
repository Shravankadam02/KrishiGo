import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { MdLocationOn, MdCalendarToday, MdCheck, MdClose } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import OwnerLayout from '../../components/layout/OwnerLayout'
import api from '../../services/api'
import { formatPrice, formatDate } from '../../utils/helpers'

const tabs = [
  { key: 'pending',   label: 'Pending',   mr: 'प्रलंबित' },
  { key: 'confirmed', label: 'Confirmed', mr: 'निश्चित' },
  { key: 'completed', label: 'Completed', mr: 'पूर्ण' },
  { key: 'all',       label: 'All',       mr: 'सर्व' },
]

export default function OwnerRequests() {
  const navigate = useNavigate()
  const lang = localStorage.getItem('language') || 'en'

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [activeTab])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {}
      const { data } = await api.get('/api/bookings/owner/mine', { params })
      setBookings(data.bookings || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (bookingId) => {
    setActionLoading(bookingId + '_accept')
    try {
      await api.put(`/api/bookings/${bookingId}/accept`)
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Reason for rejection (optional):')
    if (reason === null) return
    setActionLoading(bookingId + '_reject')
    try {
      await api.put(`/api/bookings/${bookingId}/reject`, { reason })
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (bookingId) => {
    setActionLoading(bookingId + '_complete')
    try {
      await api.put(`/api/bookings/${bookingId}/complete`)
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark complete')
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirmPayment = async (bookingId) => {
    setActionLoading(bookingId + '_payment')
    try {
      await api.put(`/api/bookings/${bookingId}/payment`)
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm payment')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <OwnerLayout>
      {/* Header */}
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3 mb-4'>
          <button
            onClick={() => navigate('/owner/home')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <div>
            <h1 className='font-black text-neutral-900 text-base'>
              {lang === 'en' ? 'Booking Requests' : 'बुकिंग विनंत्या'}
            </h1>
            <p className='text-xs text-neutral-400'>
              {bookings.length} {lang === 'en' ? 'bookings' : 'बुकिंग'}
            </p>
          </div>
        </div>

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
        {loading && (
          <div className='flex flex-col gap-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='bg-white rounded-3xl h-36 animate-pulse' />
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className='text-center py-16'>
            <MdCalendarToday size={48} className='text-neutral-200 mx-auto mb-4' />
            <p className='text-neutral-400 font-semibold text-sm'>
              {lang === 'en' ? 'No bookings found' : 'बुकिंग सापडली नाही'}
            </p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className='flex flex-col gap-3'>
            {bookings.map((booking, i) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className='bg-white rounded-3xl p-4 shadow-sm'
              >
                {/* Farmer + equipment info */}
                <div className='flex gap-3 mb-3'>
                  <div className='w-12 h-12 rounded-2xl bg-[#2D6A4F] flex items-center justify-center flex-shrink-0'>
                    <span className='text-white font-black text-lg'>
                      {booking.farmer?.name?.[0]}
                    </span>
                  </div>
                  <div className='flex-1'>
                    <p className='font-black text-neutral-900 text-sm'>
                      {booking.farmer?.name}
                    </p>
                    <p className='text-xs text-neutral-400 capitalize mt-0.5'>
                      {booking.equipment?.type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-black text-[#2D6A4F] text-sm'>
                      {formatPrice(booking.totalPrice)}
                    </p>
                    <p className='text-[10px] text-neutral-400'>
                      {booking.landSize?.toFixed(1)} acres
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className='flex gap-4 mb-3'>
                  <div className='flex items-center gap-1 text-neutral-400 text-xs'>
                    <MdCalendarToday size={12} />
                    <span>{formatDate(booking.serviceDate)}</span>
                  </div>
                  <div className='flex items-center gap-1 text-neutral-400 text-xs'>
                    <MdLocationOn size={12} />
                    <span>{booking.farmer?.village}</span>
                  </div>
                </div>

                {/* Trust score */}
                <div className='flex items-center gap-2 mb-3 p-2 bg-[#F7F5F0] rounded-xl'>
                  <div className='flex-1'>
                    <p className='text-[11px] text-neutral-400'>
                      {lang === 'en' ? 'Farmer Trust Score' : 'शेतकरी विश्वास स्कोर'}
                    </p>
                    <div className='flex items-center gap-2 mt-1'>
                      <div className='flex-1 h-1.5 bg-neutral-200 rounded-full'>
                        <div
                          className='h-full bg-[#2D6A4F] rounded-full'
                          style={{ width: `${booking.farmer?.trustScore || 50}%` }}
                        />
                      </div>
                      <span className='text-xs font-bold text-neutral-600'>
                        {booking.farmer?.trustScore || 50}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  {booking.status === 'pending' && (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAccept(booking._id)}
                        disabled={actionLoading === booking._id + '_accept'}
                        className='flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#2D6A4F] text-white rounded-2xl text-xs font-bold disabled:opacity-60'
                      >
                        {actionLoading === booking._id + '_accept' ? (
                          <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        ) : (
                          <>
                            <MdCheck size={16} />
                            {lang === 'en' ? 'Accept' : 'स्वीकार'}
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleReject(booking._id)}
                        disabled={actionLoading === booking._id + '_reject'}
                        className='flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 disabled:opacity-60'
                      >
                        <MdClose size={16} />
                        {lang === 'en' ? 'Reject' : 'नकार'}
                      </motion.button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleComplete(booking._id)}
                      disabled={actionLoading === booking._id + '_complete'}
                      className='flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#2D6A4F] text-white rounded-2xl text-xs font-bold disabled:opacity-60'
                    >
                      {actionLoading === booking._id + '_complete' ? (
                        <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      ) : (
                        <>
                          <MdCheck size={16} />
                          {lang === 'en' ? 'Mark Complete' : 'पूर्ण म्हणून चिन्हांकित करा'}
                        </>
                      )}
                    </motion.button>
                  )}

                  {booking.status === 'in_progress' && booking.paymentStatus !== 'collected' && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleConfirmPayment(booking._id)}
                      disabled={actionLoading === booking._id + '_payment'}
                      className='flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#E76F51] text-white rounded-2xl text-xs font-bold disabled:opacity-60'
                    >
                      {actionLoading === booking._id + '_payment' ? (
                        <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      ) : (
                        lang === 'en' ? 'Confirm Cash Received' : 'रोख मिळाले निश्चित करा'
                      )}
                    </motion.button>
                  )}

                  {booking.status === 'completed' && (
                    <div className='flex-1 py-2.5 bg-green-50 text-green-600 rounded-2xl text-xs font-bold text-center'>
                      {lang === 'en' ? 'Completed' : 'पूर्ण झाले'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  )
}