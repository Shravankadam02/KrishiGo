import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiSearch } from 'react-icons/hi'
import { MdVerified, MdBlock } from 'react-icons/md'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'

const roleTabs = [
  { key: 'all',    label: 'All' },
  { key: 'farmer', label: 'Farmers' },
  { key: 'owner',  label: 'Owners' },
]

export default function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [role])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (role !== 'all') params.role = role
      if (search) params.search = search
      const { data } = await api.get('/api/admin/users', { params })
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId) => {
    const days = window.prompt('Suspend for how many days?')
    if (!days) return
    const reason = window.prompt('Reason for suspension:')
    if (!reason) return

    setActionLoading(userId)
    try {
      await api.put(`/api/admin/users/${userId}/suspend`, {
        days: Number(days), reason
      })
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout>
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3 mb-3'>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <h1 className='font-black text-neutral-900 text-base flex-1'>Users</h1>
          <p className='text-xs text-neutral-400'>{users.length} total</p>
        </div>

        {/* Search */}
        <div className='flex items-center gap-2 bg-[#F7F5F0] rounded-2xl px-3 py-2.5 mb-3'>
          <HiSearch size={16} className='text-neutral-400' />
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchUsers()}
            placeholder='Search by name, phone, village...'
            className='flex-1 bg-transparent text-sm focus:outline-none text-neutral-700 placeholder:text-neutral-400'
          />
        </div>

        {/* Role tabs */}
        <div className='flex gap-2'>
          {roleTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setRole(tab.key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                role === tab.key
                  ? 'bg-[#2D6A4F] text-white'
                  : 'bg-[#F7F5F0] text-neutral-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className='px-4 py-4'>
        {loading ? (
          <div className='flex flex-col gap-3'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='bg-white rounded-3xl h-20 animate-pulse' />
            ))}
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {users.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className='bg-white rounded-3xl p-4 shadow-sm'
              >
                <div className='flex items-center gap-3'>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    u.role === 'farmer' ? 'bg-blue-100' : 'bg-[#2D6A4F]/10'
                  }`}>
                    <span className={`font-black text-lg ${
                      u.role === 'farmer' ? 'text-blue-600' : 'text-[#2D6A4F]'
                    }`}>
                      {u.name?.[0]}
                    </span>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='font-black text-neutral-900 text-sm'>{u.name}</p>
                      {u.kyc?.status === 'approved' && (
                        <MdVerified size={14} className='text-[#2D6A4F]' />
                      )}
                    </div>
                    <p className='text-xs text-neutral-400'>+91 {u.phone}</p>
                    <p className='text-xs text-neutral-400'>
                      {u.village} · Trust: {u.trustScore}
                    </p>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'farmer'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                    }`}>
                      {u.role}
                    </span>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleSuspend(u._id)}
                        disabled={actionLoading === u._id}
                        className='flex items-center gap-1 text-[10px] text-red-400 font-bold'
                      >
                        <MdBlock size={12} />
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}