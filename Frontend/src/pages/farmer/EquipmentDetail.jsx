import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft, HiPhone } from 'react-icons/hi'
import { MdLocationOn, MdStar, MdVerified, MdCalendarToday } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import FarmerLayout from '../../components/layout/FarmerLayout'
import api from '../../services/api'
import { formatPrice } from '../../utils/helpers'

export default function EquipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lang = localStorage.getItem('language') || 'en'

  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/api/equipment/${id}`)
        setEquipment(data.equipment)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) return (
    <FarmerLayout>
      <div className='flex flex-col gap-4 p-4 pt-12'>
        <div className='h-64 bg-neutral-200 rounded-3xl animate-pulse' />
        <div className='h-8 bg-neutral-200 rounded-xl animate-pulse w-2/3' />
        <div className='h-4 bg-neutral-200 rounded-xl animate-pulse w-1/2' />
        <div className='h-32 bg-neutral-200 rounded-3xl animate-pulse' />
      </div>
    </FarmerLayout>
  )

  if (!equipment) return (
    <FarmerLayout>
      <div className='flex flex-col items-center justify-center h-64 gap-3'>
        <FaTractor size={48} className='text-neutral-200' />
        <p className='text-neutral-400 font-semibold'>Equipment not found</p>
        <button onClick={() => navigate(-1)} className='text-[#2D6A4F] font-bold text-sm'>
          Go Back
        </button>
      </div>
    </FarmerLayout>
  )

  return (
    <FarmerLayout>
      {/* Back button — floating */}
      <button
        onClick={() => navigate(-1)}
        className='fixed top-12 left-4 z-30 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center'
      >
        <HiArrowLeft size={18} className='text-neutral-700' />
      </button>

      {/* Photo gallery */}
      <div className='relative h-72 bg-neutral-100 overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.img
            key={activePhoto}
            src={equipment.photos[activePhoto]}
            alt={equipment.type}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='w-full h-full object-cover'
          />
        </AnimatePresence>

        {/* Photo dots */}
        {equipment.photos.length > 1 && (
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5'>
            {equipment.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`rounded-full transition-all ${
                  i === activePhoto
                    ? 'w-5 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo thumbnails */}
        {equipment.photos.length > 1 && (
          <div className='absolute bottom-4 right-4 flex gap-1.5'>
            {equipment.photos.slice(0, 4).map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activePhoto ? 'border-white' : 'border-transparent opacity-70'
                }`}
              >
                <img src={photo} alt='' className='w-full h-full object-cover' />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className='px-4 py-5 flex flex-col gap-5'>

        {/* Title + price */}
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h1 className='text-xl font-black text-neutral-900 capitalize'>
              {equipment.type.replace(/_/g, ' ')}
            </h1>
            <div className='flex items-center gap-2 mt-1'>
              <div className='flex items-center gap-1'>
                <MdLocationOn size={13} className='text-neutral-400' />
                <span className='text-neutral-400 text-xs'>
                  {equipment.village}, {equipment.taluka}
                </span>
              </div>
              {equipment.distanceKm !== undefined && (
                <span className='text-xs text-neutral-400'>
                  · {equipment.distanceKm} km away
                </span>
              )}
            </div>
          </div>
          <div className='text-right'>
            <p className='text-2xl font-black text-[#2D6A4F]'>
              {formatPrice(equipment.pricePerAcre)}
            </p>
            <p className='text-xs text-neutral-400'>per acre</p>
          </div>
        </div>

        {/* Rating + verified */}
        <div className='flex items-center gap-3'>
          {equipment.rating > 0 ? (
            <div className='flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl'>
              <MdStar size={16} className='text-amber-400' />
              <span className='font-black text-amber-600 text-sm'>{equipment.rating}</span>
              <span className='text-amber-500 text-xs'>({equipment.ratingCount} reviews)</span>
            </div>
          ) : (
            <div className='px-3 py-1.5 bg-neutral-100 rounded-xl'>
              <span className='text-xs font-semibold text-neutral-400'>No reviews yet</span>
            </div>
          )}
          <div className='flex items-center gap-1.5 px-3 py-1.5 bg-[#2D6A4F]/10 rounded-xl'>
            <MdVerified size={16} className='text-[#2D6A4F]' />
            <span className='text-xs font-semibold text-[#2D6A4F]'>Verified</span>
          </div>
        </div>

        {/* Specs */}
        {equipment.specs && Object.keys(equipment.specs).length > 0 && (
          <div className='bg-white rounded-3xl p-4 shadow-sm'>
            <h3 className='font-black text-neutral-900 text-sm mb-3'>
              {lang === 'en' ? 'Specifications' : 'तपशील'}
            </h3>
            <div className='grid grid-cols-2 gap-2'>
              {Object.entries(equipment.specs).map(([key, val]) => (
                <div key={key} className='bg-[#F7F5F0] rounded-2xl px-3 py-2.5'>
                  <p className='text-[10px] font-semibold text-neutral-400 uppercase tracking-wide capitalize'>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className='font-black text-neutral-800 text-sm mt-0.5'>{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Owner card */}
        <div className='bg-white rounded-3xl p-4 shadow-sm'>
          <h3 className='font-black text-neutral-900 text-sm mb-3'>
            {lang === 'en' ? 'Equipment Owner' : 'उपकरण मालक'}
          </h3>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-2xl bg-[#2D6A4F] flex items-center justify-center flex-shrink-0'>
              <span className='text-white font-black text-lg'>
                {equipment.owner?.name?.[0] || 'O'}
              </span>
            </div>
            <div className='flex-1'>
              <p className='font-black text-neutral-900'>{equipment.owner?.name}</p>
              <p className='text-xs text-neutral-400 mt-0.5'>
                {equipment.owner?.village} · {lang === 'en' ? 'KYC Verified' : 'KYC सत्यापित'}
              </p>
              {equipment.owner?.rating > 0 && (
                <div className='flex items-center gap-1 mt-1'>
                  <MdStar size={12} className='text-amber-400' />
                  <span className='text-xs font-semibold text-neutral-600'>
                    {equipment.owner.rating} owner rating
                  </span>
                </div>
              )}
            </div>
            <div className='flex items-center gap-1.5 px-3 py-2 bg-[#2D6A4F]/10 rounded-xl'>
              <MdVerified size={14} className='text-[#2D6A4F]' />
              <span className='text-xs font-bold text-[#2D6A4F]'>
                {lang === 'en' ? 'Trusted' : 'विश्वासू'}
              </span>
            </div>
          </div>
        </div>

        {/* Service info */}
        <div className='bg-white rounded-3xl p-4 shadow-sm'>
          <h3 className='font-black text-neutral-900 text-sm mb-3'>
            {lang === 'en' ? 'Service Info' : 'सेवा माहिती'}
          </h3>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between py-2 border-b border-neutral-100'>
              <span className='text-sm text-neutral-500'>
                {lang === 'en' ? 'Service Radius' : 'सेवा त्रिज्या'}
              </span>
              <span className='font-bold text-neutral-800 text-sm'>
                {equipment.serviceRadius} km
              </span>
            </div>
            <div className='flex items-center justify-between py-2 border-b border-neutral-100'>
              <span className='text-sm text-neutral-500'>
                {lang === 'en' ? 'Total Bookings' : 'एकूण बुकिंग'}
              </span>
              <span className='font-bold text-neutral-800 text-sm'>
                {equipment.totalBookings}
              </span>
            </div>
            <div className='flex items-center justify-between py-2'>
              <span className='text-sm text-neutral-500'>
                {lang === 'en' ? 'Completion Rate' : 'पूर्णता दर'}
              </span>
              <span className='font-bold text-[#2D6A4F] text-sm'>
                {equipment.completionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Spacer for bottom button */}
        <div className='h-20' />
      </div>

      {/* Bottom Book button — fixed */}
      <div className='fixed bottom-20 left-0 right-0 px-4 z-20'>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/farmer/booking/${id}`)}
          className='w-full flex items-center justify-center gap-2 py-4 bg-[#2D6A4F] text-white font-black rounded-2xl text-base shadow-xl shadow-[#2D6A4F]/20'
        >
          <MdCalendarToday size={20} />
          {lang === 'en' ? 'Book This Equipment' : 'हे उपकरण बुक करा'}
        </motion.button>
      </div>
    </FarmerLayout>
  )
}