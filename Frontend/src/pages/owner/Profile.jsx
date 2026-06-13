import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdVerified, MdWarning, MdLogout, MdAccountBalance } from 'react-icons/md'
import { HiClipboardList } from 'react-icons/hi'
import { FaTractor } from 'react-icons/fa'
import OwnerLayout from '../../components/layout/OwnerLayout'
import useAuthStore from '../../store/authStore'

export default function OwnerProfile() {
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
      icon: FaTractor,
      label: lang === 'en' ? 'My Listings' : 'माझ्या यादी',
      action: () => navigate('/owner/listings'),
      color: 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
    },
    {
      icon: HiClipboardList,
      label: lang === 'en' ? 'Booking Requests' : 'बुकिंग विनंत्या',
      action: () => navigate('/owner/requests'),
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: MdAccountBalance,
      label: lang === 'en' ? 'Earnings & Payouts' : 'कमाई आणि पेआउट',
      action: () => navigate('/owner/earnings'),
      color: 'bg-green-50 text-green-600'
    },
  ]

  return (
    <OwnerLayout>
      <div className='px-4 pt-12 pb-4 flex flex-col gap-4'>

        {/* Profile card */}
        <div className='bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-3xl p-6 relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />
          <div className='relative flex items-center gap-4'>
            <div className='w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center'>
              <span className='text-white font-black text-2xl'>
                {user?.name?.[0] || 'O'}
              </span>
            </div>
            <div className='flex-1'>
              <h2 className='text-white font-black text-lg'>{user?.name}</h2>
              <p className='text-white/60 text-xs mt-0.5'>
                {user?.village}, {user?.taluka}
              </p>
              <div className='flex items-center gap-1 mt-1.5'>
                {user?.kyc?.status === 'approved' ? (
                  <>
                    <MdVerified size={14} className='text-[#95D5B2]' />
                    <span className='text-[#95D5B2] text-xs font-semibold'>KYC Verified</span>
                  </>
                ) : (
                  <>
                    <MdWarning size={14} className='text-amber-400' />
                    <span className='text-amber-400 text-xs font-semibold'>KYC Pending</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='relative grid grid-cols-3 gap-3 mt-5'>
            {[
              { value: user?.totalBookings || 0,    label: lang === 'en' ? 'Bookings' : 'बुकिंग' },
              { value: user?.rating?.toFixed(1) || '—', label: lang === 'en' ? 'Rating' : 'रेटिंग' },
              { value: user?.trustScore || 50,      label: lang === 'en' ? 'Trust' : 'विश्वास' },
            ].map((stat, i) => (
              <div key={i} className='bg-white/10 rounded-2xl p-3 text-center'>
                <p className='text-white font-black text-lg'>{stat.value}</p>
                <p className='text-white/60 text-[11px]'>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bank account info */}
        {user?.bankAccount?.accountName && (
          <div className='bg-white rounded-3xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center'>
              <MdAccountBalance size={20} className='text-green-600' />
            </div>
            <div className='flex-1'>
              <p className='font-black text-neutral-900 text-sm'>
                {user.bankAccount.accountName}
              </p>
              <p className='text-xs text-neutral-400'>
                IFSC: {user.bankAccount.ifscCode}
              </p>
            </div>
            <div className='flex items-center gap-1'>
              <MdVerified size={16} className='text-green-500' />
            </div>
          </div>
        )}

        {/* Menu */}
        <div className='bg-white rounded-3xl shadow-sm overflow-hidden'>
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.99 }}
              onClick={item.action}
              className={`w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 transition-colors
                ${i < menuItems.length - 1 ? 'border-b border-neutral-100' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon size={18} />
              </div>
              <span className='font-semibold text-neutral-700 text-sm flex-1'>
                {item.label}
              </span>
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
              { label: lang === 'en' ? 'Role' : 'भूमिका', value: lang === 'en' ? 'Equipment Owner' : 'उपकरण मालक' },
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

        <p className='text-center text-xs text-neutral-300'>KrishiGo v1.0 · Nashik Pilot</p>
      </div>
    </OwnerLayout>
  )
}