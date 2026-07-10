import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiSearch, HiArrowLeft } from 'react-icons/hi'
import { MdLocationOn, MdStar, MdVerified } from 'react-icons/md'
import { FaTractor } from 'react-icons/fa'
import { GiSeedling, GiSpray, GiGears, GiScythe } from 'react-icons/gi'
import { RiPlantLine } from 'react-icons/ri'
import api from '../services/api'
import { formatPrice } from '../utils/helpers'
import logo from '../assets/logo.png'

const categories = [
  { key: 'all',               label: 'All' },
  { key: 'tractor_plowing',   label: 'Tractor',     Icon: FaTractor },
  { key: 'tractor_rotavator', label: 'Rotavator',   Icon: GiGears },
  { key: 'harvester_wheat',   label: 'Harvester',   Icon: GiScythe },
  { key: 'sprayer',           label: 'Sprayer',     Icon: GiSpray },
  { key: 'seed_drill',        label: 'Seed Drill',  Icon: GiSeedling },
  { key: 'other',             label: 'Other',       Icon: RiPlantLine },
]

export default function PublicExplore() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lang = localStorage.getItem('language') || 'en'

  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all')

  useEffect(() => {
    fetchEquipment()
  }, [selectedType])

  const fetchEquipment = async () => {
    setLoading(true)
    try {
      const params = {
        lat: 20.0650,
        lng: 74.1077
      }
      if (selectedType !== 'all') params.type = selectedType
      const { data } = await api.get('/api/equipment', { params })
      setEquipment(data.equipment || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = equipment.filter(eq =>
    search === '' ||
    eq.type.toLowerCase().includes(search.toLowerCase()) ||
    eq.village?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='min-h-screen bg-[#F7F5F0]' style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* Navbar */}
      <nav className='bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30'>
        <div className='flex items-center gap-3'>
          <button onClick={() => navigate('/')}
            className='w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center'>
            <HiArrowLeft size={18} className='text-neutral-600' />
          </button>
          <img src={logo} alt='KrishiGo' className='h-8 w-auto' />
        </div>
        <button
          onClick={() => navigate('/login')}
          className='px-4 py-2 bg-[#2D6A4F] text-white text-sm font-bold rounded-xl'
        >
          Login
        </button>
      </nav>

      {/* Search + filters */}
      <div className='bg-white border-b border-neutral-100 px-4 py-4'>
        {/* Search bar */}
        <div className='flex items-center gap-2 bg-[#F7F5F0] rounded-2xl px-4 py-3 mb-3'>
          <HiSearch size={18} className='text-neutral-400' />
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search equipment, village...'
            className='flex-1 bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none'
          />
        </div>

        {/* Category pills */}
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedType(cat.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === cat.key
                  ? 'bg-[#2D6A4F] text-white'
                  : 'bg-[#F7F5F0] text-neutral-500'
              }`}
            >
              {cat.Icon && <cat.Icon size={13} />}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className='px-4 py-4 max-w-6xl mx-auto'>
        <p className='text-xs font-semibold text-neutral-400 mb-4'>
          {loading ? 'Searching...' : `${filtered.length} equipment found`}
        </p>

        {/* Loading */}
        {loading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className='bg-white rounded-2xl h-64 animate-pulse' />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className='text-center py-16'>
            <FaTractor size={48} className='text-neutral-200 mx-auto mb-3' />
            <p className='text-neutral-400 font-semibold'>No equipment found</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filtered.map((eq, i) => (
              <motion.div
                key={eq._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/equipment/${eq._id}`)}
                className='bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-100'
              >
                {/* Image */}
                <div className='relative h-48 bg-[#2D6A4F]/10'>
                  {eq.photos?.[0] ? (
                    <img src={eq.photos[0]} alt=''
                      className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <FaTractor size={40} className='text-[#2D6A4F]/30' />
                    </div>
                  )}
                  <span className='absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full'>
                    Available
                  </span>
                  {eq.distanceKm !== undefined && (
                    <span className='absolute top-3 right-3 px-2 py-1 bg-black/40 text-white text-xs font-semibold rounded-full flex items-center gap-1'>
                      <MdLocationOn size={11} />
                      {eq.distanceKm} km
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className='p-4'>
                  <div className='flex items-start justify-between mb-2'>
                    <h3 className='font-black text-neutral-900 capitalize leading-tight'>
                      {eq.type.replace(/_/g, ' ')}
                    </h3>
                    {eq.rating > 0 && (
                      <div className='flex items-center gap-1'>
                        <MdStar size={13} className='text-amber-400' />
                        <span className='text-xs font-bold text-neutral-600'>{eq.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-1.5 mb-3'>
                    <div className='w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center'>
                      <span className='text-white font-black text-[9px]'>
                        {eq.owner?.name?.[0]}
                      </span>
                    </div>
                    <span className='text-xs text-neutral-500 truncate'>
                      {eq.owner?.name}
                    </span>
                    <MdVerified size={13} className='text-[#2D6A4F]' />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='text-[#2D6A4F] font-black text-lg'>
                        {formatPrice(eq.pricePerAcre)}
                      </span>
                      <span className='text-neutral-400 text-xs'>/acre</span>
                    </div>
                    <div className='flex items-center gap-1 text-neutral-400 text-xs'>
                      <MdLocationOn size={12} />
                      <span>{eq.village}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}