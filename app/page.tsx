"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Music, Coffee, Utensils, Martini } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [guestCount, setGuestCount] = useState(2)
  const [selectedVibe, setSelectedVibe] = useState('club')
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  // Vibe Options Configuration
  const vibes = [
    { id: 'club', label: 'Club', icon: <Music className="w-5 h-5"/>, desc: 'Party & Dance' },
    { id: 'cafe', label: 'Cafe', icon: <Coffee className="w-5 h-5"/>, desc: 'Chill & Work' },
    { id: 'dining', label: 'Dining', icon: <Utensils className="w-5 h-5"/>, desc: 'Food & Drinks' },
    { id: 'lounge', label: 'Lounge', icon: <Martini className="w-5 h-5"/>, desc: 'Relax & Vibe' },
  ]

  const handleSearch = () => {
    router.push(`/explore?vibe=${selectedVibe}&guests=${guestCount}`)
  }

  return (
    <div className="min-h-screen bg-black font-sans relative overflow-hidden flex flex-col justify-end pb-10">
      
      {/* BACKGROUND VIDEO */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 z-10" />
         <video 
            autoPlay 
            loop 
            muted 
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
         >
             {/* A high-quality, royalty-free nightlife/dining loop */}
             <source src="https://assets.mixkit.co/videos/preview/mixkit-friends-with-colored-lights-having-fun-at-a-party-41398-large.mp4" type="video/mp4" />
         </video>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-20 px-6 w-full max-w-md mx-auto">
          
          {/* HEADER */}
          <div className="mb-8 animate-in slide-in-from-bottom-8 duration-700">
              <h1 className="text-5xl font-black text-white leading-none mb-2 tracking-tighter">
                  What's <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                      Your Vibe?
                  </span>
              </h1>
              <p className="text-slate-300 text-lg font-medium">Tonight belongs to you.</p>
          </div>

          {/* INTERACTIVE SELECTOR CARD */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-700 delay-100">
              
              {/* 1. VIBE SELECTOR */}
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Choose Mood</label>
              <div className="grid grid-cols-4 gap-2 mb-6">
                  {vibes.map((v) => (
                      <button 
                        key={v.id}
                        onClick={() => setSelectedVibe(v.id)}
                        className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all active:scale-95 ${selectedVibe === v.id ? 'bg-white text-black shadow-lg scale-105' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}
                      >
                          {v.icon}
                          <span className="text-[10px] font-bold mt-1">{v.label}</span>
                      </button>
                  ))}
              </div>

              {/* 2. GUEST COUNTER */}
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Party Size</label>
              <div className="flex items-center justify-between bg-black/40 rounded-2xl p-2 mb-6 border border-white/5">
                  <button 
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                      -
                  </button>
                  <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-white">{guestCount}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">People</span>
                  </div>
                  <button 
                    onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                    className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors"
                  >
                      +
                  </button>
              </div>

              {/* 3. GO BUTTON */}
              <Button 
                onClick={handleSearch}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-purple-900/50 transition-all active:scale-95"
              >
                  Find Places <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
          </div>

      </div>

      {/* BOTTOM NAV (Transparent) */}
      <div className="fixed top-0 right-0 p-4 z-50">
          <Button variant="ghost" onClick={() => router.push('/profile')} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
              <span className="text-xs font-bold uppercase tracking-widest mr-2">Login</span> <Users className="w-5 h-5" />
          </Button>
      </div>

    </div>
  )
}