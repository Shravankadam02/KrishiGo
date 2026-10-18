import { useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { farmerTabs, ownerTabs, adminTabs } from '../../utils/navigation'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const tabs = user?.role === 'admin' 
    ? adminTabs 
    : user?.role === 'owner' 
      ? ownerTabs 
      : farmerTabs

  return (
    <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100 px-2 pb-safe'
      style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className='flex items-center justify-around max-w-lg mx-auto'>
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className='flex flex-col items-center gap-0.5 py-2.5 px-1 relative flex-1 min-w-0'
            >
              {isActive && (
                <div className='absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#2D6A4F] rounded-full' />
              )}
              <tab.icon
                size={20}
                className={`transition-colors shrink-0 ${
                  isActive ? 'text-[#2D6A4F]' : 'text-neutral-400'
                }`}
              />
              <span className={`text-[11px] font-semibold transition-colors truncate max-w-full ${
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