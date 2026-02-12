"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Share2, ThumbsUp, ThumbsDown, Instagram, Facebook, Youtube } from 'lucide-react'

export default function EventPage() {
  const params = useParams()
  const [event, setEvent] = useState<any>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
        const { data } = await supabase.from('events').select('*').eq('id', params.id).single()
        if (data) setEvent(data)
    }
    fetchEvent()
  }, [params?.id])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Event Link Copied!")
  }

  if (!event) return <div className="p-20 text-center">Loading Event...</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HERO BANNER */}
      <div className="h-[50vh] w-full relative">
        <img src={event.image_url} className="w-full h-full object-cover" alt={event.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-8 left-6 md:left-12 text-white">
            <Badge className="bg-blue-600 mb-4 px-3 py-1 text-sm">UPCOMING</Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-2">{event.title}</h1>
            <p className="flex items-center gap-2 text-xl font-medium opacity-90">
                <MapPin className="text-blue-400" /> {event.venue_name}
            </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LEFT: DETAILS */}
            <div className="md:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black mb-4">Event Details</h3>
                    
                    <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                        {event.description || `Join us for an unforgettable night at ${event.venue_name}.`}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg">
                            <Calendar className="w-4 h-4"/> 
                            {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4 border-t border-slate-100 pt-4">
                        {event.instagram_url && <a href={event.instagram_url} target="_blank"><Instagram className="w-5 h-5 text-pink-600"/></a>}
                        {event.facebook_url && <a href={event.facebook_url} target="_blank"><Facebook className="w-5 h-5 text-blue-600"/></a>}
                        {event.youtube_url && <a href={event.youtube_url} target="_blank"><Youtube className="w-5 h-5 text-red-600"/></a>}
                    </div>
                </div>
            </div>

            {/* RIGHT: ACTION BOX */}
            <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 text-center sticky top-24">
                    <p className="text-slate-500 font-bold mb-4 uppercase text-xs tracking-widest">Are you going?</p>
                    <div className="flex gap-2 justify-center mb-6">
                        <Button 
                            onClick={() => setStatus('going')}
                            variant={status === 'going' ? 'default' : 'outline'}
                            className={`flex-1 rounded-xl ${status === 'going' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                            <ThumbsUp className="w-4 h-4 mr-2" /> I'm In
                        </Button>
                        <Button 
                            onClick={() => setStatus('not_going')}
                            variant={status === 'not_going' ? 'default' : 'outline'}
                            className="flex-1 rounded-xl"
                        >
                            <ThumbsDown className="w-4 h-4 mr-2" /> Can't Go
                        </Button>
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold text-lg shadow-lg shadow-blue-200">
                        Book Tickets
                    </Button>
                    <Button onClick={handleShare} variant="ghost" className="w-full mt-2 text-slate-400 hover:text-blue-600">
                        <Share2 className="w-4 h-4 mr-2" /> Share Event
                    </Button>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}