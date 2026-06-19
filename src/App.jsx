import React, { createContext, useContext, useState, useEffect, lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import { Toast } from './components/ui/Toast.jsx'
import { getAllPets } from './lib/db.js'

// 페이지 lazy loading — 초기 번들에서 제외, 라우트 방문 시 로드
const Home        = lazy(() => import('./pages/Home.jsx'))
const Record      = lazy(() => import('./pages/Record.jsx'))
const AIAnalysis  = lazy(() => import('./pages/AIAnalysis.jsx'))
const Calendar    = lazy(() => import('./pages/Calendar.jsx'))
const HealthReport = lazy(() => import('./pages/HealthReport.jsx'))
const Settings    = lazy(() => import('./pages/Settings.jsx'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-4xl animate-bounce">🐾</span>
    </div>
  )
}

// ── Global Contexts ──────────────────────────────────────────
export const PetContext = createContext(null)
export const ToastContext = createContext(null)

export function usePetContext() {
  return useContext(PetContext)
}
export function useToast() {
  return useContext(ToastContext)
}

// ── App Root ─────────────────────────────────────────────────
export default function App() {
  const [pets, setPets] = useState([])
  const [activePetId, setActivePetId] = useState(null)
  const [toast, setToast] = useState(null)

  // 반려동물 목록 로드
  useEffect(() => {
    loadPets()
  }, [])

  async function loadPets() {
    try {
      const data = await getAllPets()
      setPets(data)
      if (data.length > 0 && !activePetId) {
        setActivePetId(data[0].id)
      }
    } catch (e) {
      console.error('pets load error', e)
    }
  }

  function showToast(message, type = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const petCtx = {
    pets,
    activePetId,
    setActivePetId,
    reloadPets: loadPets,
    activePet: pets.find(p => p.id === activePetId) || null,
  }

  return (
    <ToastContext.Provider value={showToast}>
      <PetContext.Provider value={petCtx}>
        <HashRouter>
          <div className="relative min-h-screen bg-brand-light">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"         element={<Home />} />
                <Route path="/record"   element={<Record />} />
                <Route path="/ai"       element={<AIAnalysis />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/report"   element={<HealthReport />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
            <BottomNav />
            {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
          </div>
        </HashRouter>
      </PetContext.Provider>
    </ToastContext.Provider>
  )
}
