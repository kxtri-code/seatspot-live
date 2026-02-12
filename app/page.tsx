"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' 
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ticket, Globe, List, MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link' 

// Dynamically import the Map so it doesn't crash on server
const CityMap = dynamic(() => import('@/components/CityMap'), { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading City Map...</div>
})

// Define a loose type to prevent errors
type Event = {
  id: string
  title: string
  description: string
  date: string
  image_url: string
  venue_name: string
  price_per_seat: number
  lat: number
  lng: number
  vibe_score: number
}

export default function Home() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list') 

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true })
      if (data) setEvents(data as Event[]) 
    }
    fetchEvents()
  }, [])

  // 1. UPDATED: Map markers now link to plural /events/
  const handleMapBooking = (event: any) => {
    router.push(`/events/${event.id}`)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      
      {/* HERO SECTION */}
      <div className="relative bg-slate-900 text-white py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="relative z-10 max-w-3xl mx-auto">
            <Badge className="mb-4 bg-blue-600 hover:bg-blue-700 border-none px-3 py-1">
                LIVE IN YOUR CITY
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Find Your <span className="text-blue-500">Vibe</span>.
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Discover the hottest events, book specific tables, and skip the line.
            </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    {viewMode === 'list' ? <Ticket className="text-blue-600"/> : <Globe className="text-blue-600"/>}
                    {viewMode === 'list' ? 'Trending Events' : 'City Vibe Map'}
                </h2>
                <p className="text-slate-500 mt-1">
                    {events.length} events happening this week.
                </p>
            </div>
            
            {/* VIEW TOGGLE */}
            <div className="bg-white border rounded-lg p-1 flex gap-1 shadow-sm">
                <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    onClick={() => setViewMode('list')}
                    size="sm"
                    className={viewMode === 'list' ? "bg-slate-900 text-white" : "text-slate-600"}
                >
                    <List className="w-4 h-4 mr-2" /> List
                </Button>
                <Button 
                    variant={viewMode === 'map' ? 'default' : 'ghost'} 
                    onClick={() => setViewMode('map')}
                    size="sm"
                    className={viewMode === 'map' ? "bg-slate-900 text-white" : "text-slate-600"}
                >
                    <Globe className="w-4 h-4 mr-2" /> Map
                </Button>
            </div>
        </div>

        {/* LIST VIEW */}
        {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                    // 2. UPDATED: List cards now link to plural /events/
                    <Link href={`/events/${event.id}`} key={event.id} className="group block h-full">
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full relative">
                            {/* Image */}
                            <div className="h-56 overflow-hidden relative">
                                <img 
                                    src={event.image_url} 
                                    alt={event.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                {event.vibe_score > 80 && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                                        🔥 HOT
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-400" /> {event.venue_name}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                                        {event.price_per_seat === 0 ? 'FREE' : `$${event.price_per_seat}`}
                                    </span>
                                </div>
                                
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                                    {event.description}
                                </p>
                                
                                <Button className="w-full mt-auto bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all font-bold">
                                    View Details & Book
                                </Button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}

        {/* MAP VIEW */}
        {viewMode === 'map' && (
            <div className="animate-in fade-in zoom-in duration-300">
                <CityMap events={events} onBook={handleMapBooking} />
            </div>
        )}
      </div>

    </main>
  );
}