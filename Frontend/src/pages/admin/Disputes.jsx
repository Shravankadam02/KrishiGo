import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { MdGavel } from 'react-icons/md'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import { formatDate, formatPrice } from '../../utils/helpers'

const rulingOptions = [
  { key: 'farmer_right',   label: 'Farmer Right' },
  { key: 'farmer_partial', label: 'Farmer Partial' },
  { key: 'split',          label: 'Split' },
  { key: 'owner_right',    label: 'Owner Right' },
  { key: 'insufficient',   label: 'Insufficient Evidence' },
]

export default function AdminDisputes() {
  const navigate = useNavigate()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/disputes', {
        params: { status: 'open' }
      })
      setDisputes(data.disputes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (disputeId) => {
    const ruling = window.prompt(
      `Select ruling:\n${rulingOptions.map((r, i) => `${i + 1}. ${r.label}`).join('\n')}\n\nEnter number:`
    )
    if (!ruling) return
    const selectedRuling = rulingOptions[parseInt(ruling) - 1]
    if (!selectedRuling) return alert('Invalid selection')

    const notes = window.prompt('Admin notes (optional):') || ''

    setResolving(disputeId)
    try {
      await api.put(`/api/admin/disputes/${disputeId}/resolve`, {
        ruling: selectedRuling.key,
        adminNotes: notes
      })
      fetchDisputes()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve')
    } finally {
      setResolving(null)
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
            <h1 className='font-black text-neutral-900 text-base'>Disputes</h1>
            <p className='text-xs text-neutral-400'>{disputes.length} open</p>
          </div>
        </div>
      </div>

      <div className='px-4 py-4'>
        {loading ? (
          <div className='flex flex-col gap-3'>
            {[1, 2].map(i => (
              <div key={i} className='bg-white rounded-3xl h-48 animate-pulse' />
            ))}
          </div>
        ) : disputes.length === 0 ? (
          <div className='text-center py-16'>
            <MdGavel size={48} className='text-neutral-200 mx-auto mb-4' />
            <p className='text-neutral-400 font-semibold'>No open disputes</p>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {disputes.map((dispute, i) => (
              <motion.div
                key={dispute._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className='bg-white rounded-3xl p-4 shadow-sm'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <span className='px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full'>
                      {dispute.type?.replace(/_/g, ' ')}
                    </span>
                    <p className='text-xs text-neutral-400 mt-1'>
                      Filed {formatDate(dispute.createdAt)}
                    </p>
                  </div>
                  <span className='px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full'>
                    {dispute.status}
                  </span>
                </div>

                <p className='text-sm text-neutral-700 mb-3 leading-relaxed'>
                  {dispute.description}
                </p>

                <div className='flex gap-2 mb-3'>
                  <div className='flex-1 bg-[#F7F5F0] rounded-xl p-2.5'>
                    <p className='text-[10px] text-neutral-400'>Filed By</p>
                    <p className='text-xs font-bold text-neutral-800'>
                      {dispute.filedBy?.name} ({dispute.filedBy?.role})
                    </p>
                  </div>
                  <div className='flex-1 bg-[#F7F5F0] rounded-xl p-2.5'>
                    <p className='text-[10px] text-neutral-400'>Against</p>
                    <p className='text-xs font-bold text-neutral-800'>
                      {dispute.filedAgainst?.name} ({dispute.filedAgainst?.role})
                    </p>
                  </div>
                </div>

                {dispute.evidence?.length > 0 && (
                  <div className='flex gap-2 mb-3 overflow-x-auto'>
                    {dispute.evidence.map((url, j) => (
                      <a key={j} href={url} target='_blank' rel='noreferrer'>
                        <img src={url} alt='' className='w-16 h-16 rounded-xl object-cover flex-shrink-0' />
                      </a>
                    ))}
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleResolve(dispute._id)}
                  disabled={resolving === dispute._id}
                  className='w-full flex items-center justify-center gap-2 py-3 bg-[#2D6A4F] text-white rounded-2xl text-sm font-bold disabled:opacity-60'
                >
                  {resolving === dispute._id ? (
                    <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  ) : (
                    <>
                      <MdGavel size={18} />
                      Make Ruling
                    </>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}