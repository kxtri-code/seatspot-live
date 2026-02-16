"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Minus, Plus, User, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  // Instantly pick the best background
  const activeVenue = venues.find(v => v.type === activeTab) || venues[0]
  const bgImage = activeVenue?.image_url || 'https://images.unsplash.com/photo-1566737236580-c8d48ff63aef?q=80&w=2000&auto=format&fit=crop'

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>

  return (
    <div className="relative min-h-screen w-full bg-black font-sans text-white">
      
      {/* 1. FIXED BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0">
          <img 
            src={bgImage} 
            className="w-full h-full object-cover opacity-60 transition-opacity duration-700"
            alt="Venue View"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black" />
      </div>

      {/* 2. HEADER LAYER */}
      <div className="relative z-20 flex justify-between items-center p-6 pt-12">
          <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter">SeatSpot.</span>
              <div className="flex items-center gap-1.5 mt-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 w-fit">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Dimapur Live</span>
              </div>
          </div>
          <button onClick={() => router.push(user ? '/profile' : '/login')} className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-slate-800 flex items-center justify-center">
              {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
              ) : (
                  <User className="w-5 h-5 text-slate-400" />
              )}
          </button>
      </div>

      {/* 3. CENTER TEXT LAYER */}
      <div className="relative z-10 px-6 mt-16">
          <h1 className="text-6xl font-black leading-[0.85] tracking-tighter">
              What's <br/> Your Vibe?
          </h1>
          <p className="text-lg text-slate-300 mt-5 font-medium max-w-[260px] leading-snug">
              Book exclusive tables and discover live events in Dimapur.
          </p>
      </div>

      {/* 4. BOTTOM ACTION BOX */}
      <div className="fixed bottom-10 left-0 w-full px-5 z-20">
          <div className="bg-white/10 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
              
              {/* Category Selector */}
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                  {['Club', 'Cafe', 'Dining', 'Lounge'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'bg-black/20 text-white/50'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>

              {/* Counter and Go Button */}
              <div className="flex items-center gap-3">
                  <div className="h-14 bg-black/40 rounded-full flex items-center gap-4 px-6 border border-white/5">
                      <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="text-white/50 hover:text-white"><Minus className="w-4 h-4"/></button>
                      <span className="text-white font-black text-lg w-4 text-center">{guestCount}</span>
                      <button onClick={() => setGuestCount(guestCount + 1)} className="text-white/50 hover:text-white"><Plus className="w-4 h-4"/></button>
                  </div>

                  <Button 
                    onClick={() => router.push('/explore')}
                    className="flex-1 h-14 rounded-full bg-white text-black font-black text-lg shadow-xl group"
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