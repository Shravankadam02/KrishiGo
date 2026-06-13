import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdPeople, MdAgriculture, MdVerifiedUser, MdGavel, MdArrowForward, MdAccountBalance } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import AdminLayout from '../../components/layout/AdminLayout'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import { formatPrice } from '../../utils/helpers'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/admin/dashboard')
        setDashboard(data.dashboard)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const kpiCards = dashboard ? [
    {
      label: 'Farmers',
      value: dashboard.users.farmers,
      Icon: MdPeople,
      color: 'bg-blue-50 text-blue-600',
      action: () => navigate('/admin/users')
    },
    {
      label: 'Owners',
      value: dashboard.users.owners,
      Icon: MdPeople,
      color: 'bg-purple-50 text-purple-600',
      action: () => navigate('/admin/users')
    },
    {
      label: 'Active Equipment',
      value: dashboard.equipment.active,
      Icon: FaTractor,
      color: 'bg-green-50 text-green-600',
      action: () => navigate('/admin/equipment')
    },
    {
      label: 'Total Bookings',
      value: dashboard.bookings.total,
      Icon: MdAgriculture,
      color: 'bg-orange-50 text-orange-600',
      action: null
    },
  ] : []

  const urgentCards = dashboard ? [
    {
      label: 'Pending KYC',
      value: dashboard.kyc.pending,
      color: dashboard.kyc.pending > 0 ? 'bg-amber-500' : 'bg-neutral-300',
      action: () => navigate('/admin/kyc')
    },
    {
      label: 'Equipment Queue',
      value: dashboard.equipment.pendingVerification,
      color: dashboard.equipment.pendingVerification > 0 ? 'bg-blue-500' : 'bg-neutral-300',
      action: () => navigate('/admin/equipment')
    },
    {
      label: 'Open Disputes',
      value: dashboard.disputes.open,
      color: dashboard.disputes.open > 0 ? 'bg-red-500' : 'bg-neutral-300',
      action: () => navigate('/admin/disputes')
    },
  ] : []

  return (
    <AdminLayout>
      {/* Header */}
      <div className='bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-5 pt-12 pb-16 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='relative'>
          <p className='text-white/60 text-xs font-medium'>Admin Panel</p>
          <h1 className='text-white text-lg font-black'>{user?.name}</h1>
          <p className='text-white/50 text-xs mt-1'>KrishiGo · Nashik Pilot</p>
        </div>
      </div>

      <div className='px-4 -mt-8 relative z-10 flex flex-col gap-4'>

        {/* Weekly GMV */}
        {dashboard && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-3xl p-5 shadow-sm'
          >
            <p className='text-xs font-semibold text-neutral-400 mb-1'>Weekly GMV</p>
            <p className='text-3xl font-black text-[#2D6A4F]'>
              {formatPrice(dashboard.weekly.gmv)}
            </p>
            <div className='flex gap-4 mt-3'>
              <div>
                <p className='text-[11px] text-neutral-400'>Commission</p>
                <p className='font-black text-neutral-800 text-sm'>
                  {formatPrice(dashboard.weekly.commission)}
                </p>
              </div>
              <div>
                <p className='text-[11px] text-neutral-400'>Bookings</p>
                <p className='font-black text-neutral-800 text-sm'>
                  {dashboard.weekly.bookings}
                </p>
              </div>
              <div>
                <p className='text-[11px] text-neutral-400'>Completed</p>
                <p className='font-black text-neutral-800 text-sm'>
                  {dashboard.bookings.completed}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Urgent actions */}
        {dashboard && (
          <div>
            <h2 className='font-black text-neutral-900 text-sm mb-3'>
              Needs Attention
            </h2>
            <div className='grid grid-cols-3 gap-3'>
              {urgentCards.map((card, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={card.action}
                  className='bg-white rounded-3xl p-3 shadow-sm cursor-pointer text-center'
                >
                  <div className={`w-10 h-10 rounded-2xl ${card.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className='text-white font-black text-lg'>{card.value}</span>
                  </div>
                  <p className='text-[11px] font-semibold text-neutral-500 leading-tight'>
                    {card.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Grid */}
        {loading ? (
          <div className='grid grid-cols-2 gap-3'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='bg-white rounded-3xl h-24 animate-pulse' />
            ))}
          </div>
        ) : (
          <div>
            <h2 className='font-black text-neutral-900 text-sm mb-3'>Platform Overview</h2>
            <div className='grid grid-cols-2 gap-3'>
              {kpiCards.map((card, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={card.action}
                  className='bg-white rounded-3xl p-4 shadow-sm cursor-pointer'
                >
                  <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center mb-2`}>
                    <card.Icon size={18} />
                  </div>
                  <p className='font-black text-neutral-900 text-xl'>{card.value}</p>
                  <p className='text-xs text-neutral-400 mt-0.5'>{card.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className='flex flex-col gap-2'>
          {[
            { label: 'Review KYC Applications', path: '/admin/kyc', Icon: MdVerifiedUser, badge: dashboard?.kyc.pending },
            { label: 'Verify Equipment Listings', path: '/admin/equipment', Icon: FaTractor, badge: dashboard?.equipment.pendingVerification },
            { label: 'Resolve Disputes', path: '/admin/disputes', Icon: MdGavel, badge: dashboard?.disputes.open },
            { label: 'Generate Weekly Payouts', path: null, Icon: MdAccountBalance, badge: null, action: async () => {
              try {
                await api.post('/api/admin/payouts/generate')
                alert('Payouts generated successfully')
              } catch (err) {
                alert(err.response?.data?.message || 'Failed')
              }
            }},
          ].map((item, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={item.action || (() => navigate(item.path))}
              className='bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 cursor-pointer'
            >
              <div className='w-9 h-9 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center'>
                <item.Icon size={18} className='text-[#2D6A4F]' />
              </div>
              <span className='font-semibold text-neutral-700 text-sm flex-1'>
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className='px-2 py-0.5 bg-[#E76F51] text-white text-xs font-black rounded-full'>
                  {item.badge}
                </span>
              )}
              <MdArrowForward size={16} className='text-neutral-300' />
            </motion.div>
          ))}
        </div>

      </div>
    </AdminLayout>
  )
}