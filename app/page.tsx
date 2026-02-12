"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import SeatMap from "@/components/SeatMap"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Ticket } from 'lucide-react'

// Define what an Event looks like
type Event = {
  id: string
  title: string
  description: string
  date: string
  image_url: string
  venue_name: string
  price_per_seat: number
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  
  // Ref to scroll to the map when booking starts
  const mapSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch Events from Supabase
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      
      if (data) setEvents(data)
    }
    fetchEvents()
  }, [])

  const handleBookNow = (event: Event) => {
    setSelectedEvent(event)
    // Smooth scroll to the map
    setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HERO SECTION */}
      <div className="relative bg-slate-900 text-white py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight mb-4">
              Discover the <span className="text-blue-500">Vibe</span>.
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Book the best seats for the hottest events in town. Live.
            </p>
        </div>
      </div>

      {/* EVENTS GRID */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Ticket className="w-8 h-8 text-blue-600" />
            Trending Events
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
                <div key={event.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col">
                    {/* Event Image */}
                    <div className="h-48 overflow-hidden relative">
                        <img 
                            src={event.image_url} 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900">
                            {event.price_per_seat === 0 ? 'FREE ENTRY' : `$${event.price_per_seat} / Seat`}
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                            {event.title}
                        </h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                            {event.description}
                        </p>
                        
                        <div className="mt-auto space-y-3">
                            <div className="flex items-center text-sm text-slate-400 gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="flex items-center text-sm text-slate-400 gap-2">
                                <MapPin className="w-4 h-4" />
                                {event.venue_name}
                            </div>
                            
                            <Button 
                                onClick={() => handleBookNow(event)}
                                className="w-full mt-4 bg-slate-900 hover:bg-blue-600 text-white transition-colors py-6 text-lg"
                            >
                                Book Now
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* BOOKING SECTION (Hidden until an event is picked) */}
      <div ref={mapSectionRef} className="bg-slate-900 py-16 text-white min-h-screen flex flex-col items-center justify-center">
        {selectedEvent ? (
            <div className="w-full max-w-6xl px-6 flex flex-col items-center gap-8">
                <div className="text-center">
                    <Badge className="mb-4 bg-blue-600 text-white border-none px-4 py-1 text-sm">
                        NOW BOOKING
                    </Badge>
                    <h2 className="text-4xl font-bold mb-2">{selectedEvent.title}</h2>
                    <p className="text-slate-400">Select your table below to reserve your spot.</p>
                </div>

                {/* The Map Component */}
                <div className="bg-white p-2 rounded-xl w-fit">
                    <SeatMap />
                </div>
            </div>
        ) : (
            <div className="text-center text-slate-500">
                <p>Select an event above to view the seating map.</p>
            </div>
        )}
      </div>

    </main>
  );
}