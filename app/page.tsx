"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Minus, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Club')
  const [guestCount, setGuestCount] = useState(2)
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVenues() {
      const { data } = await supabase.from('venues').select('*')
      if (data) setVenues(data)
      setLoading(false)
    }
    loadVenues()
  }, [])

  // Find image for active tab - Defaults to the first Club found instantly
  const activeVenue = venues.find(v => v.type === activeTab) || venues.find(v => v.type === 'Club') || venues[0]

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. FULL SCREEN BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
          <img 
            src={activeVenue?.image_url} 
            className="w-full h-full object-cover opacity-60 scale-105 transition-all duration-1000"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
      </div>

      {/* 2. TOP LOGO & HEADER */}
      <div className="relative z-10 p-8 pt-12">
          <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">Dimapur Live</span>
          </div>
          <h1 className="text-7xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">
              Own the <br/> Night.
          </h1>
          <p className="text-xl text-white/70 mt-4 font-bold tracking-tight">VIP Tables & Guestlists.</p>
      </div>

      {/* 3. INTERACTIVE SEARCH BAR (Floating) */}
      <div className="absolute bottom-12 left-0 w-full px-6 z-20">
          <div className="bg-black/40 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
              
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {['Club', 'Cafe', 'Dining', 'Lounge'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-full text-xs font-black uppercase transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>

              {/* Guest Count & Let's Go */}
              <div className="flex items-center gap-4 mt-2">
                  <div className="bg-white/10 rounded-full flex items-center gap-5 p-2 px-6 border border-white/10">
                      <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="text-white hover:text-blue-400"><Minus className="w-4 h-4"/></button>
                      <span className="text-white font-black text-xl w-4 text-center">{guestCount}</span>
                      <button onClick={() => setGuestCount(guestCount + 1)} className="text-white hover:text-blue-400"><Plus className="w-4 h-4"/></button>
                  </div>

                  <Button 
                    onClick={() => router.push('/explore')}
                    className="flex-1 h-14 rounded-full bg-white text-black font-black text-lg hover:scale-[1.02] transition-transform active:scale-95 group"
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