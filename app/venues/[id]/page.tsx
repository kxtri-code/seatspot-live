"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  Loader2, ArrowLeft, MapPin, Star, Share2, Users, MessageSquare, 
  CheckCircle, Calendar, Heart, Flame, Music, Info, Minus, Plus 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SeatMap from '@/components/SeatMap'

export default function VenueDetails() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  // --- STATE ---
  const [venue, setVenue] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  
  // Booking State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1) 
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [guestCount, setGuestCount] = useState(2) // Default to 2 guests
  
  const vibeScore = 92; 

  // --- INIT ---
  useEffect(() => {
    if (!id) return

    const initPage = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        const { data: vData, error: vError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', id)
          .single()

        if (vError) throw vError
        setVenue(vData)

        const { data: eData } = await supabase
          .from('events')
          .select('*')
          .eq('venue_id', id)
          .gte('date', new Date().toISOString()) 
        
        if (eData) setEvents(eData)

      } catch (err) {
        console.error("Error loading venue:", err)
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [id])

  const handleOpenBooking = () => {
      if (!currentUser) {
          const confirmLogin = confirm("You need to login to book a table. Go to login?")
          if (confirmLogin) router.push('/login')
          return
      }
      setIsBookingOpen(true)
  }

  const handleBookingSubmit = async () => {
    if (!selectedSeat) {
        alert("Please select a seat!");
        return;
    }

    setIsBookingLoading(true);

    try {
        const { error } = await supabase.from('tickets').insert({
            user_id: currentUser.id,
            venue_id: venue.id,
            venue_name: venue.name,
            guest_name: currentUser.email,
            guest_phone: "N/A", 
            date: new Date().toISOString(),
            admit_count: guestCount, // <--- NOW USES YOUR SELECTED COUNT
            seat_label: selectedSeat.label,
            status: 'confirmed'
        });

        if (error) throw error;
        setBookingStep(2);

    } catch (err: any) {
        alert("Booking Failed: " + err.message);
    } finally {
        setIsBookingLoading(false);
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600"/></div>

  if (!venue) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans relative">
      
      {/* HERO IMAGE */}
      <div className="h-[50vh] relative bg-slate-900">
         <img src={venue.image_url} className="w-full h-full object-cover opacity-90" alt={venue.name} />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
         
         <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
             <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full bg-black/20 border-white/10 text-white backdrop-blur-md">
                 <ArrowLeft className="w-5 h-5" />
             </Button>
         </div>

         {/* VIBE METER */}
         <div className="absolute top-20 right-4 animate-in slide-in-from-right duration-700">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col items-center gap-1 shadow-2xl">
                <div className="bg-gradient-to-t from-orange-500 to-red-500 w-8 h-8 rounded-full flex items-center justify-center animate-pulse">
                    <Flame className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-white font-black text-xs">{vibeScore}%</span>
                <span className="text-[8px] text-white/70 font-bold uppercase tracking-widest">Vibe</span>
            </div>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-6 text-white">
             <h1 className="text-4xl font-black leading-none mb-2 tracking-tight">{venue.name}</h1>
             <p className="flex items-center gap-1 text-slate-300 text-sm font-medium">
                 <MapPin className="w-4 h-4 text-red-500" /> {venue.location}
             </p>
         </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-t-[2.5rem] -mt-8 relative z-10 min-h-screen px-6 py-8">
          
          <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900">1.2k</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers</span>
              </div>
              <Button 
                onClick={() => setFollowing(!following)}
                className={`rounded-full px-8 h-12 font-bold transition-all shadow-lg ${following ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                  {following ? 'Following' : 'Follow Venue'}
              </Button>
          </div>

          <Tabs defaultValue="events" className="w-full">
            <TabsList className="w-full bg-slate-50 rounded-2xl p-1 mb-8 grid grid-cols-3">
                <TabsTrigger value="events" className="rounded-xl font-bold">Events</TabsTrigger>
                <TabsTrigger value="about" className="rounded-xl font-bold">About</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl font-bold">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 text-purple-600" />
                    <h3 className="font-black text-slate-900 text-lg">Upcoming Here</h3>
                </div>
                {events.length > 0 ? events.map(ev => (
                    <div key={ev.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm items-center active:scale-95 transition-transform">
                        <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 relative">
                            <img src={ev.image_url} className="w-full h-full object-cover"/>
                            <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-900">
                                {new Date(ev.date).getDate()}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{ev.title}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">{new Date(ev.date).toLocaleDateString()}</p>
                            <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-bold mt-2 inline-block border border-purple-100">
                                ₹{ev.price_per_seat || '500'}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-bold text-slate-500">No upcoming events listed.</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
                 <div>
                    <h3 className="font-black text-slate-900 text-lg mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500"/> The Vibe</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {venue.description || "Experience the best atmosphere in Dimapur. Perfect for friends, family, and special occasions."}
                    </p>
                </div>
            </TabsContent>

            <TabsContent value="reviews">
                 <div className="space-y-4">
                     <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                         <div className="flex justify-between mb-2">
                             <div className="font-bold text-slate-900 text-sm flex items-center gap-2">Alex K.</div>
                             <div className="flex text-yellow-400"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
                         </div>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed">"Amazing ambience and the food was top notch!"</p>
                     </div>
                 </div>
            </TabsContent>
          </Tabs>

      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 pb-8">
          <Button onClick={handleOpenBooking} className="w-full h-14 rounded-full bg-slate-900 text-white font-black text-lg shadow-xl hover:bg-slate-800 transition-all active:scale-95">
              Book Table
          </Button>
      </div>

      {/* --- REVISED BOOKING DRAWER --- */}
      {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 h-[85vh] flex flex-col relative overflow-hidden">
                  
                  {/* DRAWER HANDLE */}
                  <div className="w-full pt-4 pb-2 bg-white z-10">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />
                  </div>
                  
                  {bookingStep === 1 ? (
                      <>
                        {/* SCROLLABLE CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto px-6 pb-24">
                            <h3 className="text-2xl font-black text-slate-900 mb-1">Select Table</h3>
                            <p className="text-sm text-slate-500 mb-6">Pick your spot at {venue.name}</p>

                            {/* SEAT MAP */}
                            <div className="flex-1 min-h-[300px] mb-6">
                                <SeatMap venueId={venue.id} onSeatSelect={setSelectedSeat} />
                            </div>

                            {/* NEW: GUEST COUNTER */}
                            <div className="mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900">Total Guests</h4>
                                    <p className="text-xs text-slate-400 font-medium">Includes yourself</p>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                    <button 
                                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-90 transition-all"
                                    >
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <span className="font-black text-lg w-4 text-center">{guestCount}</span>
                                    <button 
                                        onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-90 transition-all"
                                    >
                                        <Plus className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* STICKY BOTTOM BAR (Always Visible) */}
                        <div className="absolute bottom-0 left-0 w-full bg-white p-6 border-t border-slate-100 shadow-xl z-20">
                            {selectedSeat && (
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seat</p>
                                        <p className="text-xl font-black text-slate-900">{selectedSeat.label}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                                        <p className="text-xl font-black text-blue-600">₹{selectedSeat.price}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="h-14 rounded-2xl px-6 font-bold border-slate-200">
                                    Close
                                </Button>
                                <Button 
                                    onClick={handleBookingSubmit} 
                                    disabled={!selectedSeat || isBookingLoading}
                                    className="flex-1 h-14 bg-slate-900 text-white font-bold rounded-2xl text-lg shadow-lg shadow-slate-200"
                                >
                                    {isBookingLoading ? <Loader2 className="animate-spin"/> : `Confirm Booking`}
                                </Button>
                            </div>
                        </div>
                      </>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-6">
                          <CheckCircle className="w-24 h-24 text-green-500 mx-auto animate-bounce" />
                          <h3 className="text-3xl font-black text-slate-900">All Set!</h3>
                          <p className="text-slate-500 font-medium">
                              Table <strong>{selectedSeat?.label}</strong> is reserved for <strong>{guestCount} people</strong>.
                          </p>
                          <Button 
                              onClick={() => router.push('/tickets')}
                              className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-200 mt-6"
                          >
                              Open Wallet
                          </Button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  )
}