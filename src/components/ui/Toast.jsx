import React from 'react'

const TYPE_STYLES = {
  info:    'bg-pastel-blue text-brand-dark',
  success: 'bg-pastel-green text-brand-dark',
  warning: 'bg-pastel-yellow text-brand-dark',
  error:   'bg-red-100 text-red-700',
}

const TYPE_EMOJI = {
  info:    'ℹ️',
  success: '✅',
  warning: '⚠️',
  error:   '❌',
}

/**
 * 토스트 알림 컴포넌트
 */
export function Toast({ message, type = 'info', onClose }) {
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100]
                  flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg
                  max-w-[90vw] text-sm font-medium
                  animate-fade-in
                  ${TYPE_STYLES[type] || TYPE_STYLES.info}`}
      onClick={onClose}
    >
      <span>{TYPE_EMOJI[type] || '💬'}</span>
      <span>{message}</span>
    </div>
  )
}
