import React, { useState } from 'react'
import { usePetContext, useToast } from '../App.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import { addPet, updatePet, deletePet } from '../lib/db.js'
import { requestNotificationPermission } from '../lib/notifications.js'
import { PET_SPECIES } from '../constants/types.js'

// 반려동물 폼
function PetForm({ initial, onSave, onCancel }) {
  const [name,    setName]    = useState(initial?.name    || '')
  const [species, setSpecies] = useState(initial?.species || 'dog')
  const [birth,   setBirth]   = useState(initial?.birth   || '')
  const [weight,  setWeight]  = useState(initial?.weight  || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ ...initial, name: name.trim(), species, birth, weight })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 이름 */}
      <div>
        <label className="text-sm font-semibold text-brand-dark block mb-1">이름 *</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="반려동물 이름"
          required
          maxLength={20}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                     text-sm focus:outline-none focus:border-brand-primary"
        />
      </div>

      {/* 종류 */}
      <div>
        <label className="text-sm font-semibold text-brand-dark block mb-2">종류</label>
        <div className="flex flex-wrap gap-2">
          {PET_SPECIES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSpecies(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm
                          transition-all
                          ${species === s.id
                            ? 'bg-brand-primary text-white'
                            : 'bg-gray-50 text-gray-600 border border-gray-100'}`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 생년월일 */}
      <div>
        <label className="text-sm font-semibold text-brand-dark block mb-1">생년월일 (선택)</label>
        <input
          type="date"
          value={birth}
          onChange={e => setBirth(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                     text-sm focus:outline-none focus:border-brand-primary"
        />
      </div>

      {/* 체중 */}
      <div>
        <label className="text-sm font-semibold text-brand-dark block mb-1">체중 kg (선택)</label>
        <input
          type="number"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="예: 4.5"
          step="0.1"
          min="0"
          max="200"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                     text-sm focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" onClick={onCancel} variant="ghost" fullWidth>
          취소
        </Button>
        <Button type="submit" fullWidth>
          {initial?.id ? '수정 완료' : '추가하기'}
        </Button>
      </div>
    </form>
  )
}

// 반려동물 카드
function PetCard({ pet, onEdit, onDelete }) {
  const species = PET_SPECIES.find(s => s.id === pet.species) || PET_SPECIES[4]
  const age = pet.birth
    ? Math.floor((Date.now() - new Date(pet.birth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="card flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-pastel-peach flex items-center
                      justify-center text-2xl flex-shrink-0">
        {species.emoji}
      </div>
      <div className="flex-1">
        <p className="font-bold text-brand-dark">{pet.name}</p>
        <p className="text-xs text-gray-400">
          {species.label}
          {age !== null && ` · ${age}살`}
          {pet.weight && ` · ${pet.weight}kg`}
        </p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(pet)}
          className="text-xs text-gray-400 px-2 py-1.5 rounded-xl
                     hover:bg-gray-50 transition-colors"
        >
          수정
        </button>
        <button
          onClick={() => onDelete(pet)}
          className="text-xs text-red-400 px-2 py-1.5 rounded-xl
                     hover:bg-red-50 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  )
}

export default function Settings() {
  const showToast = useToast()
  const { pets, reloadPets } = usePetContext()

  const [showAdd,    setShowAdd]    = useState(false)
  const [editPet,    setEditPet]    = useState(null)
  const [deletingPet,setDeletingPet]= useState(null)
  const [notifStatus,setNotifStatus]= useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  )

  async function handleAdd(data) {
    await addPet(data)
    await reloadPets()
    setShowAdd(false)
    showToast(`${data.name}이(가) 추가됐어요! 🐾`, 'success')
  }

  async function handleEdit(data) {
    await updatePet(data)
    await reloadPets()
    setEditPet(null)
    showToast('수정됐어요!', 'success')
  }

  async function handleDelete() {
    if (!deletingPet) return
    await deletePet(deletingPet.id)
    await reloadPets()
    showToast(`${deletingPet.name} 삭제 완료`, 'info')
    setDeletingPet(null)
  }

  async function handleNotifRequest() {
    const result = await requestNotificationPermission()
    setNotifStatus(result)
    if (result === 'granted') {
      showToast('알림이 허용됐어요!', 'success')
    } else if (result === 'denied') {
      showToast('알림이 차단됐습니다. 브라우저 설정에서 허용해주세요.', 'warning')
    }
  }

  return (
    <div className="page-content">
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-brand-dark">⚙️ 설정</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* 반려동물 관리 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-brand-dark">반려동물 관리</h2>
            <Button onClick={() => setShowAdd(true)} size="sm">+ 추가</Button>
          </div>

          {pets.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-3xl mb-2">🐾</p>
              <p className="text-sm text-gray-400">등록된 반려동물이 없어요</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-3 text-sm text-brand-primary font-semibold"
              >
                첫 번째 반려동물 등록하기
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {pets.map(pet => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onEdit={setEditPet}
                  onDelete={setDeletingPet}
                />
              ))}
            </div>
          )}
        </div>

        {/* 알림 설정 */}
        <div className="card space-y-3">
          <h2 className="text-base font-bold text-brand-dark">🔔 알림 설정</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-dark">브라우저 알림</p>
              <p className="text-xs text-gray-400">
                {notifStatus === 'granted'  ? '허용됨 ✅' :
                 notifStatus === 'denied'   ? '차단됨 ❌' :
                 notifStatus === 'unsupported' ? '미지원' : '허용 안됨'}
              </p>
            </div>
            {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
              <Button onClick={handleNotifRequest} size="sm" variant="secondary">
                허용하기
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-300">
            이상 감지 알림: 오늘 배변 횟수가 평소 범위를 벗어나면 알림을 보내요.
          </p>
        </div>

        {/* 앱 정보 */}
        <div className="card space-y-1">
          <h2 className="text-base font-bold text-brand-dark mb-2">앱 정보</h2>
          <p className="text-sm text-gray-500">똥체크 (Poop Check) v1.0.0</p>
          <p className="text-xs text-gray-400">반려동물 배변 기록 & 건강 관리 앱</p>
          <p className="text-xs text-gray-400">데이터는 기기 로컬에만 저장됩니다.</p>
          <p className="text-xs text-gray-300">
            AI 분석: Pollinations.ai · 차트: Recharts · PDF: jsPDF
          </p>
        </div>
      </div>

      {/* 추가 모달 */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="반려동물 추가">
        <PetForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>

      {/* 수정 모달 */}
      <Modal isOpen={!!editPet} onClose={() => setEditPet(null)} title="반려동물 수정">
        {editPet && (
          <PetForm initial={editPet} onSave={handleEdit} onCancel={() => setEditPet(null)} />
        )}
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal isOpen={!!deletingPet} onClose={() => setDeletingPet(null)} title="삭제 확인">
        {deletingPet && (
          <div className="space-y-4">
            <p className="text-sm text-brand-dark">
              <strong>{deletingPet.name}</strong>을(를) 삭제하면 모든 기록도 함께 삭제됩니다.
              정말 삭제할까요?
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setDeletingPet(null)} variant="ghost" fullWidth>
                취소
              </Button>
              <Button onClick={handleDelete} variant="danger" fullWidth>
                삭제
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
