"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { 
  Loader2, MapPin, Star, Filter, Search, 
  Plus, Play, Flame, Music, Navigation 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ExplorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [venues, setVenues] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [vData, sData] = await Promise.all([
        supabase.from('venues').select('*').order('rating', { ascending: false }),
        supabase.from('stories').select('*, venues(name)').order('created_at', { ascending: false }).limit(10)
      ])
      
      if (vData.data) setVenues(vData.data)
      if (sData.data) setStories(sData.data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredVenues = activeCategory === 'All' 
    ? venues 
    : venues.filter(v => v.type === activeCategory)

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Vibe...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      
      {/* 1. HEADER & SEARCH */}
      <div className="bg-white p-6 pt-12 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 sticky top-0 z-30">
          <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">Explore.</h1>
              <Button variant="ghost" size="icon" className="rounded-full bg-slate-100">
                  <Filter className="w-5 h-5 text-slate-600" />
              </Button>
          </div>
          <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search clubs, cafes, events..." 
                className="pl-12 h-12 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-500"
              />
          </div>
      </div>

      {/* 2. LIVE STORIES (Horizontal Feed) */}
      <div className="mt-8">
          <h2 className="px-6 text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Live Now</h2>
          <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2">
              {/* Add Story Button */}
              <button 
                onClick={() => router.push('/stories/create')}
                className="shrink-0 w-20 flex flex-col items-center gap-2"
              >
                  <div className="w-20 h-28 rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all">
                      <Plus className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-black uppercase">Post</span>
              </button>

              {stories.map((story) => (
                  <div key={story.id} className="shrink-0 w-20 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-28 rounded-2xl bg-slate-800 border-2 border-blue-500 p-0.5 overflow-hidden">
                          <img src={story.media_url} className="w-full h-full object-cover rounded-[14px]" />
                      </div>
                      <span className="text-[10px] font-black uppercase truncate w-full text-center">{story.venues?.name}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* 3. CATEGORY TABS */}
      <div className="flex gap-2 overflow-x-auto px-6 mt-8 no-scrollbar">
          {['All', 'Club', 'Cafe', 'Dining', 'Lounge'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* 4. VENUE FEED (Cards) */}
      <div className="px-6 mt-6 space-y-6">
          {filteredVenues.map((venue) => (
              <div 
                key={venue.id} 
                onClick={() => router.push(`/venues/${venue.id}`)}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group active:scale-[0.98] transition-all cursor-pointer"
              >
                  <div className="h-64 relative overflow-hidden">
                      <img 
                        src={venue.image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={venue.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-xl">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-black text-slate-900">{venue.rating || '5.0'}</span>
                      </div>
                      <div className="absolute bottom-4 left-6">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block">
                              {venue.type}
                          </span>
                          <h3 className="text-2xl font-black text-white leading-tight">{venue.name}</h3>
                      </div>
                  </div>
                  <div className="p-6 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                          <MapPin className="w-4 h-4 text-red-500" />
                          {venue.location}
                      </div>
                      <div className="flex -space-x-2">
                          {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white" />)}
                          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">+50</div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* 5. FLOATING POST BUTTON (LIFTED FIX) */}
      {/* Changed bottom position to bottom-28 to clear the Bottom Navigation bar */}
      <div className="fixed bottom-28 right-6 z-40">
          <Button 
            onClick={() => router.push('/stories/create')}
            className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/40 flex items-center justify-center group active:scale-90 transition-all"
          >
              <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
          </Button>
      </div>

    </div>
  )
}