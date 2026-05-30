import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSearch, HiArrowLeft, HiFilter } from 'react-icons/hi'
import { MdLocationOn, MdArrowForward, MdClose } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import { GiSeedling, GiSpray, GiGears, GiScythe } from 'react-icons/gi'
import { RiPlantLine } from 'react-icons/ri'
import FarmerLayout from '../../components/layout/FarmerLayout'
import api from '../../services/api'
import { formatPrice } from '../../utils/helpers'

const categories = [
  { key: 'all',               label: 'All',         mr: 'सर्व' },
  { key: 'tractor_plowing',   label: 'Tractor',     mr: 'ट्रॅक्टर',     Icon: FaTractor },
  { key: 'tractor_rotavator', label: 'Rotavator',   mr: 'रोटाव्हेटर',   Icon: GiGears },
  { key: 'harvester_wheat',   label: 'Harvester',   mr: 'कापणी यंत्र',  Icon: GiScythe },
  { key: 'sprayer',           label: 'Sprayer',     mr: 'फवारणी',       Icon: GiSpray },
  { key: 'seed_drill',        label: 'Seed Drill',  mr: 'बियाणे ड्रिल', Icon: GiSeedling },
  { key: 'other',             label: 'Other',       mr: 'इतर',          Icon: RiPlantLine },
]

