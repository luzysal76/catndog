import React, { useState, useEffect, useRef, useCallback } from 'react'
// recharts 정적 import — HealthReport 자체가 React.lazy() 로 lazy chunk이므로
// vite.config.js manualChunks: 'vendor-charts' 와 결합하여
// /report 방문 시에만 vendor-charts chunk가 로드됨 (= dynamic import 효과와 동일)
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { usePetContext, useToast } from '../App.jsx'
import PetSelector from '../components/PetSelector.jsx'
import Button from '../components/ui/Button.jsx'
import { getRecordsByDateRange } from '../lib/db.js'
import { exportWeeklyReport } from '../lib/pdfExport.js'
import { RECORD_TYPES } from '../constants/types.js'

// 주간 데이터 생성
function buildWeeklyData(records) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const label   = `${d.getMonth() + 1}/${d.getDate()}`
    const dayRecs = records.filter(
      r => new Date(r.timestamp).toISOString().slice(0, 10) === dateStr
    )
    const entry = { date: label }
    Object.values(RECORD_TYPES).forEach(t => {
      entry[t.label] = dayRecs.filter(r => r.type === t.id).length
    })
    days.push(entry)
  }
  return days
}

// 주간 통계 요약
function buildSummary(records) {
  const summary = {}
  Object.values(RECORD_TYPES).forEach(t => {
    const recs = records.filter(r => r.type === t.id)
    summary[t.id] = {
      total:   recs.length,
      perDay:  (recs.length / 7).toFixed(1),
      emoji:   t.emoji,
      label:   t.label,
      color:   t.color,
    }
  })
  return summary
}

const CHART_COLORS = {
  '대변': '#C8A882',
  '소변': '#87CEEB',
  '구토': '#90EE90',
  '식사': '#FFB347',
  '약복용': '#DDA0DD',
}

export default function HealthReport() {
  const showToast = useToast()
  const { activePetId, activePet } = usePetContext()
  const reportRef = useRef(null)

  const [records,    setRecords]    = useState([])
  const [weekData,   setWeekData]   = useState([])
  const [summary,    setSummary]    = useState({})
  const [exporting,  setExporting]  = useState(false)
  const [activeKeys, setActiveKeys] = useState(['대변', '소변'])

  const loadData = useCallback(async () => {
    if (!activePetId) return
    const end   = Date.now()
    const start = end - 7 * 24 * 60 * 60 * 1000
    const recs  = await getRecordsByDateRange(activePetId, start, end)
    setRecords(recs)
    setWeekData(buildWeeklyData(recs))
    setSummary(buildSummary(recs))
  }, [activePetId])

  useEffect(() => { loadData() }, [loadData])

  async function handleExport() {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      await exportWeeklyReport(activePet?.name || '반려동물', today, reportRef.current)
      showToast('PDF가 저장됐어요!', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setExporting(false)
    }
  }

  function toggleKey(key) {
    setActiveKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const weekLabel = (() => {
    const end   = new Date()
    const start = new Date(end - 6 * 24 * 60 * 60 * 1000)
    return `${start.getMonth()+1}/${start.getDate()} ~ ${end.getMonth()+1}/${end.getDate()}`
  })()

  return (
    <div className="page-content">
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-brand-dark">📊 건강 리포트</h1>
        <p className="text-sm text-gray-400 mt-1">최근 7일 · {weekLabel}</p>
      </div>

      <PetSelector />

      <div className="px-4 mt-4 space-y-4" ref={reportRef}>
        {/* 요약 카드 */}
        <div className="card">
          <p className="text-xs text-gray-400 font-medium mb-3">7일 요약</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(summary).map(s => (
              <div key={s.label}
                   className="flex flex-col items-center bg-pastel-cream rounded-2xl py-3">
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-xl font-bold text-brand-dark mt-1">{s.total}</span>
                <span className="text-[11px] text-gray-400">{s.label}</span>
                <span className="text-[10px] text-gray-300">일평균 {s.perDay}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 막대 차트 */}
        <div className="card">
          <p className="text-xs text-gray-400 font-medium mb-2">일별 기록 현황</p>

          {/* 범례 토글 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(CHART_COLORS).map(([key, color]) => (
              <button
                key={key}
                onClick={() => toggleKey(key)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all
                  ${activeKeys.includes(key)
                    ? 'text-white border-transparent'
                    : 'text-gray-400 border-gray-200 bg-white'}`}
                style={activeKeys.includes(key) ? { backgroundColor: color } : {}}
              >
                {key}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
              />
              {Object.entries(CHART_COLORS).map(([key, color]) =>
                activeKeys.includes(key) ? (
                  <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} />
                ) : null
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 추세 라인 차트 */}
        <div className="card">
          <p className="text-xs text-gray-400 font-medium mb-3">대변·소변 추세</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="대변" stroke="#C8A882" strokeWidth={2}
                    dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="소변" stroke="#87CEEB" strokeWidth={2}
                    dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 기록 없음 */}
        {records.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-sm text-gray-400">최근 7일 기록이 없어요</p>
          </div>
        )}
      </div>

      {/* PDF 내보내기 */}
      <div className="px-4 mt-4">
        <Button
          onClick={handleExport}
          disabled={exporting || records.length === 0}
          variant="secondary"
          fullWidth
        >
          {exporting ? '📄 PDF 생성 중...' : '📄 PDF로 내보내기'}
        </Button>
        <p className="text-xs text-gray-300 text-center mt-2">
          수의사 방문 시 리포트를 보여주세요
        </p>
      </div>
    </div>
  )
}
