import React from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',         emoji: '🏠', label: '홈' },
  { to: '/record',   emoji: '✏️', label: '기록' },
  { to: '/ai',       emoji: '🤖', label: 'AI분석' },
  { to: '/calendar', emoji: '📅', label: '캘린더' },
  { to: '/report',   emoji: '📊', label: '리포트' },
  { to: '/settings', emoji: '⚙️', label: '설정' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px]
                    bg-white border-t border-gray-100 flex justify-around
                    items-center h-16 z-50 shadow-lg">
      {NAV_ITEMS.map(({ to, emoji, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all
             ${isActive
               ? 'text-brand-primary scale-110'
               : 'text-gray-400 hover:text-gray-600'}`
          }
        >
          <span className="text-xl leading-none">{emoji}</span>
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
