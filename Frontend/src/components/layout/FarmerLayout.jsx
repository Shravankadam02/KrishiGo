import BottomNav from './BottomNav'

export default function FarmerLayout({ children }) {
  return (
    <div className='min-h-screen bg-[#F7F5F0]' style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className='pb-20'>
        {children}
      </div>
      <BottomNav />
    </div>
  )
}