"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Martini, Utensils, ArrowRight, Users, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VibeGate() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [vibe, setVibe] = useState('')
  const [pax, setPax] = useState(2)

  const vibes = [
    { id: 'cafe', label: 'Chill Cafe', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
    { id: 'club', label: 'Night Club', icon: Martini, color: 'bg-purple-100 text-purple-600' },
    { id: 'restaurant', label: 'Fine Dining', icon: Utensils, color: 'bg-emerald-100 text-emerald-600' },
  ]

  const handleNext = () => {
    if (step === 1 && vibe) setStep(2)
    else if (step === 2) {
      // Redirect to explorer with filters
      router.push(`/explore?vibe=${vibe}&pax=${pax}`)
    }
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-sky-300 via-sky-100 to-white overflow-hidden relative flex flex-col items-center justify-center p-6">
      
      {/* BACKGROUND CLOUDS */}
      <motion.div 
        animate={{ x: [0, 20, 0] }} 
        transition={{ repeat: Infinity, duration: 5 }} 
        className="absolute top-10 left-[-50px] opacity-60"
      >
        <Cloud className="w-32 h-32 text-white fill-white blur-xl" />
      </motion.div>
      <motion.div 
        animate={{ x: [0, -30, 0] }} 
        transition={{ repeat: Infinity, duration: 7 }} 
        className="absolute bottom-20 right-[-20px] opacity-60"
      >
        <Cloud className="w-40 h-40 text-white fill-white blur-xl" />
      </motion.div>

      {/* THE GATEWAY CARD */}
      <div className="z-10 w-full max-w-md">
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[40px] shadow-2xl shadow-sky-200/50">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Hi there. <br/> <span className="text-blue-600">What's the vibe?</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Your gateway to the city's heartbeat.</p>
          </div>

          <AnimatePresence mode='wait'>
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-4"
              >
                {vibes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVibe(v.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${vibe === v.id ? 'border-blue-500 bg-white shadow-lg scale-105' : 'border-transparent bg-white/50 hover:bg-white'}`}
                  >
                    <div className={`p-3 rounded-full ${v.color}`}>
                      <v.icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg text-slate-700">{v.label}</span>
                    {vibe === v.id && <ArrowRight className="ml-auto text-blue-500 animate-pulse"/>}
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
                className="text-center space-y-6"
              >
                 <div className="bg-white/60 rounded-3xl p-6 inline-flex flex-col items-center">
                    <Users className="w-10 h-10 text-blue-600 mb-2" />
                    <span className="text-4xl font-black text-slate-900">{pax}</span>
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-widest">Guests</span>
                 </div>

                 <div className="flex justify-center gap-4">
                    <Button onClick={() => setPax(Math.max(1, pax - 1))} variant="outline" className="w-12 h-12 rounded-full text-xl font-bold">-</Button>
                    <Button onClick={() => setPax(pax + 1)} variant="outline" className="w-12 h-12 rounded-full text-xl font-bold">+</Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            onClick={handleNext}
            disabled={!vibe}
            className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-2xl shadow-xl text-lg transition-all active:scale-95"
          >
            {step === 1 ? "Continue" : "Find My Spot"}
          </Button>

        </div>
      </div>

    </div>
  )
}