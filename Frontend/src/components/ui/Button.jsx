import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-light',
  secondary: 'bg-accent text-white hover:bg-accent-light',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-primary hover:bg-primary/10',
  danger: 'bg-red-500 text-white hover:bg-red-600'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
  full: 'w-full px-5 py-3.5 text-base'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading ? (
        <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
      ) : children}
    </motion.button>
  )
}