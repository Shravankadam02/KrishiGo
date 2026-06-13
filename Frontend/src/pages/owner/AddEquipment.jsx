import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft, HiPlus } from 'react-icons/hi'
import { MdLocationOn, MdCloudUpload, MdArrowForward } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import OwnerLayout from '../../components/layout/OwnerLayout'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

const equipmentTypes = [
  { key: 'tractor_plowing',   label: 'Tractor (Plowing)',   mr: 'ट्रॅक्टर (नांगरणी)' },
  { key: 'tractor_rotavator', label: 'Tractor (Rotavator)', mr: 'ट्रॅक्टर (रोटाव्हेटर)' },
  { key: 'harvester_wheat',   label: 'Wheat Harvester',     mr: 'गहू कापणी यंत्र' },
  { key: 'harvester_paddy',   label: 'Paddy Harvester',     mr: 'भात कापणी यंत्र' },
  { key: 'seed_drill',        label: 'Seed Drill',          mr: 'बियाणे ड्रिल' },
  { key: 'sprayer',           label: 'Sprayer',             mr: 'फवारणी यंत्र' },
  { key: 'baler',             label: 'Baler',               mr: 'बेलर' },
  { key: 'other',             label: 'Other',               mr: 'इतर' },
]

// Dynamic spec fields per equipment type
const specFields = {
  tractor_plowing:   ['brand', 'model', 'year', 'hp'],
  tractor_rotavator: ['brand', 'model', 'year', 'hp', 'workingWidth'],
  harvester_wheat:   ['brand', 'model', 'year', 'cuttingWidth'],
  harvester_paddy:   ['brand', 'model', 'year', 'cuttingWidth'],
  seed_drill:        ['brand', 'rows', 'workingWidth'],
  sprayer:           ['tankCapacity', 'boomWidth', 'type'],
  baler:             ['brand', 'baleType'],
  other:             ['description'],
}

const specLabels = {
  brand:        { en: 'Brand',          mr: 'ब्रँड' },
  model:        { en: 'Model',          mr: 'मॉडेल' },
  year:         { en: 'Year',           mr: 'वर्ष' },
  hp:           { en: 'Horse Power',    mr: 'हॉर्स पॉवर' },
  workingWidth: { en: 'Working Width (ft)', mr: 'काम रुंदी (फूट)' },
  cuttingWidth: { en: 'Cutting Width (ft)', mr: 'कापणी रुंदी (फूट)' },
  rows:         { en: 'Number of Rows', mr: 'ओळींची संख्या' },
  tankCapacity: { en: 'Tank Capacity (L)', mr: 'टाकी क्षमता (L)' },
  boomWidth:    { en: 'Boom Width (ft)', mr: 'बूम रुंदी (फूट)' },
  type:         { en: 'Type',           mr: 'प्रकार' },
  baleType:     { en: 'Bale Type',      mr: 'बेल प्रकार' },
  description:  { en: 'Description',   mr: 'वर्णन' },
}

const talukas = [
  'Niphad', 'Sinnar', 'Dindori', 'Nashik', 'Igatpuri',
  'Trimbakeshwar', 'Baglan', 'Malegaon', 'Nandgaon',
  'Chandwad', 'Yeola', 'Kalwan', 'Surgana', 'Peint'
]

const steps = ['Type', 'Specs', 'Pricing', 'Photos', 'Location']

