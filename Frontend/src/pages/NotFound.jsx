import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-sky-100 overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Animated Scenery */}
      
      {/* Sun */}
      <motion.div 
        className="absolute top-10 right-20 w-24 h-24 bg-yellow-400 rounded-full blur-[2px]"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Clouds */}
      <motion.div 
        className="absolute top-20 left-0 text-white opacity-80"
        initial={{ x: '-100%' }}
        animate={{ x: '100vw' }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg width="120" height="60" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.49.08-1.02.22-1.5-.72.63-1.63 1-2.72 1-2.209 0-4-1.791-4-4 0-1.684 1.053-3.12 2.548-3.722-.03-.255-.048-.517-.048-.778C9 2.462 11.462 0 14.5 0S20 2.462 20 5.5c0 .285-.022.564-.063.837C21.678 6.942 23 8.814 23 11c0 2.761-2.239 5-5 5h-10c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3h12c1.657 0 3-1.343 3-3H17.5z"/>
        </svg>
      </motion.div>

      <motion.div 
        className="absolute top-40 right-10 text-white opacity-60"
        initial={{ x: '100vw' }}
        animate={{ x: '-100%' }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <svg width="160" height="80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.49.08-1.02.22-1.5-.72.63-1.63 1-2.72 1-2.209 0-4-1.791-4-4 0-1.684 1.053-3.12 2.548-3.722-.03-.255-.048-.517-.048-.778C9 2.462 11.462 0 14.5 0S20 2.462 20 5.5c0 .285-.022.564-.063.837C21.678 6.942 23 8.814 23 11c0 2.761-2.239 5-5 5h-10c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3h12c1.657 0 3-1.343 3-3H17.5z"/>
        </svg>
      </motion.div>

      {/* Farmland Hills */}
      <div className="absolute bottom-0 w-full h-1/2 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-[-10%] w-[120%] h-[60%] bg-green-500 rounded-[100%] blur-[1px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[120%] h-[70%] bg-emerald-600 rounded-[100%] blur-[1px]"></div>
        
        {/* Animated Tractor driving across the farm */}
        <motion.div
          className="absolute bottom-[45%] left-0 w-32 h-24"
          initial={{ x: '-20vw' }}
          animate={{ x: '120vw', y: [0, -5, 0, 5, 0] }}
          transition={{ 
            x: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Simple Tractor SVG */}
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 70H80V50H50L40 40H20V70Z" fill="#ef4444" />
            <path d="M50 70V40M80 70V50" stroke="#b91c1c" strokeWidth="2" />
            <circle cx="30" cy="70" r="12" fill="#333" />
            <circle cx="30" cy="70" r="6" fill="#e5e5e5" />
            <circle cx="70" cy="70" r="16" fill="#333" />
            <circle cx="70" cy="70" r="8" fill="#e5e5e5" />
            <rect x="45" y="25" width="4" height="15" fill="#555" />
            {/* Smoke puffs from exhaust */}
            <motion.circle 
              cx="47" cy="20" r="4" fill="#a3a3a3"
              animate={{ y: -15, opacity: 0, scale: 2 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.circle 
              cx="47" cy="20" r="4" fill="#a3a3a3"
              animate={{ y: -15, opacity: 0, scale: 2 }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50">
        <motion.h1 
          className="text-9xl font-black text-emerald-600 mb-2"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          404
        </motion.h1>
        
        <motion.h2 
          className="text-3xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Looks like you wandered off the field!
        </motion.h2>
        
        <motion.p 
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The page you are looking for has been harvested, moved, or never existed in this crop cycle.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-full border-2 border-emerald-600 hover:bg-emerald-50 transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}
