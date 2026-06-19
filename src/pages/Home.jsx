import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetContext } from '../App.jsx'
import PetSelector from '../components/PetSelector.jsx'
import RecordItem from '../components/RecordItem.jsx'
import { getRecordsByPetAndDate } from '../lib/db.js'
import { RECORD_TYPES, PET_SPECIES } from '../constants/types.js'

// records prop을 받아 이중 DB 쿼리 제거
function TodaySummaryCard({ records }) {
  const counts = {}
  Object.keys(RECORD_TYPES).forEach(k => { counts[k] = 0 })
  records.forEach(r => {
    const key = r.type?.toUpperCase()
    if (key && counts[key] !== undefined) counts[key]++
  })

  const photos = records
    .filter(r => r.photo)
    .slice(-4)
    .reverse()

  return (
    <div className="card space-y-3">
      <p className="text-xs text-gray-400 font-medium">오늘의 기록</p>

      {/* 유형별 횟수 */}
      <div className="grid grid-cols-5 gap-2">
        {Object.values(RECORD_TYPES).map(t => (
          <div key={t.id} className="flex flex-col items-center gap-1">
            <div className="emoji-badge text-xl">{t.emoji}</div>
            <span className="text-lg font-bold text-brand-dark">
              {counts[t.id.toUpperCase()] ?? 0}
            </span>
            <span className="text-[10px] text-gray-400">{t.label}</span>
          </div>
        ))}
      </div>

      {/* 최근 사진 썸네일 */}
      {photos.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1">최근 사진</p>
          <div className="flex gap-2">
            {photos.map((r, i) => (
              <img
                key={i}
                src={r.photo}
                alt="기록사진"
                className="w-16 h-16 object-cover rounded-xl border border-gray-100"
              />
            ))}
          </div>
        </div>
      )}

      {records.length === 0 && (
        <p className="text-sm text-gray-300 text-center py-2">
          오늘 기록이 없어요 🐾
        </p>
      )}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { pets, activePetId, activePet } = usePetContext()
  const [todayRecords, setTodayRecords] = useState([])

  // 단 1번만 쿼리 후 TodaySummaryCard와 타임라인 양쪽에 공유
  useEffect(() => {
    if (!activePetId) return
    const today = new Date().toISOString().slice(0, 10)
    getRecordsByPetAndDate(activePetId, today).then(recs => {
      setTodayRecords(recs.sort((a, b) => b.timestamp - a.timestamp))
    })
  }, [activePetId])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 6)  return '🌙 새벽이에요'
    if (h < 12) return '☀️ 좋은 아침이에요'
    if (h < 18) return '🌤 좋은 오후예요'
    return '🌙 좋은 저녁이에요'
  }

  const species = PET_SPECIES.find(s => s.id === activePet?.species) || PET_SPECIES[4]

  // 반려동물 없음 상태
  if (!pets || pets.length === 0) {
    return (
      <div className="page-content flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <div className="text-6xl">🐾</div>
        <h2 className="text-xl font-bold text-brand-dark">반려동물을 등록해주세요</h2>
        <p className="text-sm text-gray-400 text-center">
          설정에서 반려동물을 추가하면<br/>기록을 시작할 수 있어요!
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="btn-primary mt-2"
        >
          반려동물 등록하기
        </button>
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* 헤더 */}
      <div className="px-4 pt-8 pb-4">
        <p className="text-sm text-gray-400">{greeting()}</p>
        <h1 className="text-2xl font-bold text-brand-dark mt-1">
          {species.emoji} {activePet?.name || '반려동물'}
        </h1>
      </div>

      {/* 반려동물 선택 */}
      <PetSelector />

      {/* 빠른 기록 버튼 */}
      <div className="px-4 mt-4">
        <button
          onClick={() => navigate('/record')}
          className="w-full bg-brand-primary text-white rounded-3xl py-4
                     text-lg font-bold shadow-md active:opacity-80 transition-opacity
                     flex items-center justify-center gap-2"
        >
          <span className="text-2xl">✏️</span>
          지금 기록하기
        </button>
      </div>

      {/* 오늘 요약 — 이미 로드된 todayRecords 전달, DB 재호출 없음 */}
      <div className="px-4 mt-4">
        <TodaySummaryCard records={todayRecords} />
      </div>

      {/* 최근 기록 타임라인 */}
      {todayRecords.length > 0 && (
        <div className="px-4 mt-4">
          <div className="card">
            <p className="text-xs text-gray-400 font-medium mb-2">오늘 기록 타임라인</p>
            {todayRecords.slice(0, 6).map(rec => (
              <RecordItem key={rec.id} record={rec} className="py-2" />
            ))}
          </div>
        </div>
      )}

      {/* 빠른 메뉴 */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/ai')}
          className="card flex flex-col items-center gap-2 py-4 active:opacity-80"
        >
          <span className="text-3xl">🤖</span>
          <span className="text-sm font-semibold text-brand-dark">AI 똥 분석</span>
          <span className="text-xs text-gray-400">사진으로 건강 체크</span>
        </button>
        <button
          onClick={() => navigate('/report')}
          className="card flex flex-col items-center gap-2 py-4 active:opacity-80"
        >
          <span className="text-3xl">📊</span>
          <span className="text-sm font-semibold text-brand-dark">건강 리포트</span>
          <span className="text-xs text-gray-400">주간 통계 보기</span>
        </button>
      </div>
    </div>
  )
}
