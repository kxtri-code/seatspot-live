"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Minus, Plus } from 'lucide-react'

// --- 1. ASSETS CONFIGURATION ---
const VIBE_ASSETS = {
  club: {
    video: "https://assets.mixkit.co/videos/preview/mixkit-crowd-dancing-at-a-concert-with-hands-up-42589-large.mp4",
    headline: "Own the Night.",
    sub: "VIP Tables & Guestlists."
  },
  cafe: {
    video: "https://assets.mixkit.co/videos/preview/mixkit-coffee-pouring-in-slow-motion-4284-large.mp4",
    headline: "Morning Brew.",
    sub: "Workspaces & Chill Spots."
  },
  dining: {
    video: "https://assets.mixkit.co/videos/preview/mixkit-friends-clinking-wine-glasses-at-a-dinner-party-4648-large.mp4",
    headline: "Fine Tastes.",
    sub: "Dates & Family Dinners."
  },
  lounge: {
    video: "https://assets.mixkit.co/videos/preview/mixkit-young-people-having-drinks-at-a-bar-4279-large.mp4",
    headline: "Just Vibe.",
    sub: "Cocktails & Conversations."
  }
}

type VibeType = keyof typeof VIBE_ASSETS;

export default function LandingPage() {
  const router = useRouter()
  const [guestCount, setGuestCount] = useState(2)
  const [selectedVibe, setSelectedVibe] = useState<VibeType>('club')
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setIsVideoLoaded(false)
    if(videoRef.current) {
        videoRef.current.load()
    }
  }, [selectedVibe])

  const handleSearch = () => {
    router.push(`/explore?vibe=${selectedVibe}&guests=${guestCount}`)
  }

  return (
    // Added padding-top (pt-20) to account for the fixed main header
    <div className="h-screen w-full bg-black font-sans relative overflow-hidden flex flex-col justify-end pt-20">
      
      {/* --- 2. DYNAMIC CINEMATIC BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-20" />
         
         {/* Added 'muted' and 'playsInline' for reliable autoplay */}
         <video 
            ref={videoRef}
            autoPlay 
            loop 
            muted 
            playsInline
            key={selectedVibe}
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 transform scale-105 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
         >
             <source src={VIBE_ASSETS[selectedVibe].video} type="video/mp4" />
         </video>
      </div>

      {/* --- 3. FLOATING UI LAYER --- */}
      <div className="relative z-30 w-full max-w-md mx-auto px-6 pb-24 flex flex-col gap-8">
          
          {/* DYNAMIC TEXT */}
          <div className="space-y-2 animate-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Dimapur Live</span>
              </div>
              <h1 className="text-6xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">
                  {VIBE_ASSETS[selectedVibe].headline}
              </h1>
              <p className="text-white/80 text-lg font-medium tracking-wide">
                  {VIBE_ASSETS[selectedVibe].sub}
              </p>
          </div>

          {/* THE "ISLAND" CONTROLLER */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-700 delay-100">
              
              {/* Vibe Tabs */}
              <div className="flex justify-between items-center p-1 bg-white/5 rounded-[2rem] mb-2 relative">
                  {(Object.keys(VIBE_ASSETS) as Array<VibeType>).map((vibe) => (
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

                  {/* The "Let's Go" Button */}
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
      {/* REMOVED: The internal header that was causing the duplicate logo */}
    </div>
  )
}