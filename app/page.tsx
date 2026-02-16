"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Minus, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

// HIGH-QUALITY, TEXT-FREE BACKGROUNDS
const FALLBACK_IMAGES: Record<string, string> = {
  'Club': 'https://images.unsplash.com/photo-1574391884720-385e68339561?q=80&w=1920&auto=format&fit=crop', // Clean Crowd Shot
  'Cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1920&auto=format&fit=crop',
  'Dining': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop',
  'Lounge': 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1920&auto=format&fit=crop'
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Club')
  const [guestCount, setGuestCount] = useState(2)
  const [venues, setVenues] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      // Fetch venues to potentially use their images
      const { data } = await supabase.from('venues').select('*')
      if (data) setVenues(data)
    }
    init()
  }, [])

  // LOGIC: Prefer Database Image -> Fallback to Instant Image
  const dbVenue = venues.find(v => v.type === activeTab)
  const bgImage = dbVenue?.image_url || FALLBACK_IMAGES[activeTab]

  return (
    // CONTAINER: Fixed to viewport, no scrolling, black background
    <div className="fixed inset-0 w-full h-full bg-black font-sans text-white overflow-hidden">
      
      {/* 1. BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
          <img 
            key={activeTab} // Forces fade animation on tab change
            src={bgImage} 
            className="w-full h-full object-cover opacity-60 animate-in fade-in duration-700"
            alt={activeTab}
          />
          {/* Gradient to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black" />
      </div>

      {/* 2. HEADER LAYER (Top) */}
      <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 pt-12">
          <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter">SeatSpot.</span>
              <div className="flex items-center gap-1.5 mt-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 w-fit">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Dimapur Live</span>
              </div>
          </div>
          
          {/* Profile Button */}
          <button 
            onClick={() => router.push(user ? '/profile' : '/login')} 
            className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-slate-800 flex items-center justify-center active:scale-95 transition-transform"
          >
              {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
              ) : (
                  <User className="w-5 h-5 text-slate-400" />
              )}
          </button>
      </div>

      {/* 3. CENTER TEXT LAYER */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 pointer-events-none">
          <h1 className="text-6xl font-black leading-[0.85] tracking-tighter drop-shadow-2xl">
              What's <br/> Your Vibe?
          </h1>
          <p className="text-lg text-slate-300 mt-5 font-medium max-w-[280px] leading-snug shadow-black drop-shadow-md">
              Exclusive tables, guestlists, and live events in Dimapur.
          </p>
      </div>

      {/* 4. BOTTOM ACTION BOX (Fixed Bottom) */}
      <div className="absolute bottom-0 left-0 w-full p-6 pb-10 z-20">
          <div className="bg-white/10 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
              
              {/* Category Tabs */}
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

              {/* Counter & Action Button */}
              <div className="flex items-center gap-3">
                  <div className="h-14 bg-black/40 rounded-full flex items-center gap-4 px-6 border border-white/5">
                      <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="text-white/50 hover:text-white active:scale-75 transition-all"><Minus className="w-4 h-4"/></button>
                      <span className="text-white font-black text-lg w-4 text-center">{guestCount}</span>
                      <button onClick={() => setGuestCount(guestCount + 1)} className="text-white/50 hover:text-white active:scale-75 transition-all"><Plus className="w-4 h-4"/></button>
                  </div>

                  <Button 
                    onClick={() => router.push('/explore')}
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