const sortOptions = [
  { key: 'distance', label: 'Nearest First' },
  { key: 'price_low', label: 'Price: Low to High' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
]

export default function FarmerExplore() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lang = localStorage.getItem('language') || 'en'

  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all')
  const [sortBy, setSortBy] = useState('distance')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [date, setDate] = useState('')

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({  lat: 20.0650, lng: 74.1077 })
      )
    }
  }, [])

  // Fetch equipment
  useEffect(() => {
    if (!location) return
    fetchEquipment()
  }, [location, selectedType, date])

  const fetchEquipment = async () => {
    setLoading(true)
    try {
      const params = {
        lat: location.lat,
        lng: location.lng,
      }
      if (selectedType !== 'all') params.type = selectedType
      if (date) params.date = date
      if (priceRange.min) params.minPrice = priceRange.min
      if (priceRange.max) params.maxPrice = priceRange.max

      const { data } = await api.get('/api/equipment', { params })
      setEquipment(data.equipment || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Sort equipment
  const sorted = [...equipment]
    .filter(eq =>
      search === '' ||
      eq.type.toLowerCase().includes(search.toLowerCase()) ||
      eq.village?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm
      if (sortBy === 'price_low') return a.pricePerAcre - b.pricePerAcre
      if (sortBy === 'price_high') return b.pricePerAcre - a.pricePerAcre
      if (sortBy === 'rating') return b.rating - a.rating
      return 0
    })

  return (
    <FarmerLayout>
      {/* Header */}
      <div className='bg-white px-4 pt-12 pb-4 sticky top-0 z-20 shadow-sm'>
        {/* Top row */}
        <div className='flex items-center gap-3 mb-3'>
          <button
            onClick={() => navigate('/farmer/home')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center flex-shrink-0'
          >
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>

          {/* Search input */}
          <div className='flex-1 flex items-center gap-2 bg-[#F7F5F0] rounded-2xl px-3 py-2.5'>
            <HiSearch size={16} className='text-neutral-400 flex-shrink-0' />
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'en' ? 'Search equipment...' : 'उपकरण शोधा...'}
              className='flex-1 bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none'
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <MdClose size={16} className='text-neutral-400' />
              </button>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative
              ${showFilters ? 'bg-[#2D6A4F] text-white' : 'bg-[#F7F5F0] text-neutral-600'}`}
          >
            <HiFilter size={16} />
            {(priceRange.min || priceRange.max || date) && (
              <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E76F51] rounded-full' />
            )}
          </button>
        </div>

        {/* Category pills */}
        <div className='flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide'>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedType(cat.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                ${selectedType === cat.key
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'bg-[#F7F5F0] text-neutral-500 hover:bg-neutral-200'}`}
            >
              {lang === 'en' ? cat.label : cat.mr}
            </button>
          ))}
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='overflow-hidden'
            >
              <div className='pt-3 flex flex-col gap-3'>
                {/* Date filter */}
                <div>
                  <label className='text-xs font-semibold text-neutral-500 mb-1.5 block'>
                    {lang === 'en' ? 'Service Date' : 'सेवा तारीख'}
                  </label>
                  <input
                    type='date'
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)}
                    className='w-full px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
                  />
                </div>

                {/* Price range */}
                <div>
                  <label className='text-xs font-semibold text-neutral-500 mb-1.5 block'>
                    {lang === 'en' ? 'Price Range (₹/acre)' : 'किंमत (₹/एकर)'}
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='number'
                      value={priceRange.min}
                      onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                      placeholder='Min'
                      className='flex-1 px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
                    />
                    <input
                      type='number'
                      value={priceRange.max}
                      onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                      placeholder='Max'
                      className='flex-1 px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-[#2D6A4F] bg-[#F7F5F0]'
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className='text-xs font-semibold text-neutral-500 mb-1.5 block'>
                    {lang === 'en' ? 'Sort By' : 'क्रमवारी'}
                  </label>
                  <div className='flex gap-2 flex-wrap'>
                    {sortOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                          ${sortBy === opt.key
                            ? 'bg-[#2D6A4F] text-white'
                            : 'bg-[#F7F5F0] text-neutral-500'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply / Clear */}
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setPriceRange({ min: '', max: '' })
                      setDate('')
                      setSortBy('distance')
                    }}
                    className='flex-1 py-2.5 rounded-xl border-2 border-neutral-200 text-xs font-bold text-neutral-500'
                  >
                    {lang === 'en' ? 'Clear' : 'साफ करा'}
                  </button>
                  <button
                    onClick={() => { fetchEquipment(); setShowFilters(false) }}
                    className='flex-1 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold'
                  >
                    {lang === 'en' ? 'Apply' : 'लागू करा'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className='px-4 py-4'>
        {/* Results count */}
        {!loading && (
          <p className='text-xs font-semibold text-neutral-400 mb-3'>
            {sorted.length} {lang === 'en' ? 'equipment found' : 'उपकरणे सापडली'}
            {selectedType !== 'all' && ` · ${categories.find(c => c.key === selectedType)?.label}`}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className='flex flex-col gap-3'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='bg-white rounded-3xl h-28 animate-pulse' />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && sorted.length === 0 && (
          <div className='text-center py-16'>
            <FaTractor size={48} className='text-neutral-200 mx-auto mb-4' />
            <p className='text-neutral-400 font-semibold text-sm'>
              {lang === 'en' ? 'No equipment found' : 'उपकरण सापडले नाही'}
            </p>
            <p className='text-neutral-300 text-xs mt-1'>
              {lang === 'en' ? 'Try a different category or remove filters' : 'वेगळी श्रेणी निवडा'}
            </p>
          </div>
        )}

        {/* Equipment list */}
        {!loading && sorted.length > 0 && (
          <div className='flex flex-col gap-3'>
            {sorted.map((eq, i) => (
              <motion.div
                key={eq._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/farmer/equipment/${eq._id}`)}
                className='bg-white rounded-3xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.99] transition-all'
              >
                <div className='flex gap-3 p-3'>
                  {/* Photo */}
                  <div className='w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0'>
                    {eq.photos?.[0] ? (
                      <img
                        src={eq.photos[0]}
                        alt={eq.type}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-[#2D6A4F]/10 flex items-center justify-center'>
                        <FaTractor size={28} className='text-[#2D6A4F]' />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                      <p className='font-black text-neutral-900 text-sm capitalize leading-tight'>
                        {eq.type.replace(/_/g, ' ')}
                      </p>
                      {eq.rating > 0 && (
                        <div className='flex items-center gap-0.5 flex-shrink-0'>
                          <span className='text-amber-400 text-xs'>★</span>
                          <span className='text-xs font-bold text-neutral-600'>{eq.rating}</span>
                        </div>
                      )}
                    </div>

                    <p className='text-[11px] text-neutral-400 mt-0.5 truncate'>
                      {eq.owner?.name || 'Verified Owner'}
                    </p>

                    <div className='flex items-center gap-1 text-neutral-400 text-xs mt-1.5'>
                      <MdLocationOn size={12} />
                      <span>{eq.village || eq.taluka} · {eq.distanceKm} km away</span>
                    </div>

                    {/* Specs preview */}
                    {eq.specs && Object.keys(eq.specs).length > 0 && (
                      <div className='flex gap-1.5 mt-2 flex-wrap'>
                        {Object.entries(eq.specs).slice(0, 2).map(([key, val]) => (
                          <span key={key}
                            className='px-2 py-0.5 bg-[#F7F5F0] rounded-lg text-[10px] font-semibold text-neutral-500 capitalize'>
                            {key.replace(/([A-Z])/g, ' $1')}: {val}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className='flex items-center justify-between mt-2'>
                      <span className='text-[#2D6A4F] font-black text-sm'>
                        {formatPrice(eq.pricePerAcre)}
                        <span className='text-xs font-normal text-neutral-400'>/acre</span>
                      </span>
                      <div className='flex items-center gap-1 text-[#2D6A4F] text-xs font-bold'>
                        <span>{lang === 'en' ? 'Book' : 'बुक करा'}</span>
                        <MdArrowForward size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </FarmerLayout>
  )
}