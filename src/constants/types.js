// 배변 유형 상수
export const RECORD_TYPES = {
  POOP:    { id: 'poop',    label: '대변',    emoji: '💩', color: '#C8A882' },
  PEE:     { id: 'pee',     label: '소변',    emoji: '💧', color: '#87CEEB' },
  VOMIT:   { id: 'vomit',   label: '구토',    emoji: '🤢', color: '#90EE90' },
  MEAL:    { id: 'meal',    label: '식사',    emoji: '🍽️', color: '#FFB347' },
  MEDICINE:{ id: 'medicine',label: '약복용',  emoji: '💊', color: '#DDA0DD' },
}

// AI 분석 상태
export const POOP_STATUS = {
  NORMAL:       { id: 'normal',       label: '정상',    emoji: '✅', color: '#4CAF50' },
  SOFT:         { id: 'soft',         label: '묽음',    emoji: '⚠️', color: '#FFC107' },
  DIARRHEA:     { id: 'diarrhea',     label: '설사',    emoji: '🚨', color: '#F44336' },
  CONSTIPATION: { id: 'constipation', label: '변비',    emoji: '😣', color: '#FF9800' },
  BLOOD:        { id: 'blood',        label: '혈변',    emoji: '🔴', color: '#B71C1C' },
  UNKNOWN:      { id: 'unknown',      label: '분석불가', emoji: '❓', color: '#9E9E9E' },
}

// 반려동물 종류
export const PET_SPECIES = [
  { id: 'dog',    label: '강아지', emoji: '🐶' },
  { id: 'cat',    label: '고양이', emoji: '🐱' },
  { id: 'rabbit', label: '토끼',   emoji: '🐰' },
  { id: 'hamster',label: '햄스터', emoji: '🐹' },
  { id: 'other',  label: '기타',   emoji: '🐾' },
]

// 요일
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
