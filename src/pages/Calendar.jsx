import React, { useState, useEffect, useCallback } from 'react'
import { usePetContext } from '../App.jsx'
import PetSelector from '../components/PetSelector.jsx'
import { getRecordsByPet } from '../lib/db.js'
import { RECORD_TYPES, WEEKDAYS } from '../constants/types.js'

// 날짜별 이모지 맵핑
function buildDateEmojiMap(records) {
  const map = {}
  records.forEach(r => {
    const d = new Date(r.timestamp).toISOString().slice(0, 10)
    if (!map[d]) map[d] = []
    const type = Object.values(RECORD_TYPES).find(t => t.id === r.type)
    if (type) map[d].push(type.emoji)
  })
  return map
}

function CalendarGrid({ year, month, emojiMap, onSelectDate, selectedDate }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)

  const cells = []
  // 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  return (
    <div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={`text-center text-xs font-semibold py-1
              ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const emojis  = emojiMap[dateStr] || []
          const isToday = dateStr === today
          const isSel   = dateStr === selectedDate

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center p-1 rounded-xl transition-all min-h-[52px]
                ${isSel   ? 'bg-brand-primary/20 ring-2 ring-brand-primary' :
                  isToday ? 'bg-pastel-peach' : 'hover:bg-gray-50'}`}
            >
              <span className={`text-xs font-medium mb-0.5
                ${idx % 7 === 0 ? 'text-red-400' :
                  idx % 7 === 6 ? 'text-blue-400' :
                  isToday       ? 'text-brand-primary font-bold' : 'text-gray-600'}`}
              >
                {day}
              </span>
              {/* 이모지 최대 2개 표시 */}
              <div className="flex flex-wrap justify-center gap-0 text-[11px] leading-tight">
                {emojis.slice(0, 2).map((e, i) => (
                  <span key={i}>{e}</span>
                ))}
                {emojis.length > 2 && (
                  <span className="text-[9px] text-gray-400">+{emojis.length - 2}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DayDetail({ dateStr, records }) {
  if (!dateStr) return null
  const [, m, d] = dateStr.split('-')
  const displayDate = `${parseInt(m)}월 ${parseInt(d)}일`

  return (
    <div className="card mt-4">
      <p className="text-sm font-bold text-brand-dark mb-3">{displayDate} 기록</p>
      {records.length === 0 ? (
        <p className="text-sm text-gray-300 text-center py-3">기록이 없어요</p>
      ) : (
        <div className="space-y-2">
          {records.sort((a, b) => a.timestamp - b.timestamp).map(rec => {
            const type = Object.values(RECORD_TYPES).find(t => t.id === rec.type)
            const time = new Date(rec.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit', minute: '2-digit',
            })
            return (
              <div key={rec.id} className="flex items-center gap-3 py-1.5
                                           border-b border-gray-50 last:border-0">
                <span className="text-2xl">{type?.emoji || '📝'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-dark">{type?.label || rec.type}</p>
                  {rec.memo && <p className="text-xs text-gray-400">{rec.memo}</p>}
                </div>
                <span className="text-xs text-gray-400">{time}</span>
                {rec.photo && (
                  <img src={rec.photo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Calendar() {
  const { activePetId } = usePetContext()
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [emojiMap,      setEmojiMap]      = useState({})
  const [selectedDate,  setSelectedDate]  = useState(null)
  const [dayRecords,    setDayRecords]    = useState([])
  const [allRecords,    setAllRecords]    = useState([])

  const loadRecords = useCallback(async () => {
    if (!activePetId) return
    const recs = await getRecordsByPet(activePetId)
    setAllRecords(recs)
    setEmojiMap(buildDateEmojiMap(recs))
  }, [activePetId])

  useEffect(() => { loadRecords() }, [loadRecords])

  useEffect(() => {
    if (!selectedDate) { setDayRecords([]); return }
    const recs = allRecords.filter(r =>
      new Date(r.timestamp).toISOString().slice(0, 10) === selectedDate
    )
    setDayRecords(recs)
  }, [selectedDate, allRecords])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  return (
    <div className="page-content">
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-brand-dark">📅 캘린더</h1>
      </div>

      <PetSelector />

      <div className="px-4 mt-4">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-white border border-gray-100 text-gray-500 active:opacity-70"
          >
            ‹
          </button>
          <h2 className="text-lg font-bold text-brand-dark">
            {year}년 {month + 1}월
          </h2>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-white border border-gray-100 text-gray-500 active:opacity-70"
          >
            ›
          </button>
        </div>

        <div className="card">
          <CalendarGrid
            year={year}
            month={month}
            emojiMap={emojiMap}
            selectedDate={selectedDate}
            onSelectDate={d => setSelectedDate(prev => prev === d ? null : d)}
          />
        </div>

        {/* 이모지 범례 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.values(RECORD_TYPES).map(t => (
            <span key={t.id} className="text-xs bg-white rounded-xl px-2 py-1
                                        border border-gray-100 text-gray-500">
              {t.emoji} {t.label}
            </span>
          ))}
        </div>

        {/* 선택된 날 상세 */}
        {selectedDate && (
          <DayDetail dateStr={selectedDate} records={dayRecords} />
        )}
      </div>
    </div>
  )
}
