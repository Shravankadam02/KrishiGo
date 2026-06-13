import { useNavigate, useLocation } from 'react-router-dom'
import { MdDashboard, MdVerifiedUser, MdAgriculture, MdPeople, MdGavel } from 'react-icons/md'

const tabs = [
  { path: '/admin/dashboard',  Icon: MdDashboard,    label: 'Dashboard' },
  { path: '/admin/kyc',        Icon: MdVerifiedUser, label: 'KYC' },
  { path: '/admin/equipment',  Icon: MdAgriculture,  label: 'Equipment' },
  { path: '/admin/users',      Icon: MdPeople,       label: 'Users' },
  { path: '/admin/disputes',   Icon: MdGavel,        label: 'Disputes' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className='min-h-screen bg-[#F7F5F0]' style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className='pb-20'>
        {children}
      </div>

      {/* Bottom nav */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100'>
        <div className='flex items-stretch'>
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className='flex-1 flex flex-col items-center justify-center gap-1 py-3 relative'
              >
                {isActive && (
                  <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#2D6A4F] rounded-full'
                    style={{ left: '50%', transform: 'translateX(-50%)', width: 32 }}
                  />
                )}
                <tab.Icon
                  size={20}
                  className={isActive ? 'text-[#2D6A4F]' : 'text-neutral-400'}
                />
                <span className={`text-[10px] font-semibold ${
                  isActive ? 'text-[#2D6A4F]' : 'text-neutral-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}