export default function AddEquipment() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const lang = localStorage.getItem('language') || 'en'

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    type: '',
    specs: {},
    pricePerAcre: '',
    pricePerHour: '',
    serviceRadius: '10',
    village: user?.village || '',
    taluka: user?.taluka || '',
    lat: '',
    lng: '',
    photos: [],
    rcFile: null,
    insuranceFile: null,
  })

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  const updateSpec = (key, value) => {
    setForm(f => ({ ...f, specs: { ...f.specs, [key]: value } }))
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    setForm(f => ({ ...f, photos: [...f.photos, ...files].slice(0, 10) }))
  }

  const removePhoto = (index) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }))
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          update('lat', pos.coords.latitude.toString())
          update('lng', pos.coords.longitude.toString())
        },
        () => {
          // Niphad fallback
          update('lat', '20.0650')
          update('lng', '74.1077')
        }
      )
    }
  }

  const validateStep = () => {
    setError('')
    if (step === 0 && !form.type) return setError('Please select equipment type') || false
    if (step === 1) {
      const fields = specFields[form.type] || []
      for (const field of fields) {
        if (!form.specs[field]) return setError(`Please fill ${specLabels[field]?.en}`) || false
      }
    }
    if (step === 2 && !form.pricePerAcre) return setError('Please enter price per acre') || false
    if (step === 3 && form.photos.length < 3) return setError('Minimum 3 photos required') || false
    if (step === 4) {
      if (!form.village) return setError('Please enter village') || false
      if (!form.taluka) return setError('Please select taluka') || false
      if (!form.lat || !form.lng) return setError('Please get your location') || false
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    if (step < steps.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('type', form.type)
      formData.append('specs', JSON.stringify(form.specs))
      formData.append('pricePerAcre', form.pricePerAcre)
      if (form.pricePerHour) formData.append('pricePerHour', form.pricePerHour)
      formData.append('serviceRadius', form.serviceRadius)
      formData.append('village', form.village)
      formData.append('taluka', form.taluka)
      formData.append('lat', form.lat)
      formData.append('lng', form.lng)

      form.photos.forEach(photo => formData.append('photos', photo))
      if (form.rcFile) formData.append('rc', form.rcFile)
      if (form.insuranceFile) formData.append('insurance', form.insuranceFile)

      await api.post('/api/equipment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate('/owner/listings')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit listing')
    } finally {
      setSubmitting(false)
    }
  }

  const currentFields = specFields[form.type] || []

  return (
    <OwnerLayout>
      {/* Header */}
      <div className='bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3 mb-4'>
          <button
            onClick={() => step === 0 ? navigate('/owner/home') : setStep(s => s - 1)}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <div className='flex-1'>
            <h1 className='font-black text-neutral-900 text-base'>
              {lang === 'en' ? 'Add Equipment' : 'उपकरण जोडा'}
            </h1>
            <p className='text-xs text-neutral-400'>
              {lang === 'en' ? `Step ${step + 1} of ${steps.length}` : `पायरी ${step + 1} / ${steps.length}`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className='flex gap-1.5'>
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#2D6A4F]' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className='px-4 py-5 flex flex-col gap-4'>
        <AnimatePresence mode='wait'>

          {/* Step 0 — Type */}
          {step === 0 && (
            <motion.div
              key='type'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className='font-black text-neutral-900 mb-4'>
                {lang === 'en' ? 'What type of equipment?' : 'कोणत्या प्रकारचे उपकरण?'}
              </h2>
              <div className='grid grid-cols-2 gap-3'>
                {equipmentTypes.map(type => (
                  <motion.div
                    key={type.key}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => update('type', type.key)}
                    className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                      form.type === type.key
                        ? 'border-[#2D6A4F] bg-[#2D6A4F]/5'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <FaTractor
                      size={24}
                      className={form.type === type.key ? 'text-[#2D6A4F] mb-2' : 'text-neutral-300 mb-2'}
                    />
                    <p className={`font-bold text-sm ${
                      form.type === type.key ? 'text-[#2D6A4F]' : 'text-neutral-700'
                    }`}>
                      {lang === 'en' ? type.label : type.mr}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1 — Specs */}
          {step === 1 && (
            <motion.div
              key='specs'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex flex-col gap-4'
            >
              <h2 className='font-black text-neutral-900'>
                {lang === 'en' ? 'Equipment Specifications' : 'उपकरण तपशील'}
              </h2>
              {currentFields.map(field => (
                <div key={field}>
                  <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                    {lang === 'en' ? specLabels[field]?.en : specLabels[field]?.mr}
                  </label>
                  <input
                    type={['year', 'hp', 'rows', 'tankCapacity', 'boomWidth', 'workingWidth', 'cuttingWidth'].includes(field) ? 'number' : 'text'}
                    value={form.specs[field] || ''}
                    onChange={e => updateSpec(field, e.target.value)}
                    placeholder={specLabels[field]?.en}
                    className='w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* Step 2 — Pricing */}
          {step === 2 && (
            <motion.div
              key='pricing'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex flex-col gap-4'
            >
              <h2 className='font-black text-neutral-900'>
                {lang === 'en' ? 'Set Your Price' : 'किंमत सेट करा'}
              </h2>

              <div className='bg-[#2D6A4F]/5 border border-[#2D6A4F]/20 rounded-2xl p-3'>
                <p className='text-xs text-[#2D6A4F] font-semibold'>
                  {lang === 'en'
                    ? 'Typical price range in Nashik: ₹600 - ₹1200 per acre'
                    : 'नाशिकमध्ये सामान्य किंमत: ₹600 - ₹1200 प्रति एकर'}
                </p>
              </div>

              <div>
                <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                  {lang === 'en' ? 'Price per Acre (₹) *' : 'प्रति एकर किंमत (₹) *'}
                </label>
                <input
                  type='number'
                  value={form.pricePerAcre}
                  onChange={e => update('pricePerAcre', e.target.value)}
                  placeholder='e.g. 800'
                  className='w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
                />
              </div>

              <div>
                <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                  {lang === 'en' ? 'Price per Hour (₹) — Optional' : 'प्रति तास किंमत (₹) — पर्यायी'}
                </label>
                <input
                  type='number'
                  value={form.pricePerHour}
                  onChange={e => update('pricePerHour', e.target.value)}
                  placeholder='e.g. 500'
                  className='w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
                />
              </div>

              <div>
                <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                  {lang === 'en' ? 'Service Radius (km)' : 'सेवा त्रिज्या (किमी)'}
                </label>
                <div className='flex gap-2'>
                  {['5', '10', '15', '20'].map(r => (
                    <button
                      key={r}
                      onClick={() => update('serviceRadius', r)}
                      className={`flex-1 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                        form.serviceRadius === r
                          ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white'
                          : 'border-neutral-200 text-neutral-500 bg-[#F7F5F0]'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Commission info */}
              <div className='bg-neutral-50 rounded-2xl p-3'>
                <p className='text-xs font-semibold text-neutral-500 mb-1'>
                  {lang === 'en' ? 'Platform Commission' : 'प्लॅटफॉर्म कमिशन'}
                </p>
                <p className='text-xs text-neutral-400'>
                  {lang === 'en'
                    ? '10% for bookings under ₹5000, 15% above. Deducted at weekly payout.'
                    : '₹5000 खालील बुकिंगसाठी 10%, वरील 15%. साप्ताहिक पेआउटमधून वजा.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Photos */}
          {step === 3 && (
            <motion.div
              key='photos'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex flex-col gap-4'
            >
              <div>
                <h2 className='font-black text-neutral-900'>
                  {lang === 'en' ? 'Upload Photos' : 'फोटो अपलोड करा'}
                </h2>
                <p className='text-xs text-neutral-400 mt-1'>
                  {lang === 'en' ? 'Minimum 3 photos required' : 'किमान 3 फोटो आवश्यक'}
                </p>
              </div>

              {/* Photo grid */}
              <div className='grid grid-cols-3 gap-2'>
                {form.photos.map((photo, i) => (
                  <div key={i} className='relative aspect-square rounded-2xl overflow-hidden'>
                    <img
                      src={URL.createObjectURL(photo)}
                      alt=''
                      className='w-full h-full object-cover'
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      className='absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center'
                    >
                      <span className='text-white text-xs font-black'>×</span>
                    </button>
                  </div>
                ))}
                {form.photos.length < 10 && (
                  <label className='aspect-square rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#2D6A4F] transition-colors'>
                    <HiPlus size={24} className='text-neutral-400' />
                    <span className='text-[10px] text-neutral-400 mt-1'>Add</span>
                    <input
                      type='file'
                      accept='image/*'
                      multiple
                      onChange={handlePhotoUpload}
                      className='hidden'
                    />
                  </label>
                )}
              </div>

              <p className='text-xs text-neutral-400 text-center'>
                {form.photos.length}/10 {lang === 'en' ? 'photos added' : 'फोटो जोडले'}
              </p>

              {/* Documents */}
              <div className='flex flex-col gap-3'>
                <div>
                  <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                    {lang === 'en' ? 'RC Document (optional)' : 'RC दस्तऐवज (पर्यायी)'}
                  </label>
                  <label className='flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-neutral-200 cursor-pointer hover:border-[#2D6A4F] transition-colors'>
                    <MdCloudUpload size={20} className='text-neutral-400' />
                    <span className='text-sm text-neutral-400'>
                      {form.rcFile ? form.rcFile.name : (lang === 'en' ? 'Upload RC copy' : 'RC कॉपी अपलोड करा')}
                    </span>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={e => update('rcFile', e.target.files[0])}
                      className='hidden'
                    />
                  </label>
                </div>

                <div>
                  <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                    {lang === 'en' ? 'Insurance Document (optional)' : 'विमा दस्तऐवज (पर्यायी)'}
                  </label>
                  <label className='flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-neutral-200 cursor-pointer hover:border-[#2D6A4F] transition-colors'>
                    <MdCloudUpload size={20} className='text-neutral-400' />
                    <span className='text-sm text-neutral-400'>
                      {form.insuranceFile ? form.insuranceFile.name : (lang === 'en' ? 'Upload insurance' : 'विमा अपलोड करा')}
                    </span>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={e => update('insuranceFile', e.target.files[0])}
                      className='hidden'
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Location */}
          {step === 4 && (
            <motion.div
              key='location'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='flex flex-col gap-4'
            >
              <h2 className='font-black text-neutral-900'>
                {lang === 'en' ? 'Equipment Location' : 'उपकरण स्थान'}
              </h2>

              <div>
                <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                  {lang === 'en' ? 'Village' : 'गाव'}
                </label>
                <input
                  type='text'
                  value={form.village}
                  onChange={e => update('village', e.target.value)}
                  placeholder='Enter village name'
                  className='w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
                />
              </div>

              <div>
                <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                  {lang === 'en' ? 'Taluka' : 'तालुका'}
                </label>
                <select
                  value={form.taluka}
                  onChange={e => update('taluka', e.target.value)}
                  className='w-full px-4 py-3 rounded-2xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0] appearance-none'
                >
                  <option value=''>Select taluka</option>
                  {talukas.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* GPS location */}
              <div>
                <label className='text-xs font-semibold text-neutral-500 mb-2 block'>
                  {lang === 'en' ? 'GPS Location' : 'GPS स्थान'}
                </label>
                {form.lat && form.lng ? (
                  <div className='flex items-center gap-3 p-3 bg-[#2D6A4F]/5 border border-[#2D6A4F]/20 rounded-2xl'>
                    <MdLocationOn size={20} className='text-[#2D6A4F]' />
                    <div className='flex-1'>
                      <p className='text-xs font-bold text-[#2D6A4F]'>
                        {lang === 'en' ? 'Location captured' : 'स्थान मिळाले'}
                      </p>
                      <p className='text-[10px] text-neutral-400'>
                        {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
                      </p>
                    </div>
                    <button
                      onClick={getLocation}
                      className='text-xs text-[#2D6A4F] font-bold'
                    >
                      {lang === 'en' ? 'Refresh' : 'पुन्हा मिळवा'}
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={getLocation}
                    className='w-full flex items-center justify-center gap-2 py-3 bg-[#F7F5F0] border-2 border-dashed border-neutral-300 rounded-2xl text-sm font-bold text-neutral-500 hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-all'
                  >
                    <MdLocationOn size={18} />
                    {lang === 'en' ? 'Get My Location' : 'माझे स्थान मिळवा'}
                  </motion.button>
                )}
              </div>

              {/* Summary */}
              <div className='bg-white rounded-3xl p-4 shadow-sm'>
                <p className='font-black text-neutral-900 text-sm mb-3'>
                  {lang === 'en' ? 'Listing Summary' : 'यादी सारांश'}
                </p>
                <div className='flex flex-col gap-2 text-xs'>
                  {[
                    {
                      label: lang === 'en' ? 'Type' : 'प्रकार',
                      value: equipmentTypes.find(t => t.key === form.type)?.[lang === 'en' ? 'label' : 'mr']
                    },
                    {
                      label: lang === 'en' ? 'Price' : 'किंमत',
                      value: `₹${form.pricePerAcre}/acre`
                    },
                    {
                      label: lang === 'en' ? 'Radius' : 'त्रिज्या',
                      value: `${form.serviceRadius} km`
                    },
                    {
                      label: lang === 'en' ? 'Photos' : 'फोटो',
                      value: `${form.photos.length} uploaded`
                    },
                  ].map((item, i) => (
                    <div key={i} className='flex justify-between py-1.5 border-b border-neutral-50 last:border-0'>
                      <span className='text-neutral-400'>{item.label}</span>
                      <span className='font-bold text-neutral-700'>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-2xl px-4 py-3'>
            <p className='text-red-600 text-sm font-semibold'>{error}</p>
          </div>
        )}

        {/* Next / Submit button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={submitting}
          className='w-full flex items-center justify-center gap-2 py-4 bg-[#2D6A4F] text-white font-black rounded-2xl text-base shadow-lg disabled:opacity-60'
        >
          {submitting ? (
            <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
          ) : (
            <>
              {step === steps.length - 1
                ? (lang === 'en' ? 'Submit for Verification' : 'सत्यापनासाठी सादर करा')
                : (lang === 'en' ? 'Continue' : 'पुढे')}
              <MdArrowForward size={20} />
            </>
          )}
        </motion.button>

        <div className='h-4' />
      </div>
    </OwnerLayout>
  )
}