"use client"

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  Loader2, ArrowLeft, MapPin, Star, Heart, Share2, 
  Calendar, Users, MessageSquare, Phone, User, CheckCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- TYPES ---
type Venue = {
  id: string
  name: string
  location: string
  type: string
  description: string
  image_url: string
  rating: number
  instagram: string
}

export default function VenueDetails() {
  const { id } = useParams()
  const router = useRouter()
  
  // State
  const [venue, setVenue] = useState<Venue | null>(null)
  const [venueEvents, setVenueEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  
  // Booking State
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1) // 1=Details, 2=Confirm
  const [guestDetails, setGuestDetails] = useState({ name: '', phone: '', isForSelf: true })

  useEffect(() => {
    const fetchVenueDetails = async () => {
      setLoading(true)
      try {
        // 1. Fetch Venue Info
        const { data: vData, error: vError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', id)
          .single()

        if (vError) throw vError
        setVenue(vData)

        // 2. Fetch Events at this Venue
        const { data: eData } = await supabase
          .from('events')
          .select('*')
          .eq('venue_id', id)
          .gte('date', new Date().toISOString()) // Only future events

        if (eData) setVenueEvents(eData)

      } catch (err) {
        console.error("Error fetching venue:", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchVenueDetails()
  }, [id])

  // --- HANDLERS ---
  const handleFollow = () => {
    setFollowing(!following)
    // Here you would save to DB
  }

  const handleBookingSubmit = async () => {
    // Simulate Booking Process
    setBookingStep(3) // Loading state
    setTimeout(() => {
        alert(`Table Booked for ${guestDetails.isForSelf ? 'You' : guestDetails.name}! Ticket sent to ${guestDetails.phone || 'your phone'}.`)
        setIsBookingOpen(false)
        setBookingStep(1)
    }, 1500)
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900"/></div>

  if (!venue) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-xl font-black text-slate-900">Venue Not Found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans relative">
      
      {/* --- HERO SECTION --- */}
      <div className="h-[45vh] relative">
         <img src={venue.image_url} className="w-full h-full object-cover" alt={venue.name} />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
         
         {/* Navbar */}
         <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
             <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full bg-white/10 border-white/10 text-white backdrop-blur-md hover:bg-white/20">
                 <ArrowLeft className="w-5 h-5" />
             </Button>
             <div className="flex gap-2">
                 <Button variant="outline" size="icon" className="rounded-full bg-white/10 border-white/10 text-white backdrop-blur-md hover:bg-white/20">
                     <Share2 className="w-4 h-4" />
                 </Button>
             </div>
         </div>

         {/* Hero Content */}
         <div className="absolute bottom-0 left-0 w-full p-6 text-white">
             <div className="flex justify-between items-end mb-2">
                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {venue.type}
                 </span>
                 <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                     <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                     <span className="text-xs font-bold">{venue.rating || '4.8'}</span>
                 </div>
             </div>
             <h1 className="text-3xl font-black leading-none mb-2">{venue.name}</h1>
             <p className="flex items-center gap-1 text-slate-300 text-sm font-medium">
                 <MapPin className="w-4 h-4 text-red-500" /> {venue.location}
             </p>
         </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="bg-white rounded-t-[2rem] -mt-6 relative z-10 min-h-screen px-6 py-8">
          
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-8">
              <div className="flex -space-x-2 overflow-hidden">
                  {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                          <User className="w-4 h-4" />
                      </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center text-[10px] font-bold">
                      +42
                  </div>
              </div>
              <Button 
                onClick={handleFollow}
                variant={following ? "secondary" : "default"}
                className={`rounded-full px-6 transition-all ${following ? 'bg-slate-100 text-slate-900' : 'bg-blue-600 text-white'}`}
              >
                  {following ? 'Following' : 'Follow'}
              </Button>
          </div>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full bg-slate-50 rounded-2xl p-1 mb-6 grid grid-cols-3">
                <TabsTrigger value="about" className="rounded-xl font-bold">About</TabsTrigger>
                <TabsTrigger value="events" className="rounded-xl font-bold">Events</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl font-bold">Reviews</TabsTrigger>
            </TabsList>

            {/* TAB: ABOUT */}
            <TabsContent value="about" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                    <h3 className="font-black text-slate-900 text-lg mb-2">The Vibe</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {venue.description || "Experience the best atmosphere in Dimapur. Perfect for friends, family, and special occasions."}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Users className="w-5 h-5 text-blue-500 mb-2" />
                        <div className="text-xl font-black text-slate-900">120+</div>
                        <div className="text-xs text-slate-400 font-bold uppercase">Capacity</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <MessageSquare className="w-5 h-5 text-green-500 mb-2" />
                        <div className="text-xl font-black text-slate-900">4.8</div>
                        <div className="text-xs text-slate-400 font-bold uppercase">Service</div>
                    </div>
                </div>
            </TabsContent>

            {/* TAB: EVENTS */}
            <TabsContent value="events" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                {venueEvents.length > 0 ? venueEvents.map(ev => (
                    <div key={ev.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                        <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                            <img src={ev.image_url} className="w-full h-full object-cover"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">{ev.title}</h4>
                            <p className="text-xs text-slate-500 font-medium">{new Date(ev.date).toLocaleDateString()}</p>
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">Selling Fast</span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-slate-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-bold">No upcoming events</p>
                    </div>
                )}
            </TabsContent>

            {/* TAB: REVIEWS */}
            <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-4">
                 <div className="space-y-4">
                     {[1,2].map(i => (
                         <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="flex justify-between mb-2">
                                 <div className="font-bold text-slate-900 text-sm">Alex K.</div>
                                 <div className="flex text-yellow-400"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
                             </div>
                             <p className="text-xs text-slate-500">Amazing ambience and the food was top notch! Definitely coming back.</p>
                         </div>
                     ))}
                 </div>
            </TabsContent>
          </Tabs>

      </div>

      {/* --- STICKY BOOKING BUTTON --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-slate-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 pb-8">
          <Button 
            onClick={() => setIsBookingOpen(true)}
            className="w-full h-14 rounded-full bg-slate-900 text-white font-black text-lg shadow-xl hover:bg-slate-800"
          >
              Book a Table
          </Button>
      </div>

      {/* --- BOOKING DRAWER / MODAL --- */}
      {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                  
                  {bookingStep === 1 && (
                      <div className="space-y-6">
                          <div>
                              <h3 className="text-xl font-black text-slate-900">Book a Table</h3>
                              <p className="text-sm text-slate-500">Who is this booking for?</p>
                          </div>

                          <div className="flex gap-4">
                              <button 
                                onClick={() => setGuestDetails({...guestDetails, isForSelf: true})}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${guestDetails.isForSelf ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                              >
                                  For Me
                              </button>
                              <button 
                                onClick={() => setGuestDetails({...guestDetails, isForSelf: false})}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!guestDetails.isForSelf ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                              >
                                  For Guest
                              </button>
                          </div>

                          {!guestDetails.isForSelf && (
                              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Guest Name</label>
                                      <Input 
                                        placeholder="Enter full name" 
                                        className="bg-white"
                                        value={guestDetails.name}
                                        onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                                      />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Guest Phone</label>
                                      <Input 
                                        placeholder="+91 00000 00000" 
                                        type="tel" 
                                        className="bg-white"
                                        value={guestDetails.phone}
                                        onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                                      />
                                  </div>
                              </div>
                          )}

                          <Button onClick={handleBookingSubmit} className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl text-md">
                              Confirm Booking
                          </Button>
                      </div>
                  )}

                  {bookingStep === 3 && (
                      <div className="py-10 text-center space-y-4">
                          <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                          <h3 className="text-2xl font-black text-slate-900">Booking Confirmed!</h3>
                          <p className="text-slate-500 text-sm">
                              {guestDetails.isForSelf 
                                ? "We've sent the ticket to your wallet." 
                                : `Ticket sent to ${guestDetails.name} via SMS.`}
                          </p>
                      </div>
                  )}

                  <Button variant="ghost" className="w-full mt-2" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
              </div>
          </div>
      )}

    </div>
  )
}