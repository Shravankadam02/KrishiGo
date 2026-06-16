import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

export default function FarmerLayout({ children }) {
  return (
    <div className='min-h-screen bg-[#F7F5F0] md:pl-64' style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Sidebar />
      <div className='pb-20 md:pb-0'>
        {children}
      </div>
      <BottomNav />
    </div>
  )
}