"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  Loader2, ArrowLeft, MapPin, Star, Flame, Music, Info, 
  Minus, Plus, CheckCircle, Wallet, Navigation, Share2, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SeatMap from '@/components/SeatMap'
import ReviewSection from '@/components/ReviewSection'

export default function VenueDetails() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  // --- STATE ---
  const [venue, setVenue] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  
  // Booking & Wallet State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1) 
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [guestCount, setGuestCount] = useState(2)
  
  const vibeScore = venue?.rating ? Math.round(venue.rating * 20) : 92;

  // --- INIT ---
  useEffect(() => {
    if (!id) return

    const initPage = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
        
        // Fetch Wallet if logged in
        if (user) {
            const { data: w } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single()
            if (w) setWalletBalance(w.balance)
        }

        const { data: vData, error: vError } = await supabase.from('venues').select('*').eq('id', id).single()
        if (vError) throw vError
        setVenue(vData)

        const { data: eData } = await supabase.from('events').select('*').eq('venue_id', id).gte('date', new Date().toISOString()) 
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
          if (confirmLogin) router.push('/profile')
          return
      }
      setIsBookingOpen(true)
  }

  const handleBookingSubmit = async () => {
    if (!selectedSeat) return alert("Please select a seat!");

    setIsBookingLoading(true);

    try {
        // CALL THE SECURE SQL FUNCTION
        const { data, error } = await supabase.rpc('book_ticket', {
            p_venue_id: venue.id,
            p_user_id: currentUser.id,
            p_seat_label: selectedSeat.label,
            p_guest_count: guestCount,
            p_guest_name: currentUser.email, 
            p_total_price: selectedSeat.price
        });

        if (error) throw error;
        setBookingStep(2); 

    } catch (err: any) {
        alert("Booking Failed: " + err.message);
    } finally {
        setIsBookingLoading(false);
    }
  }

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: venue.name,
              text: `Check out ${venue.name} on SeatSpot!`,
              url: window.location.href,
          })
      } else {
          alert("Link copied to clipboard!")
      }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600"/></div>
  if (!venue) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans relative">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <div className="h-[60vh] relative bg-slate-900 overflow-hidden">
         <img src={venue.image_url} className="w-full h-full object-cover opacity-90 scale-105 animate-in zoom-in-50 duration-[2s]" alt={venue.name} />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
         
         {/* Top Nav */}
         <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pt-10">
             <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full w-12 h-12 bg-white/10 border-white/10 text-white backdrop-blur-md hover:bg-white/20">
                 <ArrowLeft className="w-6 h-6" />
             </Button>
             <div className="flex gap-3">
                <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full w-12 h-12 bg-white/10 border-white/10 text-white backdrop-blur-md hover:bg-white/20">
                    <Share2 className="w-5 h-5" />
                </Button>
             </div>
         </div>

         {/* Hero Info */}
         <div className="absolute bottom-10 left-0 w-full px-6 text-white z-20">
             <div className="flex items-center gap-2 mb-4">
                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/50">
                     {venue.type || 'Trending'}
                 </span>
                 <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400"/>
                    <span className="text-xs font-bold">{venue.rating || '4.9'}</span>
                 </div>
             </div>
             <h1 className="text-5xl font-black leading-none mb-2 tracking-tighter drop-shadow-xl">{venue.name}</h1>
             <p className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                 <MapPin className="w-4 h-4 text-red-500" /> {venue.location}
             </p>
         </div>
      </div>

      {/* 2. CONTENT CARD (Overlapping) */}
      <div className="bg-white rounded-t-[2.5rem] -mt-8 relative z-10 min-h-screen px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          
          {/* Action Row */}
          <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Vibe</span>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"/>)}
                    </div>
                    <span className="text-sm font-black text-slate-900">+120 here</span>
                  </div>
              </div>
              
              {/* GOOGLE MAPS BUTTON (NEW) */}
              {venue.google_maps_url && (
                  <Button 
                    onClick={() => window.open(venue.google_maps_url, '_blank')}
                    className="rounded-full h-12 px-6 bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 border border-slate-200 shadow-sm"
                  >
                      <Navigation className="w-4 h-4 mr-2 text-blue-600 fill-blue-600" /> Directions
                  </Button>
              )}
          </div>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full bg-slate-50 rounded-2xl p-1 mb-8 grid grid-cols-3">
                <TabsTrigger value="about" className="rounded-xl font-bold py-3">Overview</TabsTrigger>
                <TabsTrigger value="events" className="rounded-xl font-bold py-3">Events</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl font-bold py-3">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6 animate-in slide-in-from-bottom-2">
                 <div className="prose prose-slate">
                    <h3 className="font-black text-slate-900 text-xl mb-3">About the Experience</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {venue.description || "Experience the best atmosphere in town. Perfect for friends, family, and special occasions. Join us for an unforgettable night with premium service and curated vibes."}
                    </p>
                </div>
                
                {/* Amenities Grid (Static for Demo) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600"><Music className="w-5 h-5"/></div>
                        <span className="text-sm font-bold text-slate-700">Live DJ</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500"><Flame className="w-5 h-5"/></div>
                        <span className="text-sm font-bold text-slate-700">Fire Show</span>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4 animate-in slide-in-from-bottom-2">
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
                            <p className="text-xs text-slate-500 font-medium mt-1"><Calendar className="w-3 h-3 inline mr-1"/> {new Date(ev.date).toDateString()}</p>
                        </div>
                        <Button size="sm" className="rounded-full font-bold bg-black text-white">Book</Button>
                    </div>
                )) : (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Music className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-bold text-slate-500">No upcoming events.</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="reviews">
                 <div className="pb-20">
                     <ReviewSection venueId={venue.id} />
                 </div>
            </TabsContent>
          </Tabs>

      </div>

      {/* 3. FLOATING BOOKING BAR */}
      <div className="fixed bottom-6 left-6 right-6 z-40">
          <Button 
            onClick={handleOpenBooking} 
            className="w-full h-16 rounded-[2rem] bg-slate-900 text-white font-black text-lg shadow-2xl shadow-slate-900/40 hover:scale-105 transition-all flex justify-between px-8 items-center"
          >
              <span>Book Table</span>
              <div className="flex items-center gap-2 text-sm font-normal opacity-80">
                  Starts at ₹500 <ArrowLeft className="w-4 h-4 rotate-180" />
              </div>
          </Button>
      </div>

      {/* 4. BOOKING DRAWER (Glassmorphism) */}
      {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 h-[85vh] flex flex-col relative overflow-hidden">
                  
                  {/* Handle */}
                  <div className="w-full pt-4 pb-2 bg-white z-10 flex justify-center">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                  </div>
                  
                  {bookingStep === 1 ? (
                      <>
                        <div className="flex-1 overflow-y-auto px-6 pb-24">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900">Select Seats</h3>
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                    <Wallet className="w-4 h-4 text-green-600"/>
                                    <span className="text-sm font-black text-green-700">₹{walletBalance.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Seat Map */}
                            <div className="mb-8">
                                <SeatMap venueId={venue.id} onSeatSelect={setSelectedSeat} />
                            </div>

                            {/* Guest Counter */}
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Total Guests</h4>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Includes Entry Fee</p>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                    <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all">
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <span className="font-black text-xl w-6 text-center">{guestCount}</span>
                                    <button onClick={() => setGuestCount(Math.min(10, guestCount + 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all">
                                        <Plus className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Payment Bar */}
                        <div className="absolute bottom-0 left-0 w-full bg-white p-6 border-t border-slate-100 z-20">
                            {selectedSeat && (
                                <div className="flex justify-between items-end mb-4 px-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected</p>
                                        <p className="text-xl font-black text-slate-900">{selectedSeat.label}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p>
                                        <p className="text-2xl font-black text-blue-600">₹{selectedSeat.price}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="h-14 w-14 rounded-2xl border-slate-200 p-0 flex items-center justify-center">
                                    <ArrowLeft className="w-6 h-6 text-slate-400" />
                                </Button>
                                <Button 
                                    onClick={handleBookingSubmit} 
                                    disabled={!selectedSeat || isBookingLoading || selectedSeat.price > walletBalance}
                                    className={`flex-1 h-14 text-white font-bold rounded-2xl text-lg shadow-xl transition-all ${selectedSeat && selectedSeat.price > walletBalance ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                                >
                                    {isBookingLoading ? <Loader2 className="animate-spin"/> : 
                                      (selectedSeat && selectedSeat.price > walletBalance ? "Insufficient Funds" : "Pay & Book")
                                    }
                                </Button>
                            </div>
                        </div>
                      </>
                  ) : (
                      /* SUCCESS SCREEN */
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 px-8 animate-in zoom-in-90 duration-300">
                          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                              <CheckCircle className="w-12 h-12 text-green-600" />
                          </div>
                          <div>
                              <h3 className="text-3xl font-black text-slate-900 mb-2">You're In!</h3>
                              <p className="text-slate-500 font-medium">
                                  Table <strong>{selectedSeat?.label}</strong> is reserved.<br/>
                                  Ticket has been added to your wallet.
                              </p>
                          </div>
                          <Button 
                              onClick={() => router.push('/tickets')}
                              className="w-full h-14 rounded-2xl bg-black text-white font-bold text-lg shadow-xl hover:scale-105 transition-all"
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