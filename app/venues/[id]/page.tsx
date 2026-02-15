"use client"

import { useEffect, useState, forwardRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  Loader2, ArrowLeft, MapPin, Star, Flame, Music, Info, 
  Minus, Plus, CheckCircle, Wallet, Navigation, Share2, Calendar,
  MessageSquare, ThumbsUp, UserCheck, X, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SeatMap from '@/components/SeatMap'
import ReviewSection from '@/components/ReviewSection'

// --- INTERNAL AVATAR COMPONENTS (Fixes Import Error) ---
const Avatar = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`} {...props} />
))
Avatar.displayName = "Avatar"

const AvatarImage = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(({ className, ...props }, ref) => (
  <img ref={ref} className={`aspect-square h-full w-full object-cover ${className || ''}`} {...props} />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold ${className || ''}`} {...props} />
))
AvatarFallback.displayName = "AvatarFallback"
// -------------------------------------------------------

export default function VenueDetails() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  // --- STATE ---
  const [venue, setVenue] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Event Drawer State
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isEventOpen, setIsEventOpen] = useState(false)
  const [eventStats, setEventStats] = useState({ going: 0, interested: 0 })
  const [userStatus, setUserStatus] = useState<string | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  
  // Booking & Wallet State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1) 
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [guestCount, setGuestCount] = useState(2)
  
  // --- INIT ---
  useEffect(() => {
    if (!id) return

    const initPage = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
        
        if (user) {
            const { data: w } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single()
            if (w) setWalletBalance(w.balance)
        }

        const { data: vData, error: vError } = await supabase.from('venues').select('*').eq('id', id).single()
        if (vError) throw vError
        setVenue(vData)

        const { data: eData } = await supabase.from('events').select('*').eq('venue_id', id).gte('date', new Date().toISOString()).order('date', { ascending: true })
        if (eData) setEvents(eData)

      } catch (err) {
        console.error("Error loading venue:", err)
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [id])

  // --- EVENT DRAWER LOGIC ---
  const openEvent = async (event: any) => {
      setSelectedEvent(event)
      setIsEventOpen(true)
      
      // Fetch Stats & User Status
      const { data: attendees } = await supabase.from('event_attendees').select('status, user_id').eq('event_id', event.id)
      if (attendees) {
          const going = attendees.filter(a => a.status === 'going').length
          const interested = attendees.filter(a => a.status === 'interested').length
          setEventStats({ going, interested })
          
          if (currentUser) {
              const myStatus = attendees.find(a => a.user_id === currentUser.id)?.status
              setUserStatus(myStatus || null)
          }
      }

      // Fetch Comments
      fetchComments(event.id)
  }

  const fetchComments = async (eventId: string) => {
      const { data } = await supabase
        .from('event_comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
      if (data) setComments(data)
  }

  const handleStatus = async (status: 'interested' | 'going' | 'not_going') => {
      if (!currentUser) return router.push('/login')
      
      // Optimistic Update
      setUserStatus(status) 
      
      const { error } = await supabase.from('event_attendees').upsert({
          event_id: selectedEvent.id,
          user_id: currentUser.id,
          status
      }, { onConflict: 'event_id, user_id' })

      if (error) alert("Error updating status")
      
      // Refresh Stats
      const { data: attendees } = await supabase.from('event_attendees').select('status').eq('event_id', selectedEvent.id)
      if(attendees) {
          setEventStats({
              going: attendees.filter(a => a.status === 'going').length,
              interested: attendees.filter(a => a.status === 'interested').length
          })
      }
  }

  const handlePostComment = async () => {
      if (!newComment.trim()) return
      if (!currentUser) return router.push('/login')

      await supabase.from('event_comments').insert({
          event_id: selectedEvent.id,
          user_id: currentUser.id,
          content: newComment
      })
      setNewComment('')
      fetchComments(selectedEvent.id)
  }

  // --- BOOKING LOGIC ---
  const handleOpenBooking = () => {
      if (!currentUser) {
          if (confirm("Login to book?")) router.push('/profile')
          return
      }
      setIsBookingOpen(true)
  }

  const handleBookingSubmit = async () => {
    if (!selectedSeat) return alert("Please select a seat!");
    setIsBookingLoading(true);
    try {
        const { error } = await supabase.rpc('book_ticket', {
            p_venue_id: venue.id,
            p_user_id: currentUser.id,
            p_seat_label: selectedSeat.label,
            p_guest_count: guestCount,
            p_guest_name: currentUser.email, 
            p_total_price: selectedSeat.price
        });
        if (error) throw error;
        setBookingStep(2); 
    } catch (err: any) { alert("Booking Failed: " + err.message); } 
    finally { setIsBookingLoading(false); }
  }

  const handleShare = () => {
      if (navigator.share) navigator.share({ title: venue.name, url: window.location.href })
      else alert("Link copied!")
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600"/></div>
  if (!venue) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans relative">
      
      {/* 1. HERO SECTION */}
      <div className="h-[60vh] relative bg-slate-900 overflow-hidden">
         <img src={venue.image_url} className="w-full h-full object-cover opacity-90 scale-105 animate-in zoom-in-50 duration-[2s]" alt={venue.name} />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
         
         <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pt-10">
             <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full w-12 h-12 bg-white/10 border-white/10 text-white backdrop-blur-md hover:bg-white/20">
                 <ArrowLeft className="w-6 h-6" />
             </Button>
             <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full w-12 h-12 bg-white/10 border-white/10 text-white backdrop-blur-md hover:bg-white/20">
                <Share2 className="w-5 h-5" />
             </Button>
         </div>

         <div className="absolute bottom-10 left-0 w-full px-6 text-white z-20">
             <div className="flex items-center gap-2 mb-4">
                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
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

      {/* 2. CONTENT CARD */}
      <div className="bg-white rounded-t-[2.5rem] -mt-8 relative z-10 min-h-screen px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          
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
                        {venue.description || "Experience the best atmosphere in town. Join us for an unforgettable night with premium service and curated vibes."}
                    </p>
                </div>
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
                    <div 
                        key={ev.id} 
                        onClick={() => openEvent(ev)} 
                        className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm items-center active:scale-95 transition-transform cursor-pointer hover:border-blue-200"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 relative">
                            {ev.image_url ? <img src={ev.image_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-slate-800"/>}
                            <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-900">
                                {new Date(ev.date).getDate()}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{ev.title}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1"><Calendar className="w-3 h-3 inline mr-1"/> {new Date(ev.date).toDateString()}</p>
                            <div className="flex gap-2 mt-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${ev.ticket_type === 'free' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {ev.ticket_type || 'Paid'}
                                </span>
                            </div>
                        </div>
                        <Button size="sm" className="rounded-full font-bold bg-slate-900 text-white">View</Button>
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

      {/* 3. BOOKING BUTTON (Floating) */}
      <div className="fixed bottom-24 md:bottom-6 left-6 right-6 z-30">
          <Button onClick={handleOpenBooking} className="w-full h-16 rounded-[2rem] bg-slate-900 text-white font-black text-lg shadow-2xl hover:scale-105 transition-all flex justify-between px-8 items-center">
              <span>Book Table</span>
              <div className="flex items-center gap-2 text-sm font-normal opacity-80">Starts at ₹500 <ArrowLeft className="w-4 h-4 rotate-180" /></div>
          </Button>
      </div>

      {/* 4. EVENT DETAILS DRAWER (NEW!) */}
      {isEventOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl h-[90vh] flex flex-col relative overflow-hidden animate-in slide-in-from-bottom duration-300">
                  
                  {/* Close Button */}
                  <button onClick={() => setIsEventOpen(false)} className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                      <X className="w-4 h-4" />
                  </button>

                  {/* Header Image */}
                  <div className="h-64 relative shrink-0">
                      <img src={selectedEvent.image_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-6">
                           <h2 className="text-3xl font-black text-slate-900 leading-none">{selectedEvent.title}</h2>
                           <p className="text-slate-500 font-bold text-sm mt-1">{new Date(selectedEvent.date).toDateString()} • {new Date(selectedEvent.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-6 pb-24">
                      
                      {/* VIBE METER */}
                      <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex-1">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vibe Meter</p>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${Math.min(100, (eventStats.going + eventStats.interested) * 5)}%` }} />
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 text-right">{eventStats.going} Going • {eventStats.interested} Interested</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                              <Flame className={`w-6 h-6 ${eventStats.going > 10 ? 'text-red-500 animate-pulse' : 'text-slate-300'}`} />
                          </div>
                      </div>

                      {/* SOCIAL ACTIONS */}
                      <div className="grid grid-cols-3 gap-3 mb-8">
                          <button onClick={() => handleStatus('interested')} className={`py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${userStatus === 'interested' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                              <Star className="w-4 h-4" /> Interested
                          </button>
                          <button onClick={() => handleStatus('going')} className={`py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${userStatus === 'going' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                              <CheckCircle className="w-4 h-4" /> Going
                          </button>
                          <button onClick={() => handleStatus('not_going')} className={`py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${userStatus === 'not_going' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                              <X className="w-4 h-4" /> Not Going
                          </button>
                      </div>

                      {/* TICKET ACTION */}
                      <div className="mb-8">
                          {selectedEvent.ticket_type === 'paid' && (
                              <Button onClick={handleOpenBooking} className="w-full h-12 bg-black text-white font-bold rounded-xl shadow-lg">
                                  Book Ticket (₹{selectedEvent.price_per_seat})
                              </Button>
                          )}
                          {selectedEvent.ticket_type === 'external' && (
                              <Button onClick={() => window.open(selectedEvent.external_url, '_blank')} className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg">
                                  Get Tickets <Share2 className="w-4 h-4 ml-2"/>
                              </Button>
                          )}
                          {selectedEvent.ticket_type === 'rsvp' && (
                              <Button onClick={() => handleStatus('going')} disabled={userStatus === 'going'} className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg">
                                  {userStatus === 'going' ? "RSVP Confirmed ✅" : "Confirm RSVP"}
                              </Button>
                          )}
                           {selectedEvent.ticket_type === 'free' && (
                              <div className="w-full h-12 bg-green-100 text-green-800 font-black rounded-xl flex items-center justify-center uppercase tracking-widest border border-green-200">
                                  Free Entry
                              </div>
                          )}
                      </div>

                      {/* COMMENTS */}
                      <div>
                          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Hype Chat</h4>
                          <div className="space-y-4 mb-4">
                              {comments.length > 0 ? comments.map(c => (
                                  <div key={c.id} className="flex gap-3">
                                      <Avatar className="w-8 h-8">
                                          <AvatarImage src={c.profiles?.avatar_url} />
                                          <AvatarFallback>U</AvatarFallback>
                                      </Avatar>
                                      <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100 flex-1">
                                          <p className="text-xs font-bold text-slate-900 mb-0.5">{c.profiles?.full_name || 'User'}</p>
                                          <p className="text-sm text-slate-600">{c.content}</p>
                                      </div>
                                  </div>
                              )) : <p className="text-sm text-slate-400 italic">No comments yet. Start the hype!</p>}
                          </div>
                          
                          <div className="flex gap-2 relative">
                              <Input 
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder="Say something..." 
                                  className="h-12 bg-slate-50 border-slate-200 rounded-xl pr-12"
                                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                              />
                              <button onClick={handlePostComment} className="absolute right-2 top-2 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                  <Send className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 5. BOOKING DRAWER (Existing Code) */}
      {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 h-[85vh] flex flex-col relative overflow-hidden">
                  
                  <div className="w-full pt-4 pb-2 bg-white z-10 flex justify-center">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                    <button onClick={() => setIsBookingOpen(false)} className="absolute top-4 right-6 text-slate-400"><X className="w-6 h-6"/></button>
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
                            <div className="mb-8"><SeatMap venueId={venue.id} onSeatSelect={setSelectedSeat} /></div>
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between mb-8">
                                <div><h4 className="font-bold text-slate-900 text-lg">Total Guests</h4><p className="text-xs text-slate-400 font-bold uppercase">Includes Entry Fee</p></div>
                                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                    <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"><Minus className="w-4 h-4 text-slate-600" /></button>
                                    <span className="font-black text-xl w-6 text-center">{guestCount}</span>
                                    <button onClick={() => setGuestCount(Math.min(10, guestCount + 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all"><Plus className="w-4 h-4 text-white" /></button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full bg-white p-6 border-t border-slate-100 z-20">
                            {selectedSeat && (
                                <div className="flex justify-between items-end mb-4 px-2">
                                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected</p><p className="text-xl font-black text-slate-900">{selectedSeat.label}</p></div>
                                    <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p><p className="text-2xl font-black text-blue-600">₹{selectedSeat.price}</p></div>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="h-14 w-14 rounded-2xl border-slate-200 p-0 flex items-center justify-center"><ArrowLeft className="w-6 h-6 text-slate-400" /></Button>
                                <Button onClick={handleBookingSubmit} disabled={!selectedSeat || isBookingLoading || selectedSeat.price > walletBalance} className={`flex-1 h-14 text-white font-bold rounded-2xl text-lg shadow-xl transition-all ${selectedSeat && selectedSeat.price > walletBalance ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-900 hover:bg-slate-800'}`}>{isBookingLoading ? <Loader2 className="animate-spin"/> : (selectedSeat && selectedSeat.price > walletBalance ? "Insufficient Funds" : "Pay & Book")}</Button>
                            </div>
                        </div>
                      </>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 px-8 animate-in zoom-in-90 duration-300">
                          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2"><CheckCircle className="w-12 h-12 text-green-600" /></div>
                          <div><h3 className="text-3xl font-black text-slate-900 mb-2">You're In!</h3><p className="text-slate-500 font-medium">Table <strong>{selectedSeat?.label}</strong> is reserved.<br/>Ticket has been added to your wallet.</p></div>
                          <Button onClick={() => router.push('/tickets')} className="w-full h-14 rounded-2xl bg-black text-white font-bold text-lg shadow-xl hover:scale-105 transition-all">Open Wallet</Button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  )
}