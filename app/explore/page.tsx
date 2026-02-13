"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 1. THE CONTENT COMPONENT (Does the actual work)
function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vibe = searchParams.get('vibe') || 'All'
  const pax = searchParams.get('pax') || '2'
  
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenues = async () => {
      // Fetch Venues matching the type (vibe)
      let query = supabase.from('venues').select('*')
      
      if (vibe && vibe !== 'All') {
         query = query.ilike('type', `%${vibe}%`) 
      }

      const { data, error } = await query
      
      if (data) setVenues(data)
      setLoading(false)
    }
    fetchVenues()
  }, [vibe])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white sticky top-0 z-10 px-4 py-4 shadow-sm flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-lg font-black capitalize text-slate-900">{vibe}s for {pax}</h1>
            <p className="text-xs text-slate-500">Found {venues.length} venues nearby</p>
        </div>
      </div>

      {/* LIST */}
      <div className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
            <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-blue-600"/></div>
        ) : venues.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400">
                <p>No venues found for this vibe yet.</p>
                <p className="text-sm">Try selecting a different category.</p>
            </div>
        ) : (
            venues.map(venue => (
                <div 
                    key={venue.id} 
                    onClick={() => router.push(`/venue/${venue.id}`)}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer group"
                >
                    <div className="h-48 overflow-hidden relative">
                        <img 
                            src={venue.image_url} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            alt={venue.name}
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {venue.rating || 'New'}
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="font-bold text-lg text-slate-900">{venue.name}</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                            <MapPin className="w-3 h-3" /> {venue.location}
                        </div>
                        <p className="text-slate-500 text-sm mt-3 line-clamp-2">{venue.description}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">{venue.type}</span>
                            <span className="text-xs font-bold text-slate-400">Book Table &rarr;</span>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}

// 2. THE MAIN PAGE COMPONENT (The Fix for the Build Error)
export default function Explore() {
  return (
    <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
        </div>
    }>
      <ExploreContent />
    </Suspense>
  )
}