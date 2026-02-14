"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, ArrowLeft, MapPin, Star, Share2, Users, MessageSquare, CheckCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- FALLBACK DATA (Used if DB fails) ---
const DEMO_VENUE = {
  id: 'demo',
  name: 'SkyDeck Lounge (Demo)',
  location: '4th Mile, Dimapur',
  type: 'CLUB',
  description: 'The database connection failed, but here is what the page looks like!',
  image_url: 'https://images.unsplash.com/photo-1570554886111-e811ac311232',
  rating: 4.8
}

export default function VenueDetails() {
  const params = useParams()
  const router = useRouter()
  // Robust ID check: handle if id is an array or undefined
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [venue, setVenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)

  useEffect(() => {
    if (!id) return

    const fetchVenue = async () => {
      setLoading(true)
      console.log("Attempting to fetch venue with ID:", id) // DEBUG LOG

      try {
        // 1. Try fetching from Supabase
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setVenue(data)

      } catch (err) {
        console.error("Fetch failed, loading fallback:", err)
        // 2. If it fails, load the DEMO venue so the page never 404s
        setVenue({ ...DEMO_VENUE, id: id }) 
      } finally {
        setLoading(false)
      }
    }

    fetchVenue()
  }, [id])

  if (loading) return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8"/>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Loading Venue...</p>
      </div>
  )

  if (!venue) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-black text-slate-900">Venue Not Found</h2>
        <p className="text-slate-500 mb-4">We searched for ID: {id}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans relative">
      
      {/* HERO IMAGE */}
      <div className="h-[45vh] relative bg-slate-900">
         <img src={venue.image_url} className="w-full h-full object-cover opacity-80" alt={venue.name} />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
         
         <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
             <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full bg-black/20 border-white/10 text-white backdrop-blur-md">
                 <ArrowLeft className="w-5 h-5" />
             </Button>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-6 text-white">
             <div className="flex justify-between items-end mb-2">
                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {venue.type}
                 </span>
                 <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                     <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                     <span className="text-xs font-bold">{venue.rating}</span>
                 </div>
             </div>
             <h1 className="text-3xl font-black leading-none mb-2">{venue.name}</h1>
             <p className="flex items-center gap-1 text-slate-300 text-sm font-medium">
                 <MapPin className="w-4 h-4 text-red-500" /> {venue.location}
             </p>
         </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-t-[2rem] -mt-6 relative z-10 min-h-screen px-6 py-8">
          
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full bg-slate-50 rounded-2xl p-1 mb-6 grid grid-cols-2">
                <TabsTrigger value="about" className="rounded-xl font-bold">About</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl font-bold">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
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

            <TabsContent value="reviews">
                 <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                     <p>Reviews coming soon!</p>
                 </div>
            </TabsContent>
          </Tabs>

      </div>

      {/* BOOKING BUTTON */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-slate-100 shadow-2xl z-40 pb-8">
          <Button 
            onClick={() => setIsBookingOpen(true)}
            className="w-full h-14 rounded-full bg-slate-900 text-white font-black text-lg shadow-xl hover:bg-slate-800"
          >
              Book Table
          </Button>
      </div>

      {/* BOOKING DRAWER */}
      {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                  
                  {bookingStep === 1 ? (
                      <div className="space-y-6">
                          <div>
                              <h3 className="text-xl font-black text-slate-900">Confirm Booking</h3>
                              <p className="text-sm text-slate-500">Reserve a spot at {venue.name}</p>
                          </div>
                          <Button onClick={() => setBookingStep(2)} className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl text-md">
                              Confirm & Get Ticket
                          </Button>
                      </div>
                  ) : (
                      <div className="py-10 text-center space-y-4">
                          <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                          <h3 className="text-2xl font-black text-slate-900">Success!</h3>
                          <p className="text-slate-500 text-sm">Your ticket has been generated.</p>
                          <Button variant="outline" onClick={() => { setIsBookingOpen(false); setBookingStep(1) }}>Close</Button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  )
}