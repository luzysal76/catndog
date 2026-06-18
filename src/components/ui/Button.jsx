import React from 'react'

/**
 * 공통 버튼 컴포넌트
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all active:scale-95'

  const variants = {
    primary:   'bg-brand-primary text-white shadow-sm hover:brightness-105 disabled:opacity-50',
    secondary: 'bg-pastel-peach text-brand-dark hover:brightness-105 disabled:opacity-50',
    ghost:     'bg-transparent text-brand-dark border border-gray-200 hover:bg-gray-50 disabled:opacity-50',
    danger:    'bg-red-400 text-white hover:brightness-105 disabled:opacity-50',
  }

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-5 py-2.5',
    lg: 'text-lg px-6 py-3',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]}
                  ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
