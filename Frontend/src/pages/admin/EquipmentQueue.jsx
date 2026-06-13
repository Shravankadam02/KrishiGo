import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { MdCheck, MdClose, MdLocationOn } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import { formatPrice, formatDate } from '../../utils/helpers'

export default function EquipmentQueue() {
  const navigate = useNavigate()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/equipment/queue')
      setQueue(data.queue || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (equipmentId, action) => {
    let reason = ''
    if (action === 'reject') {
      reason = window.prompt('Rejection reason:')
      if (!reason) return
    }
    setActionLoading(equipmentId + '_' + action)
    try {
      await api.put(`/api/admin/equipment/${equipmentId}`, { action, reason })
      fetchQueue()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout>
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <div>
            <h1 className='font-black text-neutral-900 text-base'>Equipment Queue</h1>
            <p className='text-xs text-neutral-400'>{queue.length} pending</p>
          </div>
        </div>
      </div>

      <div className='px-4 py-4'>
        {loading && (
          <div className='flex flex-col gap-3'>
            {[1, 2].map(i => (
              <div key={i} className='bg-white rounded-3xl h-48 animate-pulse' />
            ))}
          </div>
        )}

        {!loading && queue.length === 0 && (
          <div className='text-center py-16'>
            <MdCheck size={48} className='text-green-200 mx-auto mb-4' />
            <p className='text-neutral-400 font-semibold'>All equipment listings reviewed</p>
          </div>
        )}

        {!loading && queue.length > 0 && (
          <div className='flex flex-col gap-4'>
            {queue.map((eq, i) => (
              <motion.div
                key={eq._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className='bg-white rounded-3xl p-4 shadow-sm'
              >
                {/* Photos */}
                {eq.photos?.length > 0 && (
                  <div className='flex gap-2 mb-4 overflow-x-auto'>
                    {eq.photos.map((photo, j) => (
                      <img
                        key={j}
                        src={photo}
                        alt=''
                        className='w-24 h-24 rounded-2xl object-cover flex-shrink-0'
                      />
                    ))}
                  </div>
                )}

                {/* Equipment info */}
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <p className='font-black text-neutral-900 capitalize'>
                      {eq.type.replace(/_/g, ' ')}
                    </p>
                    <div className='flex items-center gap-1 mt-1'>
                      <MdLocationOn size={12} className='text-neutral-400' />
                      <span className='text-xs text-neutral-400'>
                        {eq.village}, {eq.taluka}
                      </span>
                    </div>
                    <p className='text-xs text-neutral-400 mt-0.5'>
                      Submitted {formatDate(eq.createdAt)}
                    </p>
                  </div>
                  <p className='font-black text-[#2D6A4F]'>
                    {formatPrice(eq.pricePerAcre)}/acre
                  </p>
                </div>

                {/* Specs */}
                {eq.specs && Object.keys(eq.specs).length > 0 && (
                  <div className='flex flex-wrap gap-2 mb-3'>
                    {Object.entries(eq.specs).map(([key, val]) => (
                      <span key={key}
                        className='px-2 py-1 bg-[#F7F5F0] rounded-xl text-[11px] font-semibold text-neutral-500 capitalize'>
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}

                {/* Owner info */}
                <div className='flex items-center gap-2 p-2.5 bg-[#F7F5F0] rounded-xl mb-3'>
                  <div className='w-8 h-8 rounded-xl bg-[#2D6A4F] flex items-center justify-center'>
                    <span className='text-white font-black text-sm'>
                      {eq.owner?.name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-neutral-800'>{eq.owner?.name}</p>
                    <p className='text-[11px] text-neutral-400'>+91 {eq.owner?.phone}</p>
                  </div>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    eq.owner?.kyc?.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    KYC {eq.owner?.kyc?.status}
                  </span>
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAction(eq._id, 'approve')}
                    disabled={actionLoading === eq._id + '_approve'}
                    className='flex-1 flex items-center justify-center gap-2 py-3 bg-[#2D6A4F] text-white rounded-2xl text-sm font-bold disabled:opacity-60'
                  >
                    {actionLoading === eq._id + '_approve' ? (
                      <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    ) : (
                      <>
                        <MdCheck size={18} />
                        Approve
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAction(eq._id, 'reject')}
                    disabled={actionLoading === eq._id + '_reject'}
                    className='flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-2xl text-sm font-bold border border-red-100 disabled:opacity-60'
                  >
                    <MdClose size={18} />
                    Reject
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}