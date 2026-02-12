"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Instagram, Facebook, Youtube, MapPin, Star, UserPlus, Check } from 'lucide-react'
import Link from 'next/link'

export default function VenueProfile() {
  const params = useParams()
  const [venue, setVenue] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Venue
      const { data: v } = await supabase.from('venues').select('*').eq('id', params.id).single()
      if (v) setVenue(v)

      // Fetch Upcoming Events for this venue
      const { data: e } = await supabase.from('events').select('*').eq('venue_name', v?.name)
      if (e) setEvents(e)
      
      // Check if following (Dummy check for UI)
      setIsFollowing(false)
    }
    fetchData()
  }, [params?.id])

  const toggleFollow = async () => {
    setIsFollowing(!isFollowing)
    // In real app: Insert into venue_followers table
    if (!isFollowing) {
        // await supabase.from('venue_followers').insert(...)
    }
  }

  if (!venue) return <div className="p-20 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER IMAGE */}
      <div className="h-[35vh] w-full bg-slate-900 relative">
        <img src={venue.image_url} className="w-full h-full object-cover opacity-80" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
            
            {/* LEFT: INFO */}
            <div className="flex-1">
                <div className="flex gap-2 mb-4">
                    {venue.instagram && (
                        <a href={`https://instagram.com/${venue.instagram}`} target="_blank" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                            <Instagram className="w-5 h-5" />
                        </a>
                    )}
                    {venue.facebook && <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><Facebook className="w-5 h-5" /></div>}
                </div>
                
                <h1 className="text-4xl font-black text-slate-900 mb-2">{venue.name}</h1>
                <p className="flex items-center gap-1 text-slate-500 font-medium mb-6">
                    <MapPin className="w-4 h-4 text-blue-500" /> {venue.location}
                </p>
                <p className="text-slate-600 leading-relaxed text-lg">{venue.description}</p>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="flex flex-col gap-3 min-w-[200px]">
                <Button 
                    onClick={toggleFollow}
                    className={`py-6 rounded-xl font-bold text-lg transition-all ${isFollowing ? 'bg-slate-100 text-slate-900' : 'bg-blue-600 text-white'}`}
                >
                    {isFollowing ? <><Check className="w-5 h-5 mr-2" /> Following</> : <><UserPlus className="w-5 h-5 mr-2" /> Follow Venue</>}
                </Button>
                <div className="text-center text-sm text-slate-400 mt-2">
                    {venue.followers_count || 120} Followers
                </div>
            </div>
        </div>

        {/* UPCOMING EVENTS */}
        <div className="mt-12">
            <h3 className="text-2xl font-black mb-6">Upcoming Events</h3>
            {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map(event => (
                        <Link href={`/events/${event.id}`} key={event.id}>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:shadow-lg transition-all flex gap-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden">
                                    <img src={event.image_url} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{event.title}</h4>
                                    <p className="text-sm text-slate-500">{new Date(event.date).toDateString()}</p>
                                    <Badge className="mt-2 bg-blue-100 text-blue-600 hover:bg-blue-200 border-none">Book Now</Badge>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-slate-400 italic bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
                    No upcoming events listed by this venue yet.
                </div>
            )}
        </div>

      </div>
    </div>
  )
}