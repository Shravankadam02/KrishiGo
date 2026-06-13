import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { MdCheck, MdClose, MdOpenInNew } from 'react-icons/md'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import { formatDate } from '../../utils/helpers'

export default function KycQueue() {
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
      const { data } = await api.get('/api/admin/kyc')
      setQueue(data.queue || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId, action) => {
    let reason = ''

    if (action === 'reject') {
      reason = window.prompt('Rejection reason:')
      if (!reason) return
    }

    setActionLoading(`${userId}_${action}`)

    try {
      await api.put(`/api/admin/kyc/${userId}`, {
        action,
        reason
      })

      fetchQueue()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>

          <div>
            <h1 className='font-black text-neutral-900 text-base'>
              KYC Queue
            </h1>
            <p className='text-xs text-neutral-400'>
              {queue.length} pending
            </p>
          </div>
        </div>
      </div>

      <div className='px-4 py-4'>
        {/* Loading State */}
        {loading && (
          <div className='flex flex-col gap-3'>
            {[1, 2].map(i => (
              <div
                key={i}
                className='bg-white rounded-3xl h-48 animate-pulse'
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && queue.length === 0 && (
          <div className='text-center py-16'>
            <MdCheck
              size={48}
              className='text-green-200 mx-auto mb-4'
            />
            <p className='text-neutral-400 font-semibold'>
              All KYC applications reviewed
            </p>
          </div>
        )}

        {/* Queue */}
        {!loading && queue.length > 0 && (
          <div className='flex flex-col gap-4'>
            {queue.map((owner, i) => (
              <motion.div
                key={owner._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className='bg-white rounded-3xl p-4 shadow-sm'
              >
                {/* Owner Info */}
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 rounded-2xl bg-[#2D6A4F] flex items-center justify-center'>
                    <span className='text-white font-black text-lg'>
                      {owner.name?.[0]?.toUpperCase()}
                    </span>
                  </div>

                  <div className='flex-1'>
                    <p className='font-black text-neutral-900'>
                      {owner.name}
                    </p>

                    <p className='text-xs text-neutral-400'>
                      +91 {owner.phone}
                    </p>

                    <p className='text-xs text-neutral-400'>
                      {owner.village}, {owner.taluka}
                    </p>
                  </div>

                  <p className='text-xs text-neutral-400'>
                    {formatDate(owner.kyc?.submittedAt)}
                  </p>
                </div>

                {/* Bank Details */}
                <div className='bg-[#F7F5F0] rounded-2xl p-3 mb-3'>
                  <p className='text-xs font-semibold text-neutral-500 mb-1'>
                    Bank Account
                  </p>

                  <p className='text-sm font-bold text-neutral-800'>
                    {owner.bankAccount?.accountName}
                  </p>

                  <p className='text-xs text-neutral-400'>
                    IFSC: {owner.bankAccount?.ifscCode}
                  </p>
                </div>

                {/* Documents */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  {[
                    {
                      label: 'Aadhaar',
                      url: owner.aadhaarUrl
                    },
                    {
                      label: 'PAN',
                      url: owner.panUrl
                    }
                  ]
                    .filter(doc => doc.url)
                    .map((doc, j) => (
                      <a
                        key={j}
                        href={doc.url}
                        target='_blank'
                        rel='noreferrer'
                        className='flex items-center gap-2 p-2.5 bg-[#F7F5F0] rounded-xl hover:bg-[#2D6A4F]/10 transition-colors'
                      >
                        <MdOpenInNew
                          size={16}
                          className='text-[#2D6A4F]'
                        />

                        <span className='text-xs font-bold text-[#2D6A4F]'>
                          View {doc.label}
                        </span>
                      </a>
                    ))}
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      handleAction(owner._id, 'approve')
                    }
                    disabled={
                      actionLoading ===
                      `${owner._id}_approve`
                    }
                    className='flex-1 flex items-center justify-center gap-2 py-3 bg-[#2D6A4F] text-white rounded-2xl text-sm font-bold disabled:opacity-60'
                  >
                    {actionLoading ===
                    `${owner._id}_approve` ? (
                      <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    ) : (
                      <>
                        <MdCheck size={18} />
                        Approve KYC
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      handleAction(owner._id, 'reject')
                    }
                    disabled={
                      actionLoading ===
                      `${owner._id}_reject`
                    }
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