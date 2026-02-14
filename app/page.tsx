"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, MapPin, Music, Coffee, Utensils } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      
      {/* HERO SECTION */}
      <div className="relative h-[65vh] overflow-hidden rounded-b-[3rem] bg-slate-900">
        <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt="Nightlife"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 pb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <MapPin className="w-3 h-3 text-red-400" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Dimapur, NL</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-none mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                Find Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Vibe Tonight.</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                Book tables at the hottest cafes, clubs, and lounges in seconds.
            </p>
            <Button 
                onClick={() => router.push('/explore')}
                className="h-14 px-8 rounded-full bg-white text-slate-900 font-black text-lg hover:bg-slate-100 transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 shadow-xl shadow-white/10"
            >
                Start Exploring <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
      </div>

      {/* QUICK CATEGORIES */}
      <div className="p-8 pb-20">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              Browse by Mood
          </h2>
          <div className="grid grid-cols-2 gap-4">
              <div onClick={() => router.push('/explore?vibe=cafe')} className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 cursor-pointer active:scale-95 transition-transform">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                      <Coffee className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Cafes</h3>
                  <p className="text-xs text-slate-500 font-medium">Chill & Work</p>
              </div>
              <div onClick={() => router.push('/explore?vibe=club')} className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 cursor-pointer active:scale-95 transition-transform">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <Music className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Clubs</h3>
                  <p className="text-xs text-slate-500 font-medium">Party Hard</p>
              </div>
              <div onClick={() => router.push('/explore?vibe=restaurant')} className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 col-span-2 cursor-pointer active:scale-95 transition-transform flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Fine Dining</h3>
                    <p className="text-xs text-slate-500 font-medium">Dates & Family</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-blue-600" />
                  </div>
              </div>
          </div>
      </div>

      {/* BOTTOM NAV (Simple) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 flex justify-around items-center z-50 pb-6">
          <Button variant="ghost" onClick={() => router.push('/')} className="flex flex-col items-center gap-1 h-auto py-2 text-slate-900">
              <div className="w-1 h-1 bg-slate-900 rounded-full mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
          </Button>
          <Button variant="ghost" onClick={() => router.push('/tickets')} className="flex flex-col items-center gap-1 h-auto py-2 text-slate-400 hover:text-slate-900">
              <span className="text-[10px] font-bold uppercase tracking-widest">Wallet</span>
          </Button>
          <Button variant="ghost" onClick={() => router.push('/profile')} className="flex flex-col items-center gap-1 h-auto py-2 text-slate-400 hover:text-slate-900">
              <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
          </Button>
      </div>

    </div>
  )
}