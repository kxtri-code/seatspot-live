"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Info, Phone, ArrowLeft, Send, User, Navigation, Instagram, Facebook, Check, UserPlus, Ticket } from 'lucide-react'
import Link from 'next/link'
import SeatMap from '@/components/SeatMap' // Import the new map

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

  const openMaps = () => {
    if (venue.google_maps_link && venue.google_maps_link.length > 5) {
        window.open(venue.google_maps_link, '_blank')
    } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + venue.location)}`, '_blank')
    }
  }

  const scrollToBooking = () => {
    document.getElementById('live-seating')?.scrollIntoView({ behavior: 'smooth' })
  }

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Venue...</div>
  if (!venue) return <div className="min-h-screen flex items-center justify-center">Venue not found</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-32"> {/* Extra padding for mobile bottom bar */}
      
      {/* HERO SECTION */}
      <div className="relative h-[35vh] md:h-[45vh] w-full bg-slate-900">
        <img src={venue.image_url} className="w-full h-full object-cover opacity-70" alt={venue.name} />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/">
            <Button size="icon" variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/40 rounded-full h-10 w-10 backdrop-blur-md">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-slate-100">
          
          {/* HEADER INFO */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div className="flex-1 w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex gap-2 mb-3">
                            {venue.instagram && (
                                <a href={`https://instagram.com/${venue.instagram.replace('@','')}`} target="_blank" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 leading-tight">{venue.name}</h1>
                        <p className="flex items-center gap-1 text-slate-500 font-medium text-sm md:text-base">
                            <MapPin className="w-4 h-4 text-blue-500" /> {venue.location}
                        </p>
                    </div>
                    
                    {/* RATING BADGE (Mobile optimized) */}
                    <div className="flex flex-col items-center bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-1">
                            <span className="font-black text-xl text-slate-900">{venue.rating || 4.8}</span>
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Rating</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 pt-6 border-t border-slate-100">
            
            {/* LEFT COLUMN: MAIN CONTENT */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* LIVE SEATING MAP */}
              <section id="live-seating" className="scroll-mt-24">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Ticket className="text-green-600 w-5 h-5" /> Live Floor Plan
                    </h3>
                    <Badge variant="outline" className="border-green-500 text-green-600 animate-pulse">LIVE</Badge>
                 </div>
                 {/* The Venue-Specific Seat Map */}
                 <SeatMap venueId={venue.id} />
              </section>

              {/* ABOUT */}
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900"><Info className="text-blue-500 w-5 h-5" /> About</h3>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg">{venue.description || "Experience the best vibes in town. Good food, great music, and unforgettable memories."}</p>
              </section>

              {/* EVENTS */}
               <section>
                <h3 className="text-xl font-bold mb-4 text-slate-900">Upcoming Events</h3>
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {events.map(event => (
                            <Link href={`/events/${event.id}`} key={event.id}>
                                <div className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all flex gap-3 cursor-pointer group h-full">
                                    <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                        <img src={event.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex flex-col justify-between py-1">
                                        <div>
                                            <h4 className="font-bold text-base leading-tight line-clamp-1">{event.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(event.date).toDateString()}</p>
                                        </div>
                                        <div className="text-xs font-bold text-blue-600">View Details →</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : <p className="text-slate-400 italic bg-slate-50 p-6 rounded-2xl text-center">No upcoming events scheduled.</p>}
              </section>
              
              {/* REVIEWS */}
              <section>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Fan Reviews</h3>
                <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex gap-3">
                    <Input placeholder="Share your experience..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="bg-white border-slate-200"/>
                    <Button onClick={postReview} className="bg-blue-600 text-white hover:bg-blue-700"><Send className="w-4 h-4"/></Button>
                </div>
                <div className="space-y-4">
                    {reviews.map((r, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl flex gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0"><User className="w-5 h-5 text-slate-400" /></div>
                            <div>
                                <span className="font-bold text-sm text-slate-900">{r.user_email?.split('@')[0]}</span>
                                <p className="text-slate-600 text-sm mt-1">{r.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: STICKY BOOKING CARD (Desktop) */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-24">
                <h4 className="font-bold text-lg mb-4 border-b border-white/10 pb-4">Plan Your Visit</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-xl">
                    <Phone className="w-4 h-4 text-blue-400" /> 
                    <span>+91 98765 43210</span>
                  </div>
                  
                  {/* HIGH CONTRAST DIRECTIONS BUTTON */}
                  <Button 
                    onClick={openMaps} 
                    className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold flex gap-2 h-12 rounded-xl"
                  >
                    <Navigation className="w-4 h-4" /> Get Directions
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <Button 
                        onClick={scrollToBooking} 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 text-lg rounded-xl shadow-lg shadow-blue-900/50"
                    >
                        Book a Table
                    </Button>
                    <p className="text-center text-xs text-slate-500 mt-3">Instant confirmation • No booking fees</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR (Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 lg:hidden z-50 flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
         <Button 
            onClick={openMaps} 
            variant="outline" 
            className="flex-1 border-slate-300 text-slate-700 font-bold h-12 rounded-xl"
         >
            <Navigation className="w-4 h-4 mr-2" /> Map
         </Button>
         <Button 
            onClick={scrollToBooking} 
            className="flex-[2] bg-blue-600 text-white font-black h-12 rounded-xl hover:bg-blue-700"
         >
            Book Table
         </Button>
      </div>

    </div>
  )
}