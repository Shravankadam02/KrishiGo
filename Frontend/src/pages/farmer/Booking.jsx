import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { MdCalendarToday, MdLocationOn, MdPayment } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import FarmerLayout from '../../components/layout/FarmerLayout'
import api from '../../services/api'
import { formatPrice, toAcres } from '../../utils/helpers'
import { MdMoney, MdPhoneAndroid } from 'react-icons/md'
const landUnits = ['acres', 'bigha', 'hectare']

export default function FarmerBooking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lang = localStorage.getItem('language') || 'en'

  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    serviceDate: '',
    landSize: '',
    landUnit: 'acres',
    paymentMethod: 'cash'
  })

  const [preview, setPreview] = useState({
    acres: 0,
    totalPrice: 0,
    commission: 0,
    ownerEarnings: 0
  })

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/api/equipment/${id}`)
        setEquipment(data.equipment)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  // Calculate price preview
  useEffect(() => {
    if (!equipment || !form.landSize) return
    const acres = toAcres(Number(form.landSize), form.landUnit)
    const totalPrice = Math.round(acres * equipment.pricePerAcre)
    const rate = totalPrice >= 5000 ? 0.15 : 0.10
    const commission = Math.round(totalPrice * rate)
    const ownerEarnings = totalPrice - commission
    setPreview({ acres, totalPrice, commission, ownerEarnings })
  }, [form.landSize, form.landUnit, equipment])

  const handleSubmit = async () => {
    setError('')
    if (!form.serviceDate) return setError('Please select a service date')
    if (!form.landSize || Number(form.landSize) <= 0) return setError('Please enter land size')

    setSubmitting(true)
    try {
      const { data } = await api.post('/api/bookings', {
        equipmentId: id,
        serviceDate: form.serviceDate,
        landSize: form.landSize,
        landUnit: form.landUnit,
        paymentMethod: form.paymentMethod
      })

      if (data.success) {
        setSuccess(true)
        setTimeout(() => navigate('/farmer/bookings'), 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <FarmerLayout>
      <div className='flex flex-col gap-4 p-4 pt-12'>
        <div className='h-24 bg-neutral-200 rounded-3xl animate-pulse' />
        <div className='h-48 bg-neutral-200 rounded-3xl animate-pulse' />
      </div>
    </FarmerLayout>
  )

  if (success) return (
    <FarmerLayout>
      <div className='flex flex-col items-center justify-center min-h-screen gap-4 px-4'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className='w-20 h-20 rounded-full bg-[#2D6A4F] flex items-center justify-center'
        >
          <span className='text-4xl'>✓</span>
        </motion.div>
        <h2 className='text-xl font-black text-neutral-900 text-center'>
          {lang === 'en' ? 'Booking Submitted!' : 'बुकिंग सादर केली!'}
        </h2>
        <p className='text-neutral-400 text-sm text-center'>
          {lang === 'en'
            ? 'Owner will confirm within 6 hours. Check your bookings.'
            : 'मालक ६ तासांत पुष्टी करेल. तुमच्या बुकिंग तपासा.'}
        </p>
      </div>
    </FarmerLayout>
  )

  return (
    <FarmerLayout>
      {/* Header */}
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate(-1)}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <div>
            <h1 className='font-black text-neutral-900 text-base'>
              {lang === 'en' ? 'Book Equipment' : 'उपकरण बुक करा'}
            </h1>
            <p className='text-xs text-neutral-400'>
              {lang === 'en' ? 'Fill details to confirm booking' : 'बुकिंग निश्चित करण्यासाठी तपशील भरा'}
            </p>
          </div>
        </div>
      </div>

      <div className='px-4 py-4 flex flex-col gap-4'>

        {/* Equipment summary */}
        {equipment && (
          <div className='bg-white rounded-3xl p-4 shadow-sm flex gap-3 items-center'>
            <div className='w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0'>
              {equipment.photos?.[0] ? (
                <img src={equipment.photos[0]} alt='' className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full bg-[#2D6A4F]/10 flex items-center justify-center'>
                  <FaTractor size={24} className='text-[#2D6A4F]' />
                </div>
              )}
            </div>
            <div className='flex-1'>
              <p className='font-black text-neutral-900 capitalize'>
                {equipment.type.replace(/_/g, ' ')}
              </p>
              <p className='text-xs text-neutral-400'>{equipment.owner?.name}</p>
              <div className='flex items-center gap-1 mt-1'>
                <MdLocationOn size={12} className='text-neutral-400' />
                <span className='text-xs text-neutral-400'>{equipment.village}</span>
              </div>
            </div>
            <div className='text-right'>
              <p className='font-black text-[#2D6A4F]'>{formatPrice(equipment.pricePerAcre)}</p>
              <p className='text-[10px] text-neutral-400'>per acre</p>
            </div>
          </div>
        )}

        {/* Booking form */}
        <div className='bg-white rounded-3xl p-4 shadow-sm flex flex-col gap-4'>
          <h3 className='font-black text-neutral-900 text-sm'>
            {lang === 'en' ? 'Booking Details' : 'बुकिंग तपशील'}
          </h3>

          {/* Service date */}
          <div>
            <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
              {lang === 'en' ? 'Service Date' : 'सेवा तारीख'}
            </label>
            <div className='relative'>
              <MdCalendarToday
                size={16}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400'
              />
              <input
                type='date'
                value={form.serviceDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, serviceDate: e.target.value }))}
                className='w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
              />
            </div>
          </div>

          {/* Land size */}
          <div>
            <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
              {lang === 'en' ? 'Land Size' : 'जमीन आकार'}
            </label>
            <div className='flex gap-2'>
              <input
                type='number'
                min='0.1'
                step='0.1'
                value={form.landSize}
                onChange={e => setForm(f => ({ ...f, landSize: e.target.value }))}
                placeholder='e.g. 2.5'
                className='flex-1 px-4 py-3 rounded-2xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
              />
              <select
                value={form.landUnit}
                onChange={e => setForm(f => ({ ...f, landUnit: e.target.value }))}
                className='px-4 py-3 rounded-2xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
              >
                {landUnits.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
              {lang === 'en' ? 'Payment Method' : 'देयक पद्धत'}
            </label>
            <div className='flex gap-2'>
              <button
                onClick={() => setForm(f => ({ ...f, paymentMethod: 'cash' }))}
                className={`flex-1 py-3 rounded-2xl border-2 text-sm font-bold transition-all
                  ${form.paymentMethod === 'cash'
                    ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white'
                    : 'border-neutral-200 text-neutral-500 bg-[#F7F5F0]'}`}
              >
                💵 {lang === 'en' ? 'Cash' : 'रोख'}
              </button>
              <button
                onClick={() => setForm(f => ({ ...f, paymentMethod: 'online' }))}
                className={`flex-1 py-3 rounded-2xl border-2 text-sm font-bold transition-all
                  ${form.paymentMethod === 'online'
                    ? 'border-[#E76F51] bg-[#E76F51] text-white'
                    : 'border-neutral-200 text-neutral-500 bg-[#F7F5F0]'}`}
              >
                📱 {lang === 'en' ? 'Online' : 'ऑनलाइन'}
              </button>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        {preview.totalPrice > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-3xl p-4 shadow-sm'
          >
            <h3 className='font-black text-neutral-900 text-sm mb-3'>
              {lang === 'en' ? 'Price Breakdown' : 'किंमत तपशील'}
            </h3>
            <div className='flex flex-col gap-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-neutral-500'>
                  {preview.acres.toFixed(2)} acres × {formatPrice(equipment.pricePerAcre)}
                </span>
                <span className='font-bold'>{formatPrice(preview.totalPrice)}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-neutral-400'>
                  {lang === 'en' ? 'Platform fee' : 'प्लॅटफॉर्म शुल्क'} ({preview.totalPrice >= 5000 ? '15%' : '10%'})
                </span>
                <span className='text-neutral-400'>- {formatPrice(preview.commission)}</span>
              </div>
              <div className='border-t border-neutral-100 pt-2 flex justify-between'>
                <span className='font-black text-neutral-900'>
                  {lang === 'en' ? 'You Pay' : 'तुम्ही द्याल'}
                </span>
                <span className='font-black text-[#2D6A4F] text-lg'>
                  {formatPrice(preview.totalPrice)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-2xl px-4 py-3'>
            <p className='text-red-600 text-sm font-semibold'>{error}</p>
          </div>
        )}

        {/* Submit button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitting}
          className='w-full flex items-center justify-center gap-2 py-4 bg-[#2D6A4F] text-white font-black rounded-2xl text-base shadow-lg disabled:opacity-60'
        >
          {submitting ? (
            <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
          ) : (
            <>
              <MdPayment size={20} />
              {lang === 'en' ? 'Confirm Booking' : 'बुकिंग निश्चित करा'}
            </>
          )}
        </motion.button>

        <p className='text-center text-xs text-neutral-400'>
          {lang === 'en'
            ? 'Owner has 6 hours to confirm your booking'
            : 'मालकाकडे तुमची बुकिंग निश्चित करण्यासाठी ६ तास आहेत'}
        </p>

        <div className='h-4' />
      </div>
    </FarmerLayout>
  )
}