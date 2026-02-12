"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' 
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Ticket, Globe, List, Search, Music, Coffee, Moon, Sun, Star } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link' 
import LiveHeatmap from '@/components/LiveHeatmap'
import VenueCard from '@/components/VenueCard'

const CityMap = dynamic(() => import('@/components/CityMap'), { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading...</div>
})

export default function Home() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list') 

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventData } = await supabase.from('events').select('*').order('date', { ascending: true })
      if (eventData) setEvents(eventData)
      const { data: venueData } = await supabase.from('venues').select('*')
      if (venueData) setVenues(venueData)
    }
    fetchData()
  }, [])

  // Filter Logic
  const filteredVenues = venues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { name: 'All', icon: Globe },
    { name: 'Rooftop', icon: Sun },
    { name: 'Club', icon: Moon },
    { name: 'Live Music', icon: Music },
    { name: 'Cafe', icon: Coffee },
  ]

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      
      {/* HERO SECTION */}
      <div className="bg-slate-900 text-white pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                DIMAPUR <span className="text-blue-500 text-stroke">AFTER DARK</span>
            </h1>
            
            {/* SEARCH BAR */}
            <div className="relative max-w-2xl mx-auto mt-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                    placeholder="Search venues, events, or vibes..." 
                    className="w-full pl-12 py-7 bg-white/10 border-white/20 text-white rounded-2xl text-lg backdrop-blur-md focus:bg-white/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* CATEGORY STRIP */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
            <Button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`rounded-full px-6 py-6 border-none shadow-lg transition-all flex items-center gap-2 font-bold ${
                    activeCategory === cat.name 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
            >
                <cat.icon className="w-4 h-4" />
                {cat.name}
            </Button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* HEATMAP SIDEBAR */}
            <div className="lg:col-span-1 space-y-6">
                <LiveHeatmap />
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl">
                    <p className="font-bold text-lg leading-tight">Nagaland's Premiere Nightlife Guide</p>
                    <p className="text-xs text-blue-100 mt-2 opacity-80">Bookings are now open for weekends.</p>
                </div>
            </div>

            {/* MAIN FEED */}
            <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        {activeCategory} Venues
                    </h2>
                    <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                        <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-slate-900 text-white' : ''}><List className="w-4 h-4 mr-2" /> List</Button>
                        <Button variant={viewMode === 'map' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('map')} className={viewMode === 'map' ? 'bg-slate-900 text-white' : ''}><Globe className="w-4 h-4 mr-2" /> Map</Button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {filteredVenues.length > 0 ? (
                            filteredVenues.map((venue) => (
                                <VenueCard key={venue.id} venue={venue} />
                            ))
                        ) : (
                            <div className="col-span-2 py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400">No venues found in this category.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <CityMap events={events} onBook={(e: any) => router.push(`/events/${e.id}`)} />
                )}
            </div>
        </div>
      </div>
    </main>
  );
}