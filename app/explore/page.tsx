"use client"

import { useEffect, useState, Suspense, useRef } from 'react'
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
  const fetchCount = useRef(0)

  useEffect(() => {
    const controller = new AbortController() // Used to track this specific request
    const fetchData = async () => {
      const currentFetch = ++fetchCount.current
      setLoading(true)
      setErrorMsg('')
      
      try {
        // 1. Fetch Venues & Events simultaneously
        const [vRes, eRes] = await Promise.all([
            supabase.from('venues').select('*'),
            supabase.from('events').select('*').order('date', { ascending: true })
        ])

        // If a newer request has started, ignore this one
        if (currentFetch !== fetchCount.current) return

        if (vRes.error) throw vRes.error

        if (vRes.data) {
            // Case-Insensitive Filter
            const filtered = vRes.data.filter(v => {
               if (vibe === 'All') return true
               return v.type?.toLowerCase().trim() === vibe.toLowerCase().trim()
            })

            // Fallback: Show all if vibe results in 0
            setVenues(filtered.length > 0 ? filtered : vRes.data)
        }
        
        if (eRes.data) setEvents(eRes.data)

      } catch (err: any) {
         // --- THE FIX: Ignore AbortErrors ---
         if (err.name === 'AbortError' || err.message?.includes('aborted')) {
             console.log("Fetch aborted - ignoring error")
             return
         }
         console.error("Connection Failure:", err)
         setErrorMsg(err.message || "Failed to connect to Supabase.")
      } finally {
         if (currentFetch === fetchCount.current) {
            setLoading(false)
         }
      }
    }

    fetchData()
    return () => controller.abort() // Cleanup
  }, [vibe])

  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
        onClick={() => router.push(`/venue/${venue.id}`)}
        className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 active:scale-95 transition-transform cursor-pointer group"
    >
        <div className="h-48 overflow-hidden relative">
            <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={venue.name} />
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                {venue.type}
            </div>
        </div>
        <div className="p-5">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-900 leading-none">{venue.name}</h3>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Star className="w-3 h-3 fill-yellow-500" /> {venue.rating || '4.5'}
                </div>
            </div>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-3">
                <MapPin className="w-3 h-3 text-red-500"/> {venue.location}
            </p>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white sticky top-0 z-20 px-4 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="text-slate-900"/>
            </Button>
            <div>
                <h1 className="text-lg font-black capitalize text-slate-900 leading-none">{vibe}</h1>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                    {loading ? 'Refreshing...' : `${venues.length} venues found`}
                </p>
            </div>
        </div>
        <Compass className={`w-6 h-6 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
      </div>

      <div className="p-4 space-y-8">
        {loading && venues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Scanning Dimapur...</p>
            </div>
        ) : errorMsg ? (
            <div className="p-8 bg-white border border-slate-200 rounded-[2rem] text-center shadow-xl">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-slate-900 font-black text-xl">Connection Issue</h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed px-4">{errorMsg}</p>
                <Button onClick={() => window.location.reload()} className="mt-6 bg-slate-900 text-white rounded-2xl px-8 h-12 font-bold">Retry</Button>
            </div>
        ) : (
            <>
                {events.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-purple-600" /> Happening Soon
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                            {events.map(ev => (
                                <div key={ev.id} className="min-w-[280px] snap-center bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
                                    <div className="h-32 relative">
                                        <img src={ev.image_url} className="w-full h-full object-cover" alt={ev.title}/>
                                        <div className="absolute inset-0 bg-black/20" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 truncate">{ev.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ev.venue_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600"/></div>}>
      <ExploreContent />
    </Suspense>
  )
}