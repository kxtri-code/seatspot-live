"use client"

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SeatMap from '@/components/SeatMap'

// --- BACKUP DATA (Must match Explore Page) ---
const BACKUP_VENUES: any = {
  'demo-1': {
    id: 'demo-1',
    name: 'SkyDeck Lounge',
    location: '4th Mile, Dimapur',
    type: 'club',
    description: 'The city’s best rooftop view with weekend DJ sets. Experience high life with premium cocktails and sunset views.',
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2'
  },
  'demo-2': {
    id: 'demo-2',
    name: 'The Beanery',
    location: 'Circular Road',
    type: 'cafe',
    description: 'Artisanal coffee and the best cheesecake in town. A quiet place to work or chill with friends.',
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'
  },
  'demo-3': {
    id: 'demo-3',
    name: 'Saffron & Spice',
    location: 'Duncan Basti',
    type: 'restaurant',
    description: 'Authentic fusion cuisine in a fine-dining setting. Perfect for family dinners and dates.',
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'
  }
}

export default function VenueDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenue = async () => {
      setLoading(true)

      // 1. CHECK IF IT IS A DEMO ID
      // @ts-ignore
      if (id && id.toString().startsWith('demo-')) {
          console.log("Loading Demo Venue...")
          // @ts-ignore
          setVenue(BACKUP_VENUES[id])
          setLoading(false)
          return
      }

      // 2. IF REAL ID, FETCH FROM DB
      try {
        const { data, error } = await supabase.from('venues').select('*').eq('id', id).single()
        if (error) throw error
        setVenue(data)
      } catch (err) {
        console.error("Venue Fetch Error:", err)
        // Fallback: If DB fails, just load SkyDeck as a safety net
        setVenue(BACKUP_VENUES['demo-1']) 
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchVenue()
  }, [id])

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600"/></div>

  if (!venue) return (
    <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">Venue not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* HERO IMAGE */}
      <div className="h-[40vh] relative">
         <img src={venue.image_url} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
         
         <div className="absolute top-4 left-4 z-10">
             <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full bg-white/20 border-white/20 text-white backdrop-blur-md hover:bg-white/40">
                 <ArrowLeft />
             </Button>
         </div>

         <div className="absolute bottom-0 left-0 p-6 text-white w-full">
             <div className="flex justify-between items-end">
                 <div>
                    <h1 className="text-3xl font-black">{venue.name}</h1>
                    <p className="flex items-center gap-2 text-slate-200 mt-1">
                        <MapPin className="w-4 h-4 text-yellow-400" /> {venue.location}
                    </p>
                 </div>
                 <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1 font-bold">
                     <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {venue.rating}
                 </div>
             </div>
         </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 -mt-6 rounded-t-3xl bg-slate-50 relative z-10 space-y-6">
          
          <div className="flex gap-4 overflow-x-auto pb-2">
              <span className="px-4 py-2 bg-white border border-slate-100 rounded-full text-xs font-bold uppercase tracking-wide text-slate-600 shadow-sm">{venue.type}</span>
              <span className="px-4 py-2 bg-white border border-slate-100 rounded-full text-xs font-bold uppercase tracking-wide text-green-600 shadow-sm flex items-center gap-1"><Users className="w-3 h-3"/> Popular</span>
          </div>

          <div>
              <h2 className="font-bold text-slate-900 text-lg mb-2">About</h2>
              <p className="text-slate-500 leading-relaxed text-sm">{venue.description || "A wonderful place to enjoy your evening with friends and family."}</p>
          </div>

          {/* SEAT MAP SECTION */}
          <div>
              <h2 className="font-bold text-slate-900 text-lg mb-4">Select a Table</h2>
              {/* Note: Pass ID to SeatMap. We will need to update SeatMap next to handle 'demo' IDs too */}
              {/* @ts-ignore */}
              <SeatMap venueId={venue.id} />
          </div>

      </div>
    </div>
  )
}