import { useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { farmerTabs, ownerTabs, adminTabs } from '../../utils/navigation'
import logo from '../../assets/logo.png'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Determine which tabs to show based on the user's role
  const tabs = user?.role === 'admin' 
    ? adminTabs 
    : user?.role === 'owner' 
      ? ownerTabs 
      : farmerTabs

  return (
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-neutral-200 z-50 shadow-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="p-6">
        <img src={logo} alt="KrishiGo Logo" className="h-10 w-auto object-contain" />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                isActive 
                  ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 font-semibold'
              }`}
            >
              <tab.icon size={22} className={isActive ? 'text-[#2D6A4F]' : 'text-neutral-400'} />
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#2D6A4F] rounded-r-full" />
              )}
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-neutral-100">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-semibold bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
