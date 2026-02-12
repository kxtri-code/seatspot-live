"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import SeatMap from "@/components/SeatMap"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Ticket, Globe, List } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the Map so it doesn't crash on server
const CityMap = dynamic(() => import('@/components/CityMap'), { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
})

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
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list') // TOGGLE STATE
  const mapSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true })
      if (data) setEvents(data)
    }
    fetchEvents()
  }, [])

  const handleBookNow = (event: Event) => {
    setSelectedEvent(event)
    setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HERO */}
      <div className="relative bg-slate-900 text-white py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight mb-4">
              Discover the <span className="text-blue-500">Vibe</span>.
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Find the hottest events in the city. Live.
            </p>
        </div>
      </div>

      {/* VIEW TOGGLE & CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-2">
                {viewMode === 'list' ? <Ticket className="text-blue-600"/> : <Globe className="text-blue-600"/>}
                {viewMode === 'list' ? 'Trending Events' : 'City Vibe Map'}
            </h2>
            
            {/* THE TOGGLE BUTTONS */}
            <div className="bg-white border rounded-lg p-1 flex gap-1 shadow-sm">
                <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    onClick={() => setViewMode('list')}
                    size="sm"
                >
                    <List className="w-4 h-4 mr-2" /> List
                </Button>
                <Button 
                    variant={viewMode === 'map' ? 'default' : 'ghost'} 
                    onClick={() => setViewMode('map')}
                    size="sm"
                >
                    <Globe className="w-4 h-4 mr-2" /> Map
                </Button>
            </div>
        </div>

        {/* LIST VIEW */}
        {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                    <div key={event.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 overflow-hidden flex flex-col">
                        <div className="h-48 overflow-hidden relative">
                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {event.vibe_score > 80 && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    🔥 HOT VIBE
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{event.description}</p>
                            <Button onClick={() => handleBookNow(event)} className="w-full mt-auto bg-slate-900 text-white">Book Now</Button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* MAP VIEW */}
        {viewMode === 'map' && (
            <CityMap events={events} onBook={handleBookNow} />
        )}
      </div>

      {/* BOOKING SECTION */}
      <div ref={mapSectionRef} className="bg-slate-900 py-16 text-white min-h-screen flex flex-col items-center justify-center">
        {selectedEvent ? (
            <div className="w-full max-w-6xl px-6 flex flex-col items-center gap-8">
                <div className="text-center">
                    <Badge className="mb-4 bg-blue-600 text-white border-none px-4 py-1 text-sm">BOOKING</Badge>
                    <h2 className="text-4xl font-bold mb-2">{selectedEvent.title}</h2>
                    <p className="text-slate-400">Select your table below.</p>
                </div>
                <div className="bg-white p-2 rounded-xl w-fit text-black">
                    <SeatMap />
                </div>
            </div>
        ) : (
            <div className="text-center text-slate-500"><p>Select an event to view seating.</p></div>
        )}
      </div>
    </main>
  );
}