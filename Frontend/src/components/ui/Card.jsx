import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  onClick,
  hover = false
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } : {}}
      className={`
        bg-white rounded-2xl shadow-sm
        ${onClick || hover ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}