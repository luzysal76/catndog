import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetContext, useToast } from '../App.jsx'
import PetSelector from '../components/PetSelector.jsx'
import Button from '../components/ui/Button.jsx'
import { addRecord } from '../lib/db.js'
import { resizeImage } from '../lib/aiAnalysis.js'
import { RECORD_TYPES } from '../constants/types.js'

export default function Record() {
  const navigate   = useNavigate()
  const showToast  = useToast()
  const { pets, activePetId } = usePetContext()

  const [selectedType, setSelectedType] = useState('poop')
  const [memo, setMemo]     = useState('')
  const [photo, setPhoto]   = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  // 사진 선택/촬영
  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const resized = await resizeImage(file)
      setPhoto(resized)
    } catch {
      showToast('사진 처리 중 오류가 발생했습니다.', 'error')
    }
  }

  // 저장
  async function handleSave() {
    if (!activePetId) {
      showToast('반려동물을 먼저 선택해주세요.', 'warning')
      return
    }
    setSaving(true)
    try {
      await addRecord({
        petId: activePetId,
        type:  selectedType,
        memo:  memo.trim(),
        photo: photo || null,
      })
      showToast('기록이 저장됐어요! 🎉', 'success')
      // 초기화
      setMemo('')
      setPhoto(null)
      setSelectedType('poop')
      navigate('/')
    } catch (e) {
      showToast('저장 중 오류가 발생했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // 반려동물 없음
  if (!pets || pets.length === 0) {
    return (
      <div className="page-content flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <span className="text-5xl">🐾</span>
        <p className="text-brand-dark font-semibold">반려동물을 먼저 등록해주세요</p>
        <Button onClick={() => navigate('/settings')}>설정으로 이동</Button>
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* 헤더 */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-brand-dark">✏️ 기록하기</h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          {' '}{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* 반려동물 선택 */}
      <PetSelector />

      {/* 유형 선택 */}
      <div className="px-4 mt-5">
        <p className="text-sm font-semibold text-brand-dark mb-3">유형 선택</p>
        <div className="grid grid-cols-5 gap-2">
          {Object.values(RECORD_TYPES).map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl
                          transition-all active:scale-95
                          ${selectedType === t.id
                            ? 'bg-brand-primary text-white shadow-md scale-105'
                            : 'bg-white border border-gray-100 text-gray-600'}`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[11px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 사진 촬영 */}
      <div className="px-4 mt-5">
        <p className="text-sm font-semibold text-brand-dark mb-3">사진 (선택)</p>
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
              alt="촬영 사진"
              className="w-full h-48 object-cover rounded-2xl border border-gray-100"
            />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 bg-white/80 text-gray-600
                         rounded-full w-8 h-8 flex items-center justify-center text-lg"
            >
              ✕
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-2 right-2 bg-brand-primary text-white
                         rounded-xl px-3 py-1.5 text-xs font-medium"
            >
              다시 찍기
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 border-2 border-dashed border-gray-200
                       rounded-2xl flex flex-col items-center justify-center gap-2
                       text-gray-400 active:bg-gray-50 transition-colors"
          >
            <span className="text-3xl">📸</span>
            <span className="text-sm">사진 촬영 또는 선택</span>
          </button>
        )}
      </div>

      {/* 메모 */}
      <div className="px-4 mt-5">
        <p className="text-sm font-semibold text-brand-dark mb-3">메모 (선택)</p>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="특이사항을 메모하세요..."
          maxLength={200}
          rows={3}
          className="w-full border border-gray-200 rounded-2xl p-3
                     text-sm text-brand-dark placeholder-gray-300
                     focus:outline-none focus:border-brand-primary resize-none"
        />
        <p className="text-xs text-gray-300 text-right mt-1">{memo.length}/200</p>
      </div>

      {/* 저장 버튼 */}
      <div className="px-4 mt-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          fullWidth
          size="lg"
        >
          {saving ? '저장 중...' : '💾 저장하기'}
        </Button>
      </div>
    </div>
  )
}
