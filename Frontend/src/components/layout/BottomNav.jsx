import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiHome, HiSearch, HiClipboardList, HiUser } from 'react-icons/hi'
import useAuthStore from '../../store/authStore'

const farmerTabs = [
  { path: '/farmer/home',     icon: HiHome,          label: 'Home' },
  { path: '/farmer/explore',  icon: HiSearch,        label: 'Explore' },
  { path: '/farmer/bookings', icon: HiClipboardList, label: 'Bookings' },
  { path: '/farmer/profile',  icon: HiUser,          label: 'Profile' },
]

const ownerTabs = [
  { path: '/owner/home',      icon: HiHome,          label: 'Home' },
  { path: '/owner/listings',  icon: HiClipboardList, label: 'Listings' },
  { path: '/owner/requests',  icon: HiSearch,        label: 'Requests' },
  { path: '/owner/earnings',  icon: HiUser,          label: 'Earnings' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const tabs = user?.role === 'owner' ? ownerTabs : farmerTabs

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100 px-2 pb-safe'
      style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className='flex items-center justify-around max-w-lg mx-auto'>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className='flex flex-col items-center gap-1 py-3 px-4 relative min-w-[60px]'
            >
              {isActive && (
                <div className='absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#2D6A4F] rounded-full' />
              )}
              <tab.icon
                size={22}
                className={`transition-colors ${
                  isActive ? 'text-[#2D6A4F]' : 'text-neutral-400'
                }`}
              />
              <span className={`text-xs font-semibold transition-colors ${
                isActive ? 'text-[#2D6A4F]' : 'text-neutral-400'
              }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}