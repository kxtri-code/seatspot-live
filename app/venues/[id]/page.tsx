"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Info, Phone, ArrowLeft, Send, User, Navigation, Instagram, Facebook, Check, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function VenueProfile() {
  const params = useParams()
  const [venue, setVenue] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) return
      
      const { data: v } = await supabase.from('venues').select('*').eq('id', params.id).single()
      if (v) setVenue(v)

      const { data: r } = await supabase.from('reviews').select('*').eq('venue_id', params.id).order('created_at', { ascending: false })
      if (r) setReviews(r)

      const { data: e } = await supabase.from('events').select('*').eq('venue_name', v?.name)
      if (e) setEvents(e)
      
      setLoading(false)
    }
    fetchData()
  }, [params?.id])

  // SMART DIRECTIONS LOGIC
  const openMaps = () => {
    if (venue.google_maps_link && venue.google_maps_link.length > 5) {
        window.open(venue.google_maps_link, '_blank')
    } else if (venue.lat && venue.lng) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`, '_blank')
    } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + venue.location)}`, '_blank')
    }
  }

  const toggleFollow = () => setIsFollowing(!isFollowing)

  const postReview = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert("Please login to review!")

    const review = {
        venue_id: params.id,
        user_email: session.user.email,
        rating: 5,
        comment: newComment
    }

    const { error } = await supabase.from('reviews').insert([review])
    if (!error) {
        setReviews([review, ...reviews])
        setNewComment('')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>
  if (!venue) return <div className="min-h-screen flex items-center justify-center">Venue not found</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER IMAGE */}
      <div className="relative h-[40vh] w-full bg-slate-900">
        <img src={venue.image_url} className="w-full h-full object-cover opacity-80" alt={venue.name} />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/">
            <Button variant="outline" className="bg-white/20 text-white backdrop-blur-md border-white/30 hover:bg-white/40">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div className="flex-1">
                <div className="flex gap-2 mb-4">
                    {venue.instagram && (
                        <a href={`https://instagram.com/${venue.instagram.replace('@','')}`} target="_blank" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100">
                            <Instagram className="w-5 h-5" />
                        </a>
                    )}
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">{venue.name}</h1>
                <p className="flex items-center gap-1 text-slate-500 font-medium">
                    <MapPin className="w-4 h-4 text-blue-500" /> {venue.location}
                </p>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[180px]">
                 <Button onClick={toggleFollow} className={`py-6 rounded-xl font-bold text-lg ${isFollowing ? 'bg-slate-100 text-slate-900' : 'bg-blue-600 text-white'}`}>
                    {isFollowing ? <><Check className="w-5 h-5 mr-2" /> Following</> : <><UserPlus className="w-5 h-5 mr-2" /> Follow</>}
                </Button>
                <div className="text-center bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100 inline-flex mx-auto">
                    <span className="font-black text-slate-900">{venue.rating || 4.5}</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-1"/>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-slate-100">
            <div className="md:col-span-2 space-y-10">
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900"><Info className="text-blue-500 w-5 h-5" /> About</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{venue.description || "No description available."}</p>
              </section>

               <section>
                <h3 className="text-xl font-bold mb-4 text-slate-900">Upcoming Events</h3>
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {events.map(event => (
                            <Link href={`/events/${event.id}`} key={event.id}>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex gap-4 cursor-pointer">
                                    <div className="w-20 h-20 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                                        <img src={event.image_url} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{event.title}</h4>
                                        <p className="text-sm text-slate-500">{new Date(event.date).toDateString()}</p>
                                        <Badge className="mt-2 bg-blue-600">View Event</Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : <p className="text-slate-400 italic">No upcoming events.</p>}
              </section>
              
              <section>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Fan Reviews</h3>
                <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex gap-3">
                    <Input placeholder="Share your experience..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="bg-white border-slate-200"/>
                    <Button onClick={postReview} className="bg-blue-600 text-white"><Send className="w-4 h-4"/></Button>
                </div>
                <div className="space-y-4">
                    {reviews.map((r, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl flex gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-slate-400" /></div>
                            <div>
                                <span className="font-bold text-sm text-slate-900">{r.user_email?.split('@')[0]}</span>
                                <p className="text-slate-600 text-sm">{r.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-24">
                <h4 className="font-bold text-lg mb-4 border-b border-white/10 pb-2">Reserve Table</h4>
                <div className="space-y-4">
                  <p className="flex items-center gap-3 text-sm text-slate-300"><Phone className="w-4 h-4 text-blue-400" /> +91 98765 43210</p>
                  <Button onClick={openMaps} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 flex gap-2">
                    <Navigation className="w-4 h-4 text-blue-400" /> Get Directions
                  </Button>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">Book Now</Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}