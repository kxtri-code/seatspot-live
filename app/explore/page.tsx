"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vibe = searchParams.get('vibe') || 'All'
  const pax = searchParams.get('pax') || '2'
  
  const [venues, setVenues] = useState<any[]>([])
  const [otherVenues, setOtherVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenues = async () => {
      // 1. Get ALL venues
      const { data, error } = await supabase.from('venues').select('*')
      
      if (data) {
          // 2. Filter in memory (More reliable than DB strict matching)
          // "Fuzzy match": If vibe is "club", it matches "Night Club", "Club", "Bar", etc.
          const match = data.filter(v => 
             vibe === 'All' || 
             (v.type && v.type.toLowerCase().includes(vibe.toLowerCase()))
          )

          // 3. Get everything else for the "Explore More" section
          const others = data.filter(v => 
             !v.type || !v.type.toLowerCase().includes(vibe.toLowerCase())
          )

          setVenues(match)
          setOtherVenues(others)
      }
      setLoading(false)
    }
    fetchVenues()
  }, [vibe])

  // Reusable Card Component
  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
        onClick={() => router.push(`/venue/${venue.id}`)}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer group h-full flex flex-col"
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
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                {venue.type}
            </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-lg text-slate-900">{venue.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                <MapPin className="w-3 h-3" /> {venue.location}
            </div>
            <p className="text-slate-500 text-sm mt-3 line-clamp-2 flex-1">{venue.description}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">For {pax} Guests</span>
                <span className="text-xs font-bold text-blue-600">View Tables &rarr;</span>
            </div>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white sticky top-0 z-20 px-4 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="text-slate-900"/>
            </Button>
            <div>
                <h1 className="text-lg font-black capitalize text-slate-900 leading-none">
                    {vibe === 'All' ? 'Discover' : vibe}
                </h1>
                <p className="text-xs text-slate-500 mt-1">Showing best matches</p>
            </div>
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Compass className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 space-y-8">
        
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600"/></div>
        ) : (
            <>
                {/* SECTION 1: MATCHES */}
                {venues.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {venues.map(v => <VenueCard key={v.id} venue={v} />)}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">No specific "{vibe}" spots found nearby.</p>
                        <p className="text-sm text-blue-600 font-bold mt-1">Check out these popular places instead 👇</p>
                    </div>
                )}

                {/* SECTION 2: DISCOVER MORE (Broad Categories) */}
                {otherVenues.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" /> More to Explore
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {otherVenues.map(v => <VenueCard key={v.id} venue={v} />)}
                        </div>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  )
}

export default function Explore() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin"/></div>}>
      <ExploreContent />
    </Suspense>
  )
}