import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiPlus } from 'react-icons/hi'
import { MdCheck, MdSchedule, MdClose } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import OwnerLayout from '../../components/layout/OwnerLayout'
import api from '../../services/api'
import { formatPrice } from '../../utils/helpers'

const statusConfig = {
  pending:  { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', Icon: MdSchedule },
  approved: { label: 'Live',         color: 'bg-green-100 text-green-700',   Icon: MdCheck },
  rejected: { label: 'Rejected',     color: 'bg-red-100 text-red-700',       Icon: MdClose },
  inactive: { label: 'Inactive',     color: 'bg-gray-100 text-gray-600',     Icon: MdClose },
}

export default function OwnerListings() {
  const navigate = useNavigate()
  const lang = localStorage.getItem('language') || 'en'
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/equipment/owner/mine')
        setListings(data.equipment || [])
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
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/owner/home')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <div className='flex-1'>
            <h1 className='font-black text-neutral-900 text-base'>
              {lang === 'en' ? 'My Listings' : 'माझ्या यादी'}
            </h1>
            <p className='text-xs text-neutral-400'>
              {listings.length} {lang === 'en' ? 'equipment listed' : 'उपकरणे नोंदवली'}
            </p>
          </div>
          <button
            onClick={() => navigate('/owner/add-equipment')}
            className='w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center'
          >
            <HiPlus size={18} className='text-white' />
          </button>
        </div>
      </div>

      <div className='px-4 py-4'>
        {loading && (
          <div className='flex flex-col gap-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='bg-white rounded-3xl h-28 animate-pulse' />
            ))}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className='text-center py-16'>
            <FaTractor size={48} className='text-neutral-200 mx-auto mb-4' />
            <p className='text-neutral-400 font-semibold text-sm mb-4'>
              {lang === 'en' ? 'No equipment listed yet' : 'अद्याप उपकरण नोंदवले नाही'}
            </p>
            <button
              onClick={() => navigate('/owner/add-equipment')}
              className='px-6 py-2.5 bg-[#2D6A4F] text-white text-sm font-bold rounded-2xl'
            >
              {lang === 'en' ? 'Add Equipment' : 'उपकरण जोडा'}
            </button>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className='flex flex-col gap-3'>
            {listings.map((eq, i) => {
              const status = statusConfig[eq.status] || statusConfig.pending
              return (
                <motion.div
                  key={eq._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className='bg-white rounded-3xl p-4 shadow-sm'
                >
                  <div className='flex gap-3'>
                    <div className='w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0'>
                      {eq.photos?.[0] ? (
                        <img src={eq.photos[0]} alt='' className='w-full h-full object-cover' />
                      ) : (
                        <div className='w-full h-full bg-[#2D6A4F]/10 flex items-center justify-center'>
                          <FaTractor size={28} className='text-[#2D6A4F]' />
                        </div>
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-start justify-between'>
                        <p className='font-black text-neutral-900 capitalize text-sm'>
                          {eq.type.replace(/_/g, ' ')}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${status.color}`}>
                          <status.Icon size={10} />
                          {status.label}
                        </span>
                      </div>
                      <p className='text-[#2D6A4F] font-black text-sm mt-1'>
                        {formatPrice(eq.pricePerAcre)}/acre
                      </p>
                      <p className='text-xs text-neutral-400 mt-0.5'>
                        {eq.village} · {eq.serviceRadius}km radius
                      </p>

                      {/* Status tracker */}
                      <div className='flex gap-2 mt-2'>
                        {eq.statusTracker?.steps.map((step, j) => (
                          <div key={j} className='flex items-center gap-1'>
                            <div className={`w-3 h-3 rounded-full ${
                              step.done ? 'bg-[#2D6A4F]' : 'bg-neutral-200'
                            }`} />
                            {j < eq.statusTracker.steps.length - 1 && (
                              <div className={`w-4 h-0.5 ${
                                step.done ? 'bg-[#2D6A4F]' : 'bg-neutral-200'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Rejection reason */}
                      {eq.status === 'rejected' && eq.rejectionReason && (
                        <p className='text-xs text-red-500 mt-1.5 font-semibold'>
                          {eq.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  {eq.status === 'approved' && (
                    <div className='flex gap-3 mt-3 pt-3 border-t border-neutral-100'>
                      {[
                        { label: lang === 'en' ? 'Bookings' : 'बुकिंग', value: eq.totalBookings },
                        { label: lang === 'en' ? 'Rating' : 'रेटिंग', value: eq.rating || '—' },
                        { label: lang === 'en' ? 'Completion' : 'पूर्णता', value: `${eq.completionRate}%` },
                      ].map((stat, j) => (
                        <div key={j} className='flex-1 text-center'>
                          <p className='font-black text-neutral-900 text-sm'>{stat.value}</p>
                          <p className='text-[10px] text-neutral-400'>{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  )
}