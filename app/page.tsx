"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Minus, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Using your new component

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Club')
  const [guestCount, setGuestCount] = useState(2)
  const [venues, setVenues] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase.from('venues').select('*')
      if (data) setVenues(data)
      setLoading(false)
    }
    init()
  }, [])

  // Smart Image Selection: Default to Club, fallback to any, fallback to placeholder
  const activeVenue = venues.find(v => v.type === activeTab) || venues[0]
  const bgImage = activeVenue?.image_url || 'https://images.unsplash.com/photo-1574096079513-d82599697559?q=80&w=2000&auto=format&fit=crop' // Safe fallback

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. FULL SCREEN BACKGROUND */}
      <div className="absolute inset-0 z-0">
          <img 
            src={bgImage} 
            className="w-full h-full object-cover opacity-60 scale-105 transition-all duration-700 ease-in-out"
            alt="Background"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
      </div>

      {/* 2. HEADER (Fixed Layout) */}
      <div className="relative z-10 w-full p-6 pt-12 flex justify-between items-start">
          {/* Left: Brand */}
          <div>
              <h1 className="text-2xl font-black text-white tracking-tighter">SeatSpot.</h1>
              <div className="flex items-center gap-2 mt-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Dimapur Live</span>
              </div>
          </div>

          {/* Right: Profile Icon */}
          <div onClick={() => router.push(user ? '/profile' : '/login')} className="cursor-pointer">
              <Avatar className="w-10 h-10 border-2 border-white/20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-white/10 text-white"><User className="w-5 h-5" /></AvatarFallback>
              </Avatar>
          </div>
      </div>

      {/* 3. HERO TEXT (Centered) */}
      <div className="relative z-10 px-6 mt-12 mb-32">
          <h2 className="text-6xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-xl">
              What's <br/> Your Vibe?
          </h2>
          <p className="text-lg text-slate-300 mt-4 font-medium max-w-xs">
              Exclusive tables, guestlists, and live events in Dimapur.
          </p>
      </div>

      {/* 4. INTERACTIVE SEARCH BAR (Bottom Fixed) */}
      <div className="absolute bottom-10 left-0 w-full px-4 z-20">
          <div className="bg-white/10 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
              
              {/* Category Filter */}
              <div className="flex justify-between gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {['Club', 'Cafe', 'Dining', 'Lounge'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'bg-black/20 text-white/60 hover:bg-black/40'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>

              {/* Action Row */}
              <div className="flex items-center gap-3">
                  {/* Counter */}
                  <div className="h-14 bg-black/40 rounded-full flex items-center gap-4 px-6 border border-white/5">
                      <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="text-white/70 hover:text-white"><Minus className="w-4 h-4"/></button>
                      <span className="text-white font-black text-lg w-4 text-center">{guestCount}</span>
                      <button onClick={() => setGuestCount(guestCount + 1)} className="text-white/70 hover:text-white"><Plus className="w-4 h-4"/></button>
                  </div>

                  {/* Main Button */}
                  <Button 
                    onClick={() => router.push('/explore')}
                    className="flex-1 h-14 rounded-full bg-white text-black font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl group"
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