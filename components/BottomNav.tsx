"use client"

import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, Ticket, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  // STRICT HIDE: If we are on the homepage ('/'), DO NOT RENDER.
  if (pathname === '/') return null

  const navItems = [
    { label: 'Feed', icon: Home, path: '/explore' },
    { label: 'Map', icon: Compass, path: '/map' }, 
    { label: 'Wallet', icon: Ticket, path: '/tickets' },
    { label: 'Profile', icon: User, path: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3 px-6 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 ${
                isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-blue-600/10' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}