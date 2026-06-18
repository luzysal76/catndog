import React, { useEffect } from 'react'

/**
 * 공통 모달 컴포넌트
 */
export default function Modal({ isOpen, onClose, title, children }) {
  // 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 모달 패널 */}
      <div
        className="relative w-full max-w-[480px] bg-white rounded-t-3xl p-6
                   shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        {title && (
          <h2 className="text-lg font-bold text-brand-dark mb-4">{title}</h2>
        )}

        {children}
      </div>
    </div>
  )
}
