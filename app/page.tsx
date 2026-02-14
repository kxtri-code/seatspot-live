"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { ArrowRight, Minus, Plus } from 'lucide-react'
import UserAvatar from '@/components/UserAvatar'

// --- DEFAULT ASSETS (Fallbacks) ---
const DEFAULT_ASSETS = {
  club: {
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1920&auto=format&fit=crop",
    headline: "Own the Night.",
    sub: "VIP Tables & Guestlists."
  },
  cafe: {
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1920&auto=format&fit=crop",
    headline: "Morning Brew.",
    sub: "Workspaces & Chill Spots."
  },
  dining: {
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1920&auto=format&fit=crop",
    headline: "Fine Tastes.",
    sub: "Dates & Family Dinners."
  },
  lounge: {
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1920&auto=format&fit=crop",
    headline: "Just Vibe.",
    sub: "Cocktails & Conversations."
  }
}

type VibeType = keyof typeof DEFAULT_ASSETS;

export default function LandingPage() {
  const router = useRouter()
  const [guestCount, setGuestCount] = useState(2)
  const [selectedVibe, setSelectedVibe] = useState<VibeType>('club')
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  
  // State for dynamic assets (God Mode)
  const [assets, setAssets] = useState(DEFAULT_ASSETS)

  // Fetch 'God Mode' assets from DB
  useEffect(() => {
    const loadAssets = async () => {
        const { data } = await supabase.from('cms_assets').select('*')
        if (data && data.length > 0) {
            const newAssets = { ...DEFAULT_ASSETS }
            // Map DB rows to our asset structure
            data.forEach(item => {
                // Example mapping - extend this logic as you add more CMS fields
                if (item.id === 'home_club_img') newAssets.club.image = item.content
                if (item.id === 'home_club_txt') newAssets.club.headline = item.content
                if (item.id === 'home_cafe_img') newAssets.cafe.image = item.content
                if (item.id === 'home_cafe_txt') newAssets.cafe.headline = item.content
            })
            setAssets(newAssets)
        }
    }
    loadAssets()
  }, [])

  const handleSearch = () => {
    router.push(`/explore?vibe=${selectedVibe}&guests=${guestCount}`)
  }

  return (
    <div className="h-screen w-full bg-black font-sans relative overflow-hidden flex flex-col justify-center pb-20">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
         {/* Dark Gradient Overlay for text readability */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 z-20" />
         
         <img 
            src={assets[selectedVibe].image}
            alt={selectedVibe}
            key={selectedVibe}
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 transform scale-105 ${isImageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}`}
         />
      </div>

      {/* --- FLOATING UI LAYER --- */}
      <div className="relative z-30 w-full max-w-md mx-auto px-6 flex flex-col gap-8 mt-16">
          
          {/* HEADLINES */}
          <div className="space-y-2 animate-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Dimapur Live</span>
              </div>
              <h1 className="text-6xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">
                  {assets[selectedVibe].headline}
              </h1>
              <p className="text-white/90 text-lg font-medium tracking-wide">
                  {assets[selectedVibe].sub}
              </p>
          </div>

          {/* ISLAND CONTROLLER */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-700 delay-100">
              
              {/* Vibe Tabs */}
              <div className="flex justify-between items-center p-1 bg-white/5 rounded-[2rem] mb-2 relative">
                  {(Object.keys(DEFAULT_ASSETS) as Array<VibeType>).map((vibe) => (
                      <button 
                        key={vibe}
                        onClick={() => setSelectedVibe(vibe)}
                        className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${selectedVibe === vibe ? 'bg-white text-black shadow-lg scale-105' : 'text-white/50 hover:text-white'}`}
                      >
                          {vibe}
                      </button>
                  ))}
              </div>

              {/* Action Bar */}
              <div className="flex gap-2 p-1">
                  {/* Guest Counter */}
                  <div className="flex items-center gap-3 bg-white/5 rounded-[1.8rem] px-6 w-1/3 justify-between border border-white/5">
                      <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="text-white/50 hover:text-white active:scale-90 transition-transform"><Minus className="w-5 h-5"/></button>
                      <span className="text-white font-black text-lg">{guestCount}</span>
                      <button onClick={() => setGuestCount(Math.min(10, guestCount + 1))} className="text-white/50 hover:text-white active:scale-90 transition-transform"><Plus className="w-5 h-5"/></button>
                  </div>

                  {/* Let's Go Button */}
                  <Button 
                    onClick={handleSearch}
                    className="flex-1 h-16 bg-white text-black font-black text-lg rounded-[1.8rem] hover:bg-slate-200 transition-all active:scale-95 group shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                      Let's Go 
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center ml-3 group-hover:rotate-45 transition-transform duration-300">
                          <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                  </Button>
              </div>
          </div>
      </div>
      
      {/* --- TRANSPARENT HOME HEADER --- */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
          {/* Logo - pointer-events-auto so it's clickable */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-4 h-4 bg-black rounded-full" />
            </div>
            <span className="text-white font-black text-xl tracking-tighter drop-shadow-lg">SeatSpot.</span>
          </div>
          
          {/* NEW AVATAR COMPONENT - pointer-events-auto to click */}
          <div className="pointer-events-auto">
             <UserAvatar className="w-10 h-10 border-2 border-white/20" />
          </div>
      </div>

    </div>
  )
}