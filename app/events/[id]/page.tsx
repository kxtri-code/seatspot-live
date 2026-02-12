"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import SeatMap from "@/components/SeatMap"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from 'lucide-react'
import Link from 'next/link'

type Event = {
  id: string
  title: string
  description: string
  date: string
  image_url: string
  venue_name: string
  price_per_seat: number
  vibe_score: number
}

export default function EventPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      // Safety check: ensure ID exists
      if (!params?.id) return
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (data) setEvent(data)
      setLoading(false)
    }
    fetchEvent()
  }, [params.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Event Details...</div>
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">Event not found (ID: {params.id})</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* HERO SECTION */}
      <div className="relative h-[50vh] w-full bg-slate-900 overflow-hidden">
        <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute top-4 left-4 z-10">
            <Link href="/">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
            </Link>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-900 to-transparent p-8 pt-32">
            <div className="max-w-5xl mx-auto">
                <Badge className="mb-4 bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1">
                    {event.price_per_seat === 0 ? 'FREE ENTRY' : `$${event.price_per_seat} / SEAT`}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-6 text-slate-300 mt-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        {event.venue_name}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: Details */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                    {event.description}
                </p>
                
                {/* Vibe Meter */}
                <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-700">Vibe Check</span>
                        <span className="text-sm font-bold text-blue-600">{event.vibe_score}/100</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${event.vibe_score > 80 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-blue-500'}`} 
                            style={{ width: `${event.vibe_score}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Booking Action */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-4">
                <h3 className="text-xl font-bold mb-4">Reserve Your Spot</h3>
                <Button className="w-full bg-slate-900 text-white py-6 text-lg" onClick={() => {
                    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
                }}>
                    Select Seats
                </Button>
            </div>
        </div>
      </div>

      {/* BOOKING SECTION (The Map) */}
      <div id="booking-section" className="bg-slate-900 py-20 text-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Select Your Table</h2>
                <p className="text-slate-400 mt-2">Click a green table to book it.</p>
            </div>
            
            <div className="bg-white p-2 rounded-xl w-fit text-black shadow-2xl">
                <SeatMap />
            </div>
        </div>
      </div>

    </div>
  )
}