"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Martini, Utensils, ArrowRight, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VibeGate() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [vibe, setVibe] = useState('')
  const [pax, setPax] = useState(2)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => { setVideoLoaded(true) }, [])

  const vibes = [
    { id: 'cafe', label: 'Chill Cafe', icon: Coffee, desc: 'Cozy vibes & good coffee' },
    { id: 'club', label: 'Night Club', icon: Martini, desc: 'High energy & beats' },
    { id: 'restaurant', label: 'Fine Dining', icon: Utensils, desc: 'Exquisite flavors' },
  ]

  const handleNext = () => {
    if (step === 1 && vibe) setStep(2)
    else if (step === 2) router.push(`/explore?vibe=${vibe}&pax=${pax}`)
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden relative flex flex-col items-center justify-center p-6 bg-black">
      
      {/* 1. BACKGROUND VIDEO (Fixed & Optimized) */}
      <div className="absolute inset-0 z-0">
        <video 
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-50' : 'opacity-0'}`}
        >
            {/* Reliable Pexels Party Loop */}
            <source src="https://videos.pexels.com/video-files/3191572/3191572-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40 backdrop-blur-[1px]" />
      </div>

      {/* 2. CONTENT */}
      <div className="z-10 w-full max-w-md relative">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[40px] shadow-2xl"
        >
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-xl">
              What's the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Vibe?</span>
            </h1>
            <p className="text-slate-300 text-sm mt-2 font-medium">Curated experiences for tonight.</p>
          </div>

          <AnimatePresence mode='wait'>
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-3"
              >
                {vibes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVibe(v.id)}
                    className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all border border-white/5 overflow-hidden
                        ${vibe === v.id ? 'bg-white/20 border-white/40 shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <div className={`p-3 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 group-hover:scale-110 transition-transform`}>
                      <v.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-lg text-white">{v.label}</span>
                        <span className="text-xs text-slate-400">{v.desc}</span>
                    </div>
                    {vibe === v.id && <ArrowRight className="ml-auto text-white animate-pulse"/>}
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8 py-4"
              >
                 <div className="space-y-2">
                     <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Party Size</p>
                     <div className="flex items-center justify-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span className="text-6xl font-black text-white">{pax}</span>
                     </div>
                 </div>

                 <div className="flex justify-center gap-6">
                    <button onClick={() => setPax(Math.max(1, pax - 1))} className="w-16 h-16 rounded-full border border-white/20 bg-white/5 text-white text-2xl font-bold hover:bg-white/20 active:scale-95 transition-all">-</button>
                    <button onClick={() => setPax(pax + 1)} className="w-16 h-16 rounded-full border border-white/20 bg-white/5 text-white text-2xl font-bold hover:bg-white/20 active:scale-95 transition-all">+</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            onClick={handleNext}
            disabled={!vibe}
            className={`w-full mt-8 h-16 rounded-2xl text-lg font-bold shadow-xl transition-all
                ${!vibe ? 'bg-white/10 text-white/50' : 'bg-white text-black hover:scale-[1.02] shadow-white/10'}`}
          >
            {step === 1 ? "Continue" : "Find My Spot"}
          </Button>

          {step === 2 && (
              <button onClick={() => setStep(1)} className="w-full text-center mt-4 text-xs text-slate-400 hover:text-white transition-colors">Go Back</button>
          )}

        </motion.div>
      </div>
    </div>
  )
}