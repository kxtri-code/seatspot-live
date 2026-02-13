"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Heart, Ticket, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vibe = searchParams.get('vibe') || 'All'
  
  const [venues, setVenues] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setErrorMsg('')
      
      try {
        // 1. Fetch Venues (The 7 items confirmed in SQL)
        const { data: allVenues, error: vErr } = await supabase.from('venues').select('*')
        
        // 2. Fetch Events
        const { data: allEvents, error: eErr } = await supabase.from('events').select('*').order('date', { ascending: true })

        if (vErr) throw vErr

        // DEBUG LOGGING - Check your browser console to see what arrives
        console.log("Database Response:", allVenues)

        if (allVenues && allVenues.length > 0) {
            // Apply Case-Insensitive Filter
            const filtered = allVenues.filter(v => {
               if (vibe === 'All') return true
               return v.type?.toLowerCase().trim() === vibe.toLowerCase().trim()
            })

            // FALLBACK: If "cafe" results in 0, show all 7 venues so the page isn't empty
            if (filtered.length === 0) {
                console.warn(`Vibe "${vibe}" matched 0 items. Displaying all venues instead.`)
                setVenues(allVenues)
            } else {
                setVenues(filtered)
            }
        } else {
            setErrorMsg("Database connected, but returned 0 rows. Check RLS Policies.")
        }
        
        if (allEvents) setEvents(allEvents)

      } catch (err: any) {
         console.error("Connection Failure:", err)
         setErrorMsg(err.message || "Failed to connect to Supabase.")
      } finally {
         setLoading(false)
      }
    }

    fetchData()
  }, [vibe])

  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
        onClick={() => router.push(`/venue/${venue.id}`)}
        className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 active:scale-95 transition-transform cursor-pointer group"
    >
        <div className="h-48 overflow-hidden relative">
            <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={venue.name} />
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase">
                {venue.type}
            </div>
        </div>
        <div className="p-5">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-900">{venue.name}</h3>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Star className="w-4 h-4 fill-yellow-500" /> {venue.rating || '5.0'}
                </div>
            </div>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-2">
                <MapPin className="w-3 h-3 text-red-500"/> {venue.location}
            </p>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* STICKY HEADER */}
      <div className="bg-white sticky top-0 z-20 px-4 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="text-slate-900"/>
            </Button>
            <div>
                <h1 className="text-lg font-black capitalize text-slate-900 leading-none">{vibe}</h1>
                <p className="text-xs text-slate-500 mt-1">Found {venues.length} venues</p>
            </div>
        </div>
        <Compass className="w-6 h-6 text-slate-400 animate-pulse" />
      </div>

      <div className="p-4 space-y-8">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
                <p className="text-slate-400 text-sm font-medium">Fetching the vibe...</p>
            </div>
        ) : errorMsg ? (
            <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h2 className="text-red-900 font-bold text-lg">Connection Issue</h2>
                <p className="text-red-600 text-sm mt-1">{errorMsg}</p>
                <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700">Retry Connection</Button>
            </div>
        ) : (
            <>
                {/* EVENTS SECTION */}
                {events.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-purple-600" /> Happening Soon
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                            {events.map(ev => (
                                <div key={ev.id} className="min-w-[280px] snap-center bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                                    <div className="h-32 relative">
                                        <img src={ev.image_url} className="w-full h-full object-cover" alt={ev.title}/>
                                        <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded">EVENT</div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 truncate">{ev.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{ev.venue_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VENUE GRID */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" /> Top Places
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {venues.map(v => <VenueCard key={v.id} venue={v} />)}
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  )
}

export default function Explore() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>}>
      <ExploreContent />
    </Suspense>
  )
}