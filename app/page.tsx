"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { ArrowRight, Minus, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// PREMIUM TEXT-FREE WALLPAPERS
const BACKGROUNDS: Record<string, string> = {
  'Club': 'https://images.unsplash.com/photo-1566737236580-c8d48ff63aef?q=80&w=1920&auto=format&fit=crop', 
  'Cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1920&auto=format&fit=crop',
  'Dining': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1920&auto=format&fit=crop',
  'Lounge': 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1920&auto=format&fit=crop'
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Club')
  const [guestCount, setGuestCount] = useState(2)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black font-sans text-white overflow-hidden">
      
      {/* 1. BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
          <img 
            key={activeTab} 
            src={BACKGROUNDS[activeTab]} 
            className="w-full h-full object-cover opacity-60 animate-in fade-in duration-1000"
            alt={activeTab}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </div>

      {/* 2. HEADER */}
      <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 pt-12">
          <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter">SeatSpot.</span>
              <div className="flex items-center gap-1.5 mt-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 w-fit">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Dimapur Live</span>
              </div>
          </div>
          
          <div onClick={() => router.push(user ? '/profile' : '/login')} className="cursor-pointer">
              <Avatar className="w-10 h-10 border-2 border-white/20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-slate-800 text-white"><User className="w-5 h-5"/></AvatarFallback>
              </Avatar>
          </div>
      </div>

      {/* 3. HERO TEXT */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 pointer-events-none">
          <h1 className="text-6xl font-black leading-[0.85] tracking-tighter drop-shadow-2xl">
              What's <br/> Your Vibe?
          </h1>
          <p className="text-lg text-slate-300 mt-5 font-medium max-w-[280px] leading-snug">
              Find the perfect {activeTab.toLowerCase()} for tonight.
          </p>
      </div>

      {/* 4. CONTROLS */}
      <div className="absolute bottom-0 left-0 w-full p-6 pb-10 z-20">
          <div className="bg-white/10 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
              
              {/* Vibe Selector */}
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                  {['Club', 'Cafe', 'Dining', 'Lounge'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black shadow-lg scale-105' : 'bg-black/20 text-white/50'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-3">
                  <div className="h-14 bg-black/40 rounded-full flex items-center gap-4 px-6 border border-white/5">
                      <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="text-white/50 hover:text-white"><Minus className="w-4 h-4"/></button>
                      <span className="text-white font-black text-lg w-4 text-center">{guestCount}</span>
                      <button onClick={() => setGuestCount(guestCount + 1)} className="text-white/50 hover:text-white"><Plus className="w-4 h-4"/></button>
                  </div>

                  <Button 
                    onClick={() => router.push(`/explore?category=${activeTab}&guests=${guestCount}`)}
                    className="flex-1 h-14 rounded-full bg-white text-black font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all group"
                  >
                      Let's Go 
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </div>
          </div>
      </div>
    </div>
  )
}