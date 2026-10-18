import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiArrowLeft,
  HiCheckCircle,
  HiUpload,
  HiShieldCheck,
  HiDocumentText,
  HiTrash
} from 'react-icons/hi'
import {
  MdVerifiedUser,
  MdSchedule,
  MdWarning,
  MdAccountBalance,
  MdLockOutline,
  MdArrowForward,
  MdRefresh
} from 'react-icons/md'
import OwnerLayout from '../../components/layout/OwnerLayout'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import { formatDate } from '../../utils/helpers'

export default function Kyc() {
  const navigate = useNavigate()
  const { user, getMe } = useAuthStore()
  const lang = localStorage.getItem('language') || 'en'
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [kycData, setKycData] = useState(null)
  const [steps, setSteps] = useState([])
  const [bankInfo, setBankInfo] = useState(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isResubmitting, setIsResubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    accountName: user?.name || '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    aadhaarFile: null,
    panFile: null,
  })

  // Previews
  const [previews, setPreviews] = useState({
    aadhaar: null,
    pan: null,
  })

  useEffect(() => {
    fetchKYCStatus()
  }, [])

  const fetchKYCStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/kyc/status')
      setKycData(data.kyc)
      setSteps(data.steps || [])
      if (data.bankAccount) {
        setBankInfo(data.bankAccount)
      }
    } catch (err) {
      console.error('Failed to fetch KYC status:', err)
      // Fallback to user from store
      if (user?.kyc) {
        setKycData(user.kyc)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleFileChange = (field, file) => {
    if (!file) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError(lang === 'en' ? 'File size must be under 10MB' : 'फाइल आकार 10MB पेक्षा कमी असावा')
      return
    }

    setForm(prev => ({ ...prev, [field]: file }))
    setError('')

    // Generate preview
    const previewUrl = URL.createObjectURL(file)
    if (field === 'aadhaarFile') {
      setPreviews(prev => ({ ...prev, aadhaar: { url: previewUrl, name: file.name, size: (file.size / 1024 / 1024).toFixed(2) } }))
    } else {
      setPreviews(prev => ({ ...prev, pan: { url: previewUrl, name: file.name, size: (file.size / 1024 / 1024).toFixed(2) } }))
    }
  }

  const removeFile = (field) => {
    setForm(prev => ({ ...prev, [field]: null }))
    if (field === 'aadhaarFile') {
      setPreviews(prev => ({ ...prev, aadhaar: null }))
    } else {
      setPreviews(prev => ({ ...prev, pan: null }))
    }
  }

  const validateForm = () => {
    if (!form.accountName.trim()) {
      setError(lang === 'en' ? 'Account holder name is required' : 'खातेदाराचे नाव आवश्यक आहे')
      return false
    }
    if (!form.accountNumber.trim()) {
      setError(lang === 'en' ? 'Bank account number is required' : 'बँक खाते क्रमांक आवश्यक आहे')
      return false
    }
    if (form.accountNumber !== form.confirmAccountNumber) {
      setError(lang === 'en' ? 'Bank account numbers do not match' : 'बँक खाते क्रमांक जुळत नाहीत')
      return false
    }
    if (!form.ifscCode.trim()) {
      setError(lang === 'en' ? 'IFSC code is required' : 'IFSC कोड आवश्यक आहे')
      return false
    }
    if (!form.aadhaarFile) {
      setError(lang === 'en' ? 'Please upload your Aadhaar document' : 'कृपया आधार कार्ड दस्तऐवज अपलोड करा')
      return false
    }
    if (!form.panFile) {
      setError(lang === 'en' ? 'Please upload your PAN document' : 'कृपया पॅन कार्ड दस्तऐवज अपलोड करा')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setError('')
    setSuccessMsg('')

    try {
      const formData = new FormData()
      formData.append('accountName', form.accountName.trim())
      formData.append('accountNumber', form.accountNumber.trim())
      formData.append('ifscCode', form.ifscCode.trim().toUpperCase())
      formData.append('aadhaar', form.aadhaarFile)
      formData.append('pan', form.panFile)

      const { data } = await api.post('/api/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccessMsg(data.message || (lang === 'en' ? 'KYC submitted successfully!' : 'KYC यशस्वीरित्या सादर केले!'))
      setIsResubmitting(false)

      // Refresh user auth state
      await getMe()
      await fetchKYCStatus()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || (lang === 'en' ? 'Failed to submit KYC' : 'KYC सादर करण्यात अयशस्वी'))
    } finally {
      setSubmitting(false)
    }
  }

  const currentStatus = isResubmitting ? 'not_submitted' : (kycData?.status || user?.kyc?.status || 'not_submitted')

  return (
    <OwnerLayout>
      {/* Sticky Header */}
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/owner/home')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center hover:bg-neutral-200 transition-colors'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <div className='flex-1'>
            <h1 className='font-black text-neutral-900 text-base'>
              {lang === 'en' ? 'KYC Verification' : 'KYC पडताळणी'}
            </h1>
            <p className='text-xs text-neutral-400'>
              {lang === 'en' ? 'Owner identity & payout verification' : 'मालक ओळख व बँक पडताळणी'}
            </p>
          </div>
          <button
            onClick={fetchKYCStatus}
            disabled={loading}
            title={lang === 'en' ? 'Refresh status' : 'स्थिती रीफ्रेश करा'}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center text-neutral-500 hover:text-neutral-900'
          >
            <MdRefresh size={18} className={loading ? 'animate-spin text-[#2D6A4F]' : ''} />
          </button>
        </div>
      </div>

      <div className='max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4'>

        {/* Demo Mode Notice */}
        {isDemo && (
          <div className='bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2'>
            <span className='text-base'>⚠️</span>
            <span>
              {lang === 'en'
                ? 'Demo Mode Active: Please DO NOT upload real Aadhaar, PAN or sensitive bank documents.'
                : 'डेमो मोड सक्रिय: कृपया खरी आधार, पॅन किंवा बँक कागदपत्रे अपलोड करू नका.'}
            </span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className='flex flex-col gap-3'>
            <div className='bg-white rounded-3xl h-44 animate-pulse' />
            <div className='bg-white rounded-3xl h-64 animate-pulse' />
          </div>
        )}

        {/* KYC Approved State */}
        {!loading && currentStatus === 'approved' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col gap-4'
          >
            <div className='bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white rounded-3xl p-6 relative overflow-hidden shadow-md'>
              <div className='absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />
              
              <div className='flex items-center gap-4 mb-4 relative z-10'>
                <div className='w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0'>
                  <MdVerifiedUser size={32} className='text-[#95D5B2]' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h2 className='font-black text-lg'>
                      {lang === 'en' ? 'KYC Verified' : 'KYC मंजूर झाले'}
                    </h2>
                    <span className='bg-[#95D5B2]/20 text-[#95D5B2] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#95D5B2]/30'>
                      Active
                    </span>
                  </div>
                  <p className='text-white/70 text-xs mt-0.5'>
                    {lang === 'en'
                      ? 'Your account is verified. You can list machinery and accept booking requests.'
                      : 'तुमचे खाते पडताळणी पूर्ण झाले आहे. तुम्ही आता उपकरणे जोडू शकता.'}
                  </p>
                </div>
              </div>

              {kycData?.verifiedAt && (
                <div className='bg-white/10 rounded-2xl px-4 py-2.5 text-xs text-white/80 flex items-center justify-between'>
                  <span>{lang === 'en' ? 'Verified Date' : 'पडताळणी तारीख'}</span>
                  <span className='font-bold text-white'>{formatDate(kycData.verifiedAt)}</span>
                </div>
              )}
            </div>

            {/* Bank details summary */}
            {(bankInfo?.accountName || user?.bankAccount?.accountName) && (
              <div className='bg-white rounded-3xl p-5 shadow-sm border border-neutral-100'>
                <div className='flex items-center gap-2 mb-3'>
                  <MdAccountBalance size={18} className='text-[#2D6A4F]' />
                  <h3 className='font-black text-neutral-900 text-sm'>
                    {lang === 'en' ? 'Linked Payout Bank Account' : 'जोडलेले बँक खाते'}
                  </h3>
                </div>
                <div className='space-y-2 text-xs'>
                  <div className='flex justify-between py-1.5 border-b border-neutral-100'>
                    <span className='text-neutral-400'>{lang === 'en' ? 'Account Holder' : 'खातेदाराचे नाव'}</span>
                    <span className='font-bold text-neutral-800'>{bankInfo?.accountName || user?.bankAccount?.accountName}</span>
                  </div>
                  <div className='flex justify-between py-1.5 border-b border-neutral-100'>
                    <span className='text-neutral-400'>IFSC</span>
                    <span className='font-mono font-bold text-neutral-800'>{bankInfo?.ifscCode || user?.bankAccount?.ifscCode}</span>
                  </div>
                  <div className='flex justify-between py-1.5'>
                    <span className='text-neutral-400'>{lang === 'en' ? 'Status' : 'स्थिती'}</span>
                    <span className='font-bold text-emerald-600 flex items-center gap-1'>
                      <HiCheckCircle size={14} /> {lang === 'en' ? 'Verified for Payouts' : 'पेआउटसाठी सत्यापित'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='grid grid-cols-2 gap-3 mt-2'>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/owner/add-equipment')}
                className='flex items-center justify-center gap-2 py-3.5 bg-[#2D6A4F] text-white font-bold rounded-2xl text-sm shadow-md'
              >
                <span>{lang === 'en' ? 'Add Equipment' : 'उपकरण जोडा'}</span>
                <MdArrowForward size={16} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/owner/listings')}
                className='flex items-center justify-center gap-2 py-3.5 bg-white text-neutral-800 font-bold rounded-2xl text-sm border border-neutral-200'
              >
                <span>{lang === 'en' ? 'My Listings' : 'माझ्या यादी'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* KYC Pending State */}
        {!loading && currentStatus === 'pending' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col gap-4'
          >
            <div className='bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-6 relative overflow-hidden shadow-md'>
              <div className='absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />

              <div className='flex items-center gap-4 mb-4 relative z-10'>
                <div className='w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse'>
                  <MdSchedule size={32} className='text-white' />
                </div>
                <div>
                  <h2 className='font-black text-lg'>
                    {lang === 'en' ? 'KYC Under Review' : 'KYC तपासणी सुरू आहे'}
                  </h2>
                  <p className='text-white/80 text-xs mt-0.5'>
                    {lang === 'en'
                      ? 'Your documents have been submitted and are currently being verified by the KrishiGo admin team.'
                      : 'तुमचे कागदपत्रे प्रशासकाद्वारे तपासणीत आहेत. साधारणतः २४ तासांत पडताळणी पूर्ण होते.'}
                  </p>
                </div>
              </div>

              {kycData?.submittedAt && (
                <div className='bg-black/15 rounded-2xl px-4 py-2.5 text-xs text-white/90 flex items-center justify-between'>
                  <span>{lang === 'en' ? 'Submitted On' : 'सादर केलेली तारीख'}</span>
                  <span className='font-bold'>{formatDate(kycData.submittedAt)}</span>
                </div>
              )}
            </div>

            {/* Stepper Timeline */}
            <div className='bg-white rounded-3xl p-5 shadow-sm border border-neutral-100'>
              <h3 className='font-black text-neutral-900 text-sm mb-4'>
                {lang === 'en' ? 'Verification Progress' : 'पडताळणी प्रगती'}
              </h3>

              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
                    <HiCheckCircle size={20} />
                  </div>
                  <div>
                    <p className='font-bold text-xs text-neutral-800'>
                      {lang === 'en' ? 'Documents & Bank Submitted' : 'कागदपत्रे व बँक तपशील सादर केले'}
                    </p>
                    <p className='text-[11px] text-neutral-400'>
                      {lang === 'en' ? 'Aadhaar, PAN, and Bank details uploaded' : 'आधार, पॅन आणि बँक माहिती प्राप्त झाली'}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 animate-pulse'>
                    <MdSchedule size={18} />
                  </div>
                  <div>
                    <p className='font-bold text-xs text-neutral-800'>
                      {lang === 'en' ? 'Admin Review In Progress' : 'प्रशासक तपासणी सुरू'}
                    </p>
                    <p className='text-[11px] text-neutral-400'>
                      {lang === 'en' ? 'Verification usually takes 12-24 hours' : 'साधारणपणे १२-२४ तास लागतात'}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3 opacity-50'>
                  <div className='w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0 mt-0.5'>
                    <HiShieldCheck size={18} />
                  </div>
                  <div>
                    <p className='font-bold text-xs text-neutral-800'>
                      {lang === 'en' ? 'Ready to List Equipment' : 'उपकरणे नोंदणीसाठी तयार'}
                    </p>
                    <p className='text-[11px] text-neutral-400'>
                      {lang === 'en' ? 'Machinery listings become visible to farmers' : 'शेतकऱ्यांना उपकरणे दिसण्यास सुरुवात होईल'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/owner/home')}
              className='w-full py-3.5 bg-neutral-900 text-white font-bold rounded-2xl text-sm shadow-md'
            >
              {lang === 'en' ? 'Return to Dashboard' : 'डॅशबोर्डवर परत जा'}
            </motion.button>
          </motion.div>
        )}

        {/* KYC Rejected State */}
        {!loading && currentStatus === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col gap-4'
          >
            <div className='bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm'>
              <div className='flex items-start gap-3 mb-3'>
                <div className='w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5'>
                  <MdWarning size={22} className='text-red-600' />
                </div>
                <div>
                  <h2 className='font-black text-red-900 text-base'>
                    {lang === 'en' ? 'KYC Verification Rejected' : 'KYC पडताळणी नाकारली'}
                  </h2>
                  <p className='text-red-700 text-xs mt-0.5'>
                    {lang === 'en'
                      ? 'Your previous submission could not be verified. Please review the reason below and submit updated details.'
                      : 'तुमचे कागदपत्रे पडताळले जाऊ शकले नाहीत. कृपया खालील कारण वाचून पुन्हा सबमिट करा.'}
                  </p>
                </div>
              </div>

              {kycData?.rejectionReason && (
                <div className='bg-white rounded-2xl p-3.5 border border-red-200 mt-2'>
                  <p className='text-xs font-bold text-neutral-500 mb-1'>
                    {lang === 'en' ? 'Reason for Rejection:' : 'नाकारण्याचे कारण:'}
                  </p>
                  <p className='text-sm text-red-700 font-semibold'>
                    {kycData.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsResubmitting(true)}
              className='w-full flex items-center justify-center gap-2 py-3.5 bg-[#2D6A4F] text-white font-bold rounded-2xl text-sm shadow-md'
            >
              <span>{lang === 'en' ? 'Update & Resubmit KYC' : 'KYC दुरुस्त करून पुन्हा सादर करा'}</span>
              <MdArrowForward size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* Form State (not_submitted or resubmitting) */}
        {!loading && currentStatus === 'not_submitted' && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col gap-4'
          >
            {/* Header info card */}
            <div className='bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />
              <div className='flex items-center gap-3 relative z-10'>
                <div className='w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0'>
                  <MdVerifiedUser size={26} className='text-[#95D5B2]' />
                </div>
                <div>
                  <h2 className='font-black text-base'>
                    {lang === 'en' ? 'Complete Owner KYC' : 'उपकरण मालक KYC पूर्ण करा'}
                  </h2>
                  <p className='text-white/70 text-xs mt-0.5'>
                    {lang === 'en'
                      ? 'Submit bank account and ID proofs to start accepting tractor & machinery bookings.'
                      : 'उपकरणे भाड्याने देण्यासाठी बँक खाते व ओळखपत्र सादर करा.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2'>
                <MdWarning size={18} className='shrink-0' />
                <span>{error}</span>
              </div>
            )}

            {/* Success banner */}
            {successMsg && (
              <div className='bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2'>
                <HiCheckCircle size={18} className='shrink-0' />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Section 1: Bank Details */}
            <div className='bg-white rounded-3xl p-5 shadow-sm border border-neutral-100'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-[#2D6A4F]'>
                  <MdAccountBalance size={18} />
                </div>
                <div>
                  <h3 className='font-black text-neutral-900 text-sm'>
                    {lang === 'en' ? 'Bank Account Details' : 'बँक खाते तपशील'}
                  </h3>
                  <p className='text-[11px] text-neutral-400'>
                    {lang === 'en' ? 'For direct booking payouts and earnings' : 'बुकिंगचे पैसे थेट खात्यात जमा होण्यासाठी'}
                  </p>
                </div>
              </div>

              <div className='space-y-3.5'>
                <div>
                  <label className='block text-xs font-bold text-neutral-700 mb-1'>
                    {lang === 'en' ? 'Account Holder Name' : 'खातेदाराचे नाव'}
                  </label>
                  <input
                    type='text'
                    value={form.accountName}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Ramesh Kadam' : 'उदा. रमेश कदम'}
                    className='w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]/30'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold text-neutral-700 mb-1'>
                    {lang === 'en' ? 'Bank Account Number' : 'बँक खाते क्रमांक'}
                  </label>
                  <input
                    type='password'
                    value={form.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder={lang === 'en' ? 'Enter bank account number' : 'बँक खाते क्रमांक टाका'}
                    className='w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]/30'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold text-neutral-700 mb-1'>
                    {lang === 'en' ? 'Confirm Account Number' : 'खाते क्रमांक पुन्हा टाका'}
                  </label>
                  <input
                    type='text'
                    value={form.confirmAccountNumber}
                    onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                    placeholder={lang === 'en' ? 'Re-enter bank account number' : 'खाते क्रमांक पुन्हा प्रविष्ट करा'}
                    className='w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]/30'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold text-neutral-700 mb-1'>
                    {lang === 'en' ? 'IFSC Code' : 'IFSC कोड'}
                  </label>
                  <input
                    type='text'
                    maxLength={11}
                    value={form.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    placeholder='SBIN0001234'
                    className='w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]/30'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Identity Documents */}
            <div className='bg-white rounded-3xl p-5 shadow-sm border border-neutral-100'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-[#2D6A4F]'>
                  <HiDocumentText size={18} />
                </div>
                <div>
                  <h3 className='font-black text-neutral-900 text-sm'>
                    {lang === 'en' ? 'Identity Documents' : 'ओळख कागदपत्रे'}
                  </h3>
                  <p className='text-[11px] text-neutral-400'>
                    {lang === 'en' ? 'Upload clear photo or PDF of Aadhaar and PAN' : 'आधार आणि पॅन कार्डचा स्पष्ट फोटो किंवा PDF अपलोड करा'}
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                {/* Aadhaar upload */}
                <div>
                  <label className='block text-xs font-bold text-neutral-700 mb-1.5'>
                    {lang === 'en' ? 'Aadhaar Card' : 'आधार कार्ड'} <span className='text-red-500'>*</span>
                  </label>

                  {previews.aadhaar ? (
                    <div className='flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-200'>
                      <div className='flex items-center gap-3 overflow-hidden'>
                        <div className='w-10 h-10 rounded-xl bg-white border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0'>
                          <img src={previews.aadhaar.url} alt="Aadhaar" className='w-full h-full object-cover' />
                        </div>
                        <div className='truncate'>
                          <p className='text-xs font-bold text-neutral-800 truncate'>{previews.aadhaar.name}</p>
                          <p className='text-[10px] text-neutral-400'>{previews.aadhaar.size} MB</p>
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeFile('aadhaarFile')}
                        className='p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors'
                      >
                        <HiTrash size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className='border-2 border-dashed border-neutral-200 hover:border-[#2D6A4F] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F7F5F0]/40'>
                      <HiUpload size={22} className='text-neutral-400 mb-1' />
                      <span className='text-xs font-bold text-neutral-700'>
                        {lang === 'en' ? 'Upload Aadhaar Card' : 'आधार कार्ड निवडा'}
                      </span>
                      <span className='text-[10px] text-neutral-400 mt-0.5'>JPG, PNG or PDF (max 10MB)</span>
                      <input
                        type='file'
                        accept='image/*,application/pdf'
                        onChange={(e) => handleFileChange('aadhaarFile', e.target.files[0])}
                        className='hidden'
                      />
                    </label>
                  )}
                </div>

                {/* PAN upload */}
                <div>
                  <label className='block text-xs font-bold text-neutral-700 mb-1.5'>
                    {lang === 'en' ? 'PAN Card' : 'पॅन कार्ड'} <span className='text-red-500'>*</span>
                  </label>

                  {previews.pan ? (
                    <div className='flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-200'>
                      <div className='flex items-center gap-3 overflow-hidden'>
                        <div className='w-10 h-10 rounded-xl bg-white border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0'>
                          <img src={previews.pan.url} alt="PAN" className='w-full h-full object-cover' />
                        </div>
                        <div className='truncate'>
                          <p className='text-xs font-bold text-neutral-800 truncate'>{previews.pan.name}</p>
                          <p className='text-[10px] text-neutral-400'>{previews.pan.size} MB</p>
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeFile('panFile')}
                        className='p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors'
                      >
                        <HiTrash size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className='border-2 border-dashed border-neutral-200 hover:border-[#2D6A4F] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F7F5F0]/40'>
                      <HiUpload size={22} className='text-neutral-400 mb-1' />
                      <span className='text-xs font-bold text-neutral-700'>
                        {lang === 'en' ? 'Upload PAN Card' : 'पॅन कार्ड निवडा'}
                      </span>
                      <span className='text-[10px] text-neutral-400 mt-0.5'>JPG, PNG or PDF (max 10MB)</span>
                      <input
                        type='file'
                        accept='image/*,application/pdf'
                        onChange={(e) => handleFileChange('panFile', e.target.files[0])}
                        className='hidden'
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className='flex items-center gap-2 px-3 py-2 bg-neutral-100/60 rounded-xl text-[11px] text-neutral-500'>
              <MdLockOutline size={16} className='text-[#2D6A4F] shrink-0' />
              <span>
                {lang === 'en'
                  ? 'Bank details are AES-256 encrypted. ID documents are kept private and secure.'
                  : 'तुमचा डेटा सुरक्षित व कूटबद्ध (encrypted) ठेवला जातो.'}
              </span>
            </div>

            {/* Submit Button */}
            <motion.button
              type='submit'
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              className='w-full flex items-center justify-center gap-2 py-4 bg-[#2D6A4F] text-white font-black rounded-2xl text-base shadow-lg disabled:opacity-60 transition-all'
            >
              {submitting ? (
                <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <>
                  <span>
                    {isResubmitting
                      ? (lang === 'en' ? 'Resubmit Verification' : 'पुन्हा पडताळणीसाठी सादर करा')
                      : (lang === 'en' ? 'Submit KYC for Verification' : 'KYC पडताळणीसाठी सादर करा')}
                  </span>
                  <MdArrowForward size={20} />
                </>
              )}
            </motion.button>

            {isResubmitting && (
              <button
                type='button'
                onClick={() => setIsResubmitting(false)}
                className='text-xs text-neutral-500 hover:text-neutral-800 font-bold py-2'
              >
                {lang === 'en' ? 'Cancel' : 'रद्द करा'}
              </button>
            )}

            <div className='h-4' />
          </motion.form>
        )}

      </div>
    </OwnerLayout>
  )
}
