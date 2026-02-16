"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, Search, MapPin, Zap, ArrowLeft, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Explore() {
  const router = useRouter()
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const { data: vData } = await supabase.from('venues').select('*').order('rating', { ascending: false })
      if (vData) setVenues(vData)
      
      const { data: sData } = await supabase.from('stories').select('*, venues(name, image_url)').order('created_at', { ascending: false }).limit(5)
      if (sData) setStories(sData)
      
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-blue-500" /></div>

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24">
      
      {/* 1. HEADER (With Back Button) */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md p-6 border-b border-slate-800">
          <div className="flex justify-between items-center mb-4">
              <div>
                  <button 
                    onClick={() => router.push('/')}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white mb-1 transition-colors"
                  >
                      <ArrowLeft className="w-3 h-3" /> Change Vibe
                  </button>
                  <h1 className="text-3xl font-black tracking-tighter">Explore</h1>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <Input 
                  placeholder="Search clubs, vibes, events..." 
                  className="h-12 pl-12 bg-slate-900 border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-blue-600 focus:ring-blue-600"
              />
          </div>
      </div>

      {/* 2. LIVE STORIES */}
      <div className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Now</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {/* Add Story Button */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                  <button className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-900 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all">
                      <Plus className="w-6 h-6" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-500">You</span>
              </div>

              {/* Stories */}
              {stories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                      <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-600 group-hover:scale-105 transition-transform">
                          <div className="w-full h-full rounded-full border-2 border-slate-950 overflow-hidden">
                              <img src={story.venues?.image_url} className="w-full h-full object-cover" />
                          </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 w-16 truncate text-center">{story.venues?.name}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* 3. FEED (Dark Cards) */}
      <div className="px-6 space-y-6">
          <h2 className="text-xl font-black">Trending Tonight</h2>
          
          {venues.map((v) => (
              <div 
                key={v.id} 
                onClick={() => router.push(`/venues/${v.id}`)}
                className="group relative h-64 rounded-[2rem] overflow-hidden cursor-pointer border border-slate-800 shadow-2xl"
              >
                  <img src={v.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-xs font-bold text-white">★ {v.rating}</span>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-6">
                      <div className="flex justify-between items-end">
                          <div>
                              <h3 className="text-2xl font-black text-white leading-none mb-2">{v.name}</h3>
                              <p className="flex items-center gap-1.5 text-slate-300 text-sm font-bold">
                                  <MapPin className="w-3.5 h-3.5 text-blue-500" /> {v.location}
                              </p>
                          </div>
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider">
                              View
                          </div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Floating Action Button (Lifted above nav) */}
      <div className="fixed bottom-24 right-6 z-40"> 
          <Button className="rounded-full h-14 w-14 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 border border-white/20 hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </Button>
      </div>

    </div>
  )
}