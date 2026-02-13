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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Get Venues (Force fresh fetch)
        const { data: allVenues, error: vErr } = await supabase.from('venues').select('*')
        
        // 2. Get Events
        const { data: allEvents, error: eErr } = await supabase.from('events').select('*').order('date', { ascending: true })

        if (allVenues) {
            // Filter logic
            const match = allVenues.filter(v => 
               vibe === 'All' || 
               (v.type && v.type.toLowerCase().includes(vibe.toLowerCase()))
            )
            setVenues(match.length > 0 ? match : allVenues) // Fallback to ALL if filter is empty
        }
        
        if (allEvents) setEvents(allEvents)

      } catch (err) {
         console.error("Fetch error:", err)
      } finally {
         setLoading(false)
      }
    }
    fetchData()
  }, [vibe])

  // UPGRADED CARD COMPONENT
  const VenueCard = ({ venue }: { venue: any }) => {
    const vibeScore = venue.rating ? Math.round(venue.rating * 20) : 85; 
    
    return (
        <div 
            onClick={() => router.push(`/venue/${venue.id}`)}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer group h-full flex flex-col relative"
        >
            <div className="h-48 overflow-hidden relative">
                <img 
                    src={venue.image_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={venue.name}
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/10">
                    <span className="text-[10px] text-white font-bold uppercase">Vibe</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-tr from-purple-500 to-pink-500 text-[10px] font-black text-white">
                        {vibeScore}
                    </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 uppercase tracking-wider shadow-sm">
                    {venue.type}
                </div>
            </div>

            <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{venue.name}</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                            <MapPin className="w-3 h-3 text-red-400" /> {venue.location}
                        </div>
                    </div>
                </div>

                <p className="text-slate-500 text-xs line-clamp-2 mt-1">{venue.description}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span>{venue.rating}</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        Book <ArrowLeft className="w-3 h-3 rotate-180" />
                    </span>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
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

                <div>
                     <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" /> Top Places
                    </h2>
                    {venues.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {venues.map(v => <VenueCard key={v.id} venue={v} />)}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                             <p className="text-slate-400">No venues found.</p>
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