"use client"

import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, Ticket, User } from 'lucide-react'

export default function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on specific pages if needed (e.g., login)
  if (pathname === '/login') return null

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Explore', icon: Compass, path: '/explore' },
    { label: 'Wallet', icon: Ticket, path: '/tickets' },
    { label: 'Profile', icon: User, path: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white border-t border-slate-100 md:hidden px-6 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path
        return (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-blue-100' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}