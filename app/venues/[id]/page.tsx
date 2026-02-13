"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, ArrowLeft, MapPin, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SeatMap from '@/components/SeatMap' // Reuse your existing component

export default function VenueDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<any>(null)

  useEffect(() => {
    const fetchVenue = async () => {
        const { data } = await supabase.from('venues').select('*').eq('id', id).single()
        setVenue(data)
    }
    if(id) fetchVenue()
  }, [id])

  if (!venue) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* HERO IMAGE */}
      <div className="relative h-64 md:h-80 w-full">
         <img src={venue.image_url} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
         
         <div className="absolute top-4 left-4">
             <Button variant="secondary" size="icon" className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border-none" onClick={() => router.back()}>
                 <ArrowLeft />
             </Button>
         </div>

         <div className="absolute bottom-6 left-6 right-6 text-white">
             <h1 className="text-3xl font-black">{venue.name}</h1>
             <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                 <MapPin className="w-4 h-4" /> {venue.location}
                 {venue.instagram && <span className="flex items-center gap-1 border-l border-white/30 pl-2 ml-2"><Instagram className="w-4 h-4"/> {venue.instagram}</span>}
             </div>
         </div>
      </div>

      {/* BOOKING SECTION */}
      <div className="max-w-3xl mx-auto -mt-6 relative z-10 px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Select Your Table</h2>
                  <p className="text-slate-500 text-sm">Tap a green table to book it.</p>
              </div>
              
              <div className="p-4 bg-slate-50 flex justify-center">
                   {/* Load the SeatMap Component you already built */}
                   <SeatMap venueId={id as string} />
              </div>
          </div>

          <div className="mt-8 px-4">
              <h3 className="font-bold text-slate-900 mb-2">About</h3>
              <p className="text-slate-600 leading-relaxed">{venue.description}</p>
          </div>
      </div>

    </div>
  )
}