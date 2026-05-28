import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdArrowForward, MdKeyboardArrowDown } from 'react-icons/md'
import useAuthStore from '../../store/authStore'
import logo from '../../assets/logo.png'

const talukas = [
  'Niphad', 'Sinnar', 'Dindori', 'Nashik', 'Igatpuri',
  'Trimbakeshwar', 'Baglan', 'Malegaon', 'Nandgaon',
  'Chandwad', 'Yeola', 'Kalwan', 'Surgana', 'Peint'
]

const landUnits = ['acres', 'bigha', 'hectare']

export default function CompleteProfile() {
  const navigate = useNavigate()

  const {
    completeProfile,
    isLoading,
    error,
    clearError,
    user
  } = useAuthStore()

  const [form, setForm] = useState({
    name: user?.name && user.name !== 'User' ? user.name : '',
    village: '',
    taluka: '',
    language: 'mr',
    landSize: '',
    landUnit: 'acres'
  })

  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
    clearError()
  }

  const validate = () => {
    const e = {}

    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.village.trim()) e.village = 'Village is required'
    if (!form.taluka) e.taluka = 'Taluka is required'

    if (user?.role === 'farmer' && !form.landSize) {
      e.landSize = 'Land size is required'
    }

    return e
  }

  const handleSubmit = async () => {
    const e = validate()

    if (Object.keys(e).length > 0) {
      return setErrors(e)
    }

    const data = {
      name: form.name,
      village: form.village,
      taluka: form.taluka,
      language: form.language,
      role: user?.role
    }

    if (user?.role === 'farmer') {
      data.landSize = Number(form.landSize)
      data.landUnit = form.landUnit
    }

    const result = await completeProfile(data)

    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center bg-[#F7F5F0] p-6'
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='w-full max-w-md'
      >
        {/* Header */}
        <div className='text-center mb-10'>
          <img
            src={logo}
            alt='KrishiGo'
            className='h-12 w-auto mx-auto mb-5'
          />

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className='text-[30px] leading-tight font-black text-neutral-900 mb-2'
          >
            Complete Your Profile
          </h1>

          <p className='text-sm text-neutral-500'>
            Just a few details to get you started
          </p>
        </div>

        {/* Card */}
        <div className='bg-white rounded-[28px] p-8 border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]'>
          <div className='space-y-5'>

            {/* Name */}
            <div>
              <label className='text-[13px] font-bold tracking-wide text-neutral-600 uppercase mb-2 block'>
                Full Name
              </label>

              <input
                type='text'
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder='Enter your full name'
                className={`w-full px-4 h-14 rounded-2xl border-2 bg-[#F7F5F0]
                text-neutral-900 transition-all focus:outline-none
                focus:ring-4 focus:ring-[#2D6A4F]/10
                ${
                  errors.name
                    ? 'border-red-400'
                    : 'border-neutral-200 focus:border-[#2D6A4F]'
                }`}
              />

              {errors.name && (
                <p className='text-red-500 text-xs mt-1.5'>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Village */}
            <div>
              <label className='text-[13px] font-bold tracking-wide text-neutral-600 uppercase mb-2 block'>
                Village
              </label>

              <input
                type='text'
                value={form.village}
                onChange={e => update('village', e.target.value)}
                placeholder='Enter your village name'
                className={`w-full px-4 h-14 rounded-2xl border-2 bg-[#F7F5F0]
                text-neutral-900 transition-all focus:outline-none
                focus:ring-4 focus:ring-[#2D6A4F]/10
                ${
                  errors.village
                    ? 'border-red-400'
                    : 'border-neutral-200 focus:border-[#2D6A4F]'
                }`}
              />

              {errors.village && (
                <p className='text-red-500 text-xs mt-1.5'>
                  {errors.village}
                </p>
              )}
            </div>

            {/* Taluka */}
            <div>
              <label className='text-[13px] font-bold tracking-wide text-neutral-600 uppercase mb-2 block'>
                Taluka
              </label>

              <div className='relative'>
                <select
                  value={form.taluka}
                  onChange={e => update('taluka', e.target.value)}
                  className={`w-full px-4 h-14 rounded-2xl border-2 bg-[#F7F5F0]
                  text-neutral-900 appearance-none transition-all focus:outline-none
                  focus:ring-4 focus:ring-[#2D6A4F]/10
                  ${
                    errors.taluka
                      ? 'border-red-400'
                      : 'border-neutral-200 focus:border-[#2D6A4F]'
                  }`}
                >
                  <option value=''>Select taluka</option>

                  {talukas.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <MdKeyboardArrowDown
                  size={22}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none'
                />
              </div>

              {errors.taluka && (
                <p className='text-red-500 text-xs mt-1.5'>
                  {errors.taluka}
                </p>
              )}
            </div>

            {/* Land Size */}
            {user?.role === 'farmer' && (
              <div>
                <label className='text-[13px] font-bold tracking-wide text-neutral-600 uppercase mb-2 block'>
                  Land Size
                </label>

                <div className='flex gap-2'>
                  <input
                    type='number'
                    min='0'
                    step='0.1'
                    value={form.landSize}
                    onChange={e => update('landSize', e.target.value)}
                    placeholder='e.g. 3.5'
                    className={`flex-1 px-4 h-14 rounded-2xl border-2 bg-[#F7F5F0]
                    text-neutral-900 transition-all focus:outline-none
                    focus:ring-4 focus:ring-[#2D6A4F]/10
                    ${
                      errors.landSize
                        ? 'border-red-400'
                        : 'border-neutral-200 focus:border-[#2D6A4F]'
                    }`}
                  />

                  <div className='relative w-[120px]'>
                    <select
                      value={form.landUnit}
                      onChange={e => update('landUnit', e.target.value)}
                      className='w-full px-4 h-14 rounded-2xl border-2 border-neutral-200
                      bg-[#F7F5F0] text-neutral-900 appearance-none transition-all
                      focus:outline-none focus:border-[#2D6A4F]
                      focus:ring-4 focus:ring-[#2D6A4F]/10'
                    >
                      {landUnits.map(u => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>

                    <MdKeyboardArrowDown
                      size={22}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none'
                    />
                  </div>
                </div>

                {errors.landSize && (
                  <p className='text-red-500 text-xs mt-1.5'>
                    {errors.landSize}
                  </p>
                )}
              </div>
            )}

            {/* Language */}
            <div>
              <label className='text-[13px] font-bold tracking-wide text-neutral-600 uppercase mb-3 block'>
                Preferred Language
              </label>

              <div className='flex gap-3'>
                {[
                  { value: 'en', label: 'English' },
                  { value: 'mr', label: 'मराठी' }
                ].map(lang => (
                  <button
                    key={lang.value}
                    type='button'
                    onClick={() => update('language', lang.value)}
                    className={`flex-1 h-12 rounded-2xl border-2 text-sm font-semibold transition-all
                    ${
                      form.language === lang.value
                        ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-md'
                        : 'border-neutral-200 text-neutral-600 bg-[#F7F5F0] hover:border-neutral-300'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className='text-red-500 text-sm text-center'>
                {error}
              </p>
            )}

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className='w-full h-14 rounded-2xl bg-[#2D6A4F]
              hover:bg-[#40916C] hover:-translate-y-[1px]
              text-white font-bold flex items-center justify-center gap-2
              transition-all shadow-lg shadow-[#2D6A4F]/20
              disabled:opacity-50'
            >
              {isLoading ? (
                <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <>
                  Start Using KrishiGo
                  <MdArrowForward size={20} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}