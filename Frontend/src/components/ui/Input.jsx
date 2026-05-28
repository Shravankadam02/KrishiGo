export default function Input({
  label,
  error,
  prefix,
  suffix,
  className = '',
  ...props
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      {label && (
        <label className='text-sm font-medium text-neutral-600'>
          {label}
        </label>
      )}
      <div className='relative flex items-center'>
        {prefix && (
          <span className='absolute left-3 text-neutral-300 font-medium'>
            {prefix}
          </span>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-xl
            border-2 border-neutral-300
            bg-white text-neutral-900
            placeholder:text-neutral-300
            focus:outline-none focus:border-primary
            transition-colors duration-200
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            ${prefix ? 'pl-10' : ''}
            ${suffix ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:border-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className='absolute right-3 text-neutral-300'>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <span className='text-sm text-red-500'>{error}</span>
      )}
    </div>
  )
}