import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdStar, MdLocationOn, MdEdit, MdLogout, MdVerified } from 'react-icons/md'
import { HiClipboardList } from 'react-icons/hi'
import { FaTractor } from 'react-icons/fa'
import FarmerLayout from '../../components/layout/FarmerLayout'
import useAuthStore from '../../store/authStore'

export default function FarmerProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const lang = localStorage.getItem('language') || 'en'
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  const menuItems = [
    {
      icon: HiClipboardList,
      label: lang === 'en' ? 'My Bookings' : 'माझ्या बुकिंग',
      action: () => navigate('/farmer/bookings'),
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: FaTractor,
      label: lang === 'en' ? 'Find Equipment' : 'उपकरण शोधा',
      action: () => navigate('/farmer/explore'),
      color: 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
    },
    {
      icon: MdEdit,
      label: lang === 'en' ? 'Edit Profile' : 'प्रोफाइल संपादित करा',
      action: () => navigate('/complete-profile'),
      color: 'bg-purple-50 text-purple-600'
    },
  ]

  return (
    <FarmerLayout>
      <div className='px-4 pt-12 pb-4 flex flex-col gap-4'>

        {/* Profile card */}
        <div className='bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-3xl p-6 relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />

          <div className='relative flex items-center gap-4'>
            {/* Avatar */}
            <div className='w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0'>
              <span className='text-white font-black text-2xl'>
                {user?.name?.[0] || 'F'}
              </span>
            </div>

            <div className='flex-1'>
              <h2 className='text-white font-black text-lg'>{user?.name}</h2>
              <div className='flex items-center gap-1 mt-1'>
                <MdLocationOn size={13} className='text-white/60' />
                <span className='text-white/60 text-xs'>
                  {user?.village ? `${user.village}, ${user.taluka}` : 'Nashik District'}
                </span>
              </div>
              {user?.landSize && (
                <span className='inline-block mt-1.5 px-2 py-0.5 bg-white/10 text-white/70 text-[11px] font-semibold rounded-full'>
                  {user.landSize} acres
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className='relative grid grid-cols-3 gap-3 mt-5'>
            {[
              { value: user?.totalBookings || 0, label: lang === 'en' ? 'Bookings' : 'बुकिंग' },
              { value: user?.rating ? user.rating.toFixed(1) : '—', label: lang === 'en' ? 'Rating' : 'रेटिंग' },
              { value: user?.trustScore || 50, label: lang === 'en' ? 'Trust' : 'विश्वास' },
            ].map((stat, i) => (
              <div key={i} className='bg-white/10 rounded-2xl p-3 text-center'>
                <p className='text-white font-black text-lg'>{stat.value}</p>
                <p className='text-white/60 text-[11px]'>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verified badge */}
        <div className='bg-white rounded-3xl p-4 shadow-sm flex items-center gap-3'>
          <div className='w-10 h-10 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center'>
            <MdVerified size={20} className='text-[#2D6A4F]' />
          </div>
          <div className='flex-1'>
            <p className='font-black text-neutral-900 text-sm'>
              {lang === 'en' ? 'Verified Farmer' : 'सत्यापित शेतकरी'}
            </p>
            <p className='text-neutral-400 text-xs'>
              {lang === 'en' ? 'Phone number verified' : 'फोन नंबर सत्यापित'}
            </p>
          </div>
          <div className='w-2 h-2 rounded-full bg-[#2D6A4F]' />
        </div>

        {/* Menu items */}
        <div className='bg-white rounded-3xl shadow-sm overflow-hidden'>
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.99 }}
              onClick={item.action}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-neutral-50
                ${i < menuItems.length - 1 ? 'border-b border-neutral-100' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon size={18} />
              </div>
              <span className='font-semibold text-neutral-700 text-sm flex-1'>
                {item.label}
              </span>
              <MdEdit size={16} className='text-neutral-300' />
            </motion.button>
          ))}
        </div>

        {/* Account info */}
        <div className='bg-white rounded-3xl p-4 shadow-sm'>
          <h3 className='font-black text-neutral-900 text-sm mb-3'>
            {lang === 'en' ? 'Account Info' : 'खाते माहिती'}
          </h3>
          <div className='flex flex-col gap-2'>
            {[
              { label: lang === 'en' ? 'Phone' : 'फोन', value: `+91 ${user?.phone}` },
              { label: lang === 'en' ? 'Role' : 'भूमिका', value: lang === 'en' ? 'Farmer' : 'शेतकरी' },
              { label: lang === 'en' ? 'District' : 'जिल्हा', value: user?.district || 'Nashik' },
              { label: lang === 'en' ? 'Member Since' : 'सदस्य', value: new Date(user?.createdAt).getFullYear() || '2026' },
            ].map((item, i) => (
              <div key={i} className='flex justify-between py-2 border-b border-neutral-50 last:border-0'>
                <span className='text-neutral-400 text-xs'>{item.label}</span>
                <span className='font-semibold text-neutral-700 text-xs'>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          disabled={loggingOut}
          className='w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 font-black rounded-2xl text-sm border-2 border-red-100'
        >
          {loggingOut ? (
            <span className='w-5 h-5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin' />
          ) : (
            <>
              <MdLogout size={18} />
              {lang === 'en' ? 'Logout' : 'लॉगआउट'}
            </>
          )}
        </motion.button>

        <p className='text-center text-xs text-neutral-300'>
          KrishiGo v1.0 · Nashik Pilot
        </p>

      </div>
    </FarmerLayout>
  )
}