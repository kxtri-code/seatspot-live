"use client"

import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, Ticket, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  // 1. HIDE NAV ON HOME PAGE (Cinematic Mode)
  // The nav will only appear once the user enters the app (Explore, Wallet, etc.)
  if (pathname === '/') return null

  // 2. NAV ITEMS CONFIG
  const navItems = [
    { label: 'Home', icon: Home, path: '/explore' }, // 'Home' in the app context is the Explore feed
    { label: 'Map', icon: Compass, path: '/map' },   // Placeholder for Map if you have it, or remove
    { label: 'Wallet', icon: Ticket, path: '/tickets' },
    { label: 'Profile', icon: User, path: '/profile' },
  ]

  // Filter out 'Map' if you don't have that page yet, or redirect 'Home' to '/' if preferred.
  // For this flow: 'Home' -> /explore (The feed)
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 py-4 px-6 z-50 safe-area-bottom">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-blue-600/20' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}