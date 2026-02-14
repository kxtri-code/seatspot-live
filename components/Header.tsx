"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export default function Header() {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 h-16 flex items-center justify-between">
      {/* LOGO */}
      <div 
        onClick={() => router.push('/')}
        className="font-black text-xl text-slate-900 tracking-tighter cursor-pointer flex items-center gap-1"
      >
        <div className="w-2 h-2 bg-blue-600 rounded-full" />
        SeatSpot.
      </div>

      {/* DESKTOP NAV (Hidden on Mobile) */}
      <nav className="hidden md:flex items-center gap-8">
        <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Home</button>
        <button onClick={() => router.push('/explore')} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Explore</button>
        <button onClick={() => router.push('/tickets')} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Wallet</button>
      </nav>

      {/* PROFILE BUTTON */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.push('/profile')}
        className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 hover:bg-slate-100"
      >
        <User className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Login</span>
      </Button>

      {/* MOBILE PLACEHOLDER (Just to balance the logo) */}
      <div className="md:hidden w-8" />
    </header>
  )
}