import React, { useState, useRef } from 'react'
import { usePetContext, useToast } from '../App.jsx'
import Button from '../components/ui/Button.jsx'
import { analyzePoopImage, resizeImage } from '../lib/aiAnalysis.js'
import { addRecord } from '../lib/db.js'
import { POOP_STATUS } from '../constants/types.js'

function ResultCard({ result }) {
  const status = POOP_STATUS[result.status?.toUpperCase()] || POOP_STATUS.UNKNOWN
  const urgencyColor = {
    low:    'text-green-500',
    medium: 'text-yellow-500',
    high:   'text-red-500',
  }[result.urgency] || 'text-gray-400'

  return (
    <div className="card space-y-3 mt-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{status.emoji}</span>
        <div>
          <p className="text-lg font-bold text-brand-dark">{status.label}</p>
          <p className="text-xs text-gray-400">
            신뢰도: <span className="font-semibold">{result.confidence}%</span>
            {' · '}
            긴급도: <span className={`font-semibold ${urgencyColor}`}>
              {result.urgency === 'high' ? '높음' : result.urgency === 'medium' ? '보통' : '낮음'}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-pastel-cream rounded-2xl p-3">
        <p className="text-sm text-brand-dark leading-relaxed">{result.description}</p>
      </div>

      <div className="bg-pastel-blue rounded-2xl p-3">
        <p className="text-xs font-semibold text-brand-dark mb-1">💡 보호자 조언</p>
        <p className="text-sm text-brand-dark leading-relaxed">{result.advice}</p>
      </div>

      {result.urgency === 'high' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
          <p className="text-sm text-red-600 font-semibold">
            🚨 수의사 방문을 권장합니다
          </p>
        </div>
      )}
    </div>
  )
}

export default function AIAnalysis() {
  const showToast = useToast()
  const { activePetId, activePet } = usePetContext()
  const fileRef   = useRef(null)

  const [photo,     setPhoto]     = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError(null)
    try {
      const resized = await resizeImage(file)
      setPhoto(resized)
    } catch {
      showToast('사진 처리 오류', 'error')
    }
  }

  async function handleAnalyze() {
    if (!photo) {
      showToast('사진을 먼저 선택해주세요.', 'warning')
      return
    }
    if (!navigator.onLine) {
      setError('오프라인 상태입니다. 인터넷 연결을 확인해주세요.')
      return
    }
    setAnalyzing(true)
    setError(null)
    try {
      const res = await analyzePoopImage(photo)
      setResult(res)

      // AI 분석 결과도 기록으로 저장
      if (activePetId) {
        await addRecord({
          petId:       activePetId,
          type:        'poop',
          photo:       photo,
          memo:        `AI분석: ${POOP_STATUS[res.status?.toUpperCase()]?.label || res.status}`,
          aiResult:    res,
        })
        showToast('분석 결과가 기록에 저장됐어요.', 'success')
      }
    } catch (e) {
      setError(e.message || 'AI 분석 중 오류가 발생했습니다.')
    } finally {
      setAnalyzing(false)
    }
  }

  function handleReset() {
    setPhoto(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="page-content">
      {/* 헤더 */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-brand-dark">🤖 AI 똥 분석</h1>
        <p className="text-sm text-gray-400 mt-1">
          사진을 찍으면 AI가 건강 상태를 분석해요
        </p>
        {activePet && (
          <p className="text-sm text-brand-primary font-medium mt-1">
            대상: {activePet.name}
          </p>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* 사진 영역 */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />

        {photo ? (
          <div className="relative">
            <img
              src={photo}
              alt="분석할 사진"
              className="w-full h-64 object-cover rounded-3xl border border-gray-100"
            />
            {!result && (
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 bg-white/80 text-gray-600
                           rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-56 border-2 border-dashed border-brand-primary/40
                       rounded-3xl flex flex-col items-center justify-center gap-3
                       text-gray-400 active:bg-pastel-peach transition-colors"
          >
            <span className="text-5xl">📸</span>
            <span className="font-medium text-brand-dark">사진 촬영 또는 선택</span>
            <span className="text-xs text-gray-400">대변 사진을 찍어주세요</span>
          </button>
        )}

        {/* 분석 버튼 */}
        {photo && !result && (
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            fullWidth
            size="lg"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                AI 분석 중...
              </span>
            ) : '🔍 AI 분석 시작'}
          </Button>
        )}

        {/* 오류 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 분석 결과 */}
        {result && <ResultCard result={result} />}

        {/* 결과 후 다시 분석 */}
        {result && (
          <Button onClick={handleReset} variant="secondary" fullWidth>
            다시 분석하기
          </Button>
        )}

        {/* 오프라인 안내 */}
        {!navigator.onLine && (
          <div className="bg-pastel-yellow rounded-2xl p-4">
            <p className="text-sm text-brand-dark">
              📡 AI 분석은 인터넷 연결이 필요합니다.
            </p>
          </div>
        )}

        {/* 면책 문구 */}
        <p className="text-xs text-gray-300 text-center pb-2">
          ⚠️ AI 분석은 참고용이며 의학적 진단을 대체하지 않습니다.
          이상 증상이 지속되면 수의사에게 문의하세요.
        </p>
      </div>
    </div>
  )
}
