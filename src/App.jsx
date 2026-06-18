import React, { createContext, useContext, useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Home from './pages/Home.jsx'
import Record from './pages/Record.jsx'
import AIAnalysis from './pages/AIAnalysis.jsx'
import Calendar from './pages/Calendar.jsx'
import HealthReport from './pages/HealthReport.jsx'
import Settings from './pages/Settings.jsx'
import { Toast } from './components/ui/Toast.jsx'
import { getAllPets } from './lib/db.js'

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
            <Routes>
              <Route path="/"         element={<Home />} />
              <Route path="/record"   element={<Record />} />
              <Route path="/ai"       element={<AIAnalysis />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/report"   element={<HealthReport />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
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
