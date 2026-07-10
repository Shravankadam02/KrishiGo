import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { MdLocationOn, MdStar, MdVerified, MdCalendarToday } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import api from '../services/api'
import { formatPrice } from '../utils/helpers'
import logo from '../assets/logo.png'

export default function EquipmentDetailPublic() {
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

  const handleBook = () => {
    // Save where to go after login
    localStorage.setItem('postLoginRedirect', `/farmer/booking/${id}`)
    navigate('/login')
  }

  if (loading) return (
    <div className='min-h-screen bg-[#F7F5F0] flex items-center justify-center'>
      <div className='w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin' />
    </div>
  )

  if (!equipment) return (
    <div className='min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center gap-3'>
      <FaTractor size={48} className='text-neutral-200' />
      <p className='text-neutral-400 font-semibold'>Equipment not found</p>
      <button onClick={() => navigate(-1)} className='text-[#2D6A4F] font-bold text-sm'>Go Back</button>
    </div>
  )

  return (
    <div className='min-h-screen bg-[#F7F5F0]' style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* Navbar */}
      <nav className='bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30'>
        <div className='flex items-center gap-3'>
          <button onClick={() => navigate(-1)}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'>
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <img src={logo} alt='KrishiGo' className='h-8 w-auto' />
        </div>
        <button
          onClick={() => navigate('/login')}
          className='px-4 py-2 bg-[#2D6A4F] text-white text-sm font-bold rounded-xl'
        >
          Login
        </button>
      </nav>

      {/* Photo gallery */}
      <div className='relative h-64 md:h-80 bg-[#2D6A4F]/10 overflow-hidden'>
        {equipment.photos?.[activePhoto] ? (
          <img src={equipment.photos[activePhoto]} alt=''
            className='w-full h-full object-cover' />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <FaTractor size={64} className='text-[#2D6A4F]/20' />
          </div>
        )}
        {equipment.photos?.length > 1 && (
          <div className='absolute bottom-3 left-0 right-0 flex justify-center gap-2'>
            {equipment.photos.map((_, i) => (
              <button key={i} onClick={() => setActivePhoto(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activePhoto ? 'bg-white w-5' : 'bg-white/50'
                }`} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className='max-w-4xl mx-auto px-4 py-5 flex flex-col gap-4'>

        {/* Title + price */}
        <div className='bg-white rounded-2xl p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h1 className='text-xl font-black text-neutral-900 capitalize mb-1'>
                {equipment.type.replace(/_/g, ' ')}
              </h1>
              <div className='flex items-center gap-1'>
                <MdLocationOn size={13} className='text-neutral-400' />
                <span className='text-sm text-neutral-500'>
                  {equipment.village}, {equipment.taluka}
                </span>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-2xl font-black text-[#2D6A4F]'>
                {formatPrice(equipment.pricePerAcre)}
              </p>
              <p className='text-xs text-neutral-400'>per acre</p>
            </div>
          </div>

          <div className='flex items-center gap-2 mt-3 flex-wrap'>
            {equipment.rating > 0 && (
              <div className='flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-xl'>
                <MdStar size={14} className='text-amber-400' />
                <span className='font-black text-amber-600 text-sm'>{equipment.rating}</span>
              </div>
            )}
            <div className='flex items-center gap-1 px-3 py-1.5 bg-[#2D6A4F]/10 rounded-xl'>
              <MdVerified size={14} className='text-[#2D6A4F]' />
              <span className='text-xs font-semibold text-[#2D6A4F]'>Verified</span>
            </div>
          </div>
        </div>

        {/* Specs */}
        {equipment.specs && Object.keys(equipment.specs).length > 0 && (
          <div className='bg-white rounded-2xl p-5 shadow-sm'>
            <h3 className='font-black text-neutral-900 mb-3'>Specifications</h3>
            <div className='grid grid-cols-2 gap-2'>
              {Object.entries(equipment.specs).map(([key, val]) => (
                <div key={key} className='bg-[#F7F5F0] rounded-xl p-3'>
                  <p className='text-[10px] font-semibold text-neutral-400 uppercase capitalize'>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className='font-black text-neutral-800 text-sm mt-0.5'>{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Owner */}
        <div className='bg-white rounded-2xl p-5 shadow-sm'>
          <h3 className='font-black text-neutral-900 mb-3'>Equipment Owner</h3>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-2xl bg-[#2D6A4F] flex items-center justify-center'>
              <span className='text-white font-black text-lg'>
                {equipment.owner?.name?.[0]}
              </span>
            </div>
            <div className='flex-1'>
              <p className='font-black text-neutral-900'>{equipment.owner?.name}</p>
              <p className='text-xs text-neutral-400'>{equipment.owner?.village}</p>
            </div>
            <div className='flex items-center gap-1 px-3 py-1.5 bg-[#2D6A4F]/10 rounded-xl'>
              <MdVerified size={14} className='text-[#2D6A4F]' />
              <span className='text-xs font-bold text-[#2D6A4F]'>KYC Verified</span>
            </div>
          </div>
        </div>

        {/* Service info */}
        <div className='bg-white rounded-2xl p-5 shadow-sm'>
          <h3 className='font-black text-neutral-900 mb-3'>Service Info</h3>
          <div className='flex flex-col gap-0'>
            {[
              { label: 'Service Radius', value: `${equipment.serviceRadius} km` },
              { label: 'Total Bookings', value: equipment.totalBookings },
              { label: 'Completion Rate', value: `${equipment.completionRate}%` },
            ].map((item, i) => (
              <div key={i} className='flex justify-between py-2.5 border-b border-neutral-50 last:border-0'>
                <span className='text-sm text-neutral-500'>{item.label}</span>
                <span className='font-bold text-sm text-neutral-800'>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer for fixed button */}
        <div className='h-24' />
      </div>

      {/* Fixed Book button */}
      <div className='fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-neutral-100 z-20'>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleBook}
          className='w-full flex items-center justify-center gap-2 py-4 bg-[#2D6A4F] text-white font-black rounded-2xl text-base shadow-xl'
        >
          <MdCalendarToday size={20} />
          {lang === 'en' ? 'Login to Book' : 'लॉगिन करा आणि बुक करा'}
        </motion.button>
        <p className='text-center text-xs text-neutral-400 mt-2'>
          Free to browse · Login required to book
        </p>
      </div>
    </div>
  )
}