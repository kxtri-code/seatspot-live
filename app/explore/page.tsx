"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Heart, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vibe = searchParams.get('vibe') || 'All'
  const pax = searchParams.get('pax') || '2'
  
  const [venues, setVenues] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Get Venues
        const { data: allVenues, error: venueError } = await supabase.from('venues').select('*')
        if (venueError) throw venueError

        // 2. Get Events
        const { data: allEvents, error: eventError } = await supabase.from('events').select('*').order('date', { ascending: true }).limit(5)
        
        if (isMounted) {
            setDebugInfo(`DB returned: ${allVenues?.length || 0} venues`)

            if (allVenues && allVenues.length > 0) {
                // Try to filter
                let match = allVenues.filter(v => 
                   vibe === 'All' || 
                   (v.type && v.type.toLowerCase().includes(vibe.toLowerCase()))
                )

                // SMART FALLBACK: If filter returns 0, show ALL instead
                if (match.length === 0) {
                    setIsFallback(true)
                    setVenues(allVenues) // Show everything
                } else {
                    setIsFallback(false)
                    setVenues(match)
                }
            }
            
            if (allEvents) setEvents(allEvents)
        }

      } catch (err: any) {
         console.error("Data Load Error:", err)
      } finally {
         if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [vibe])

  // Reusable Card
  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
        onClick={() => router.push(`/venue/${venue.id}`)}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer group h-full flex flex-col"
    >
        <div className="h-48 overflow-hidden relative">
            <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {venue.rating}
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                {venue.type}
            </div>
        </div>
        <div className="p-5">
            <h3 className="font-bold text-lg text-slate-900">{venue.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                <MapPin className="w-3 h-3" /> {venue.location}
            </div>
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
                <h1 className="text-lg font-black capitalize text-slate-900 leading-none">{vibe === 'All' ? 'Discover' : vibe}</h1>
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
                {/* 1. EVENTS ROW */}
                {events.length > 0 && (
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-purple-600" /> Happening Soon
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                            {events.map(ev => (
                                <div key={ev.id} className="min-w-[280px] snap-center bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                                    <div className="h-32 relative">
                                        <img src={ev.image_url} className="w-full h-full object-cover"/>
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-bold">
                                            {new Date(ev.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 truncate">{ev.title}</h3>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3"/> {ev.venue_name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. VENUE GRID */}
                <div>
                     <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" /> {isFallback ? 'Popular Places' : 'Top Places'}
                    </h2>
                    
                    {/* FALLBACK MESSAGE */}
                    {isFallback && (
                         <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 text-sm font-medium">
                             We couldn't find specific "{vibe}" spots, so we're showing you the most popular places in town instead!
                         </div>
                    )}

                    {venues.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {venues.map(v => <VenueCard key={v.id} venue={v} />)}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                             <p className="text-slate-400">No venues found in the system.</p>
                             <p className="text-[10px] text-slate-300 mt-2">{debugInfo}</p>
                        </div>
                    )}
                </div>
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