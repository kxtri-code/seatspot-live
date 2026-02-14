"use client"

import { useRouter } from 'next/navigation'
import UserAvatar from '@/components/UserAvatar' // Import the new component

export default function Header() {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 h-16 flex items-center justify-between">
      {/* LOGO */}
      <div 
        onClick={() => router.push('/')}
        className="font-black text-xl text-slate-900 tracking-tighter cursor-pointer flex items-center gap-1"
      >
        <div className="w-2 h-2 bg-blue-600 rounded-full" />
        SeatSpot.
      </div>

      {/* DESKTOP NAV */}
      <nav className="hidden md:flex items-center gap-8">
        <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Home</button>
        <button onClick={() => router.push('/explore')} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Explore</button>
        <button onClick={() => router.push('/tickets')} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Wallet</button>
      </nav>

      {/* NEW: PROFILE AVATAR (Top Right) */}
      <div className="flex items-center gap-4">
        <UserAvatar className="w-9 h-9" />
      </div>
    </header>
  )
}