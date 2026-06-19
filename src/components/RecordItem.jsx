import React from 'react'
import { RECORD_TYPES } from '../constants/types.js'

/**
 * 공통 기록 아이템 컴포넌트
 * Home(타임라인)과 Calendar(날짜 상세)에서 공유
 * @param {object} record - 기록 객체
 * @param {string} className - 추가 클래스 (py-2 / py-1.5 등 간격 차이 처리)
 */
export default function RecordItem({ record, className = 'py-2' }) {
  const type = Object.values(RECORD_TYPES).find(t => t.id === record.type)
  const time = new Date(record.timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`flex items-center gap-3 border-b border-gray-50 last:border-0 ${className}`}>
      <span className="text-2xl">{type?.emoji || '📝'}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-brand-dark">{type?.label || record.type}</p>
        {record.memo && (
          <p className="text-xs text-gray-400 truncate">{record.memo}</p>
        )}
      </div>
      <span className="text-xs text-gray-400">{time}</span>
      {record.photo && (
        <img src={record.photo} alt="" className="w-10 h-10 rounded-lg object-cover" />
      )}
    </div>
  )
}
