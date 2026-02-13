"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Database, Heart, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vibe = searchParams.get('vibe') || 'All'
  
  const [venues, setVenues] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [debugData, setDebugData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true)
        setErrorMsg(null)

        // Simultaneous fetch for venues and events
        const [vRes, eRes] = await Promise.all([
          supabase.from('venues').select('*').order('created_at', { ascending: false }),
          supabase.from('events').select('*').order('date', { ascending: true })
        ]);

        if (vRes.error) throw vRes.error;

        if (isMounted) {
          setDebugData(vRes.data || []);
          
          if (vRes.data && vRes.data.length > 0) {
            // Case-insensitive filtering logic
            const filtered = vRes.data.filter(v => 
              vibe === 'All' || v.type?.toLowerCase().trim() === vibe.toLowerCase().trim()
            );
            
            // Display matches or fallback to all 7 venues if specific vibe is empty
            setVenues(filtered.length > 0 ? filtered : vRes.data);
          } else {
            setVenues([]);
          }

          if (eRes.data) setEvents(eRes.data);
        }
      } catch (err: any) {
        // Specifically ignore the AbortError causing the black screen issues
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          console.log("Caught and suppressed AbortError.");
          return;
        }
        if (isMounted) setErrorMsg(err.message);
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false };
  }, [vibe])

  // Card component for individual venues
  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
      onClick={() => router.push(`/venue/${venue.id}`)}
      className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 active:scale-95 transition-all cursor-pointer group"
    >
      <div className="h-52 relative">
        <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={venue.name} />
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-tighter shadow-xl">
          {venue.type}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-xl text-slate-900 leading-none">{venue.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-black text-yellow-700">{venue.rating || '5.0'}</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-3 flex items-center gap-1 font-medium">
          <MapPin className="w-3 h-3 text-red-500" /> {venue.location}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* NAVIGATION HEADER */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="text-slate-900"/>
          </Button>
          <div>
            <h1 className="text-lg font-black text-slate-900 capitalize leading-none">{vibe}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {loading ? 'Refreshing...' : `${venues.length} results live`}
            </p>
          </div>
        </div>
        <Compass className={`w-6 h-6 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
      </div>

      <div className="p-4 space-y-8">
        {loading && venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-600 w-12 h-12"/>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Syncing with Dimapur Feed...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] text-center shadow-xl">
            <h2 className="text-slate-900 font-black text-xl">Connection Offline</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{errorMsg}</p>
            <Button onClick={() => window.location.reload()} className="mt-6 bg-slate-900 text-white rounded-2xl px-8 h-12 font-bold hover:bg-slate-800">Retry Link</Button>
          </div>
        ) : (
          <>
            {/* EVENT HIGHLIGHTS */}
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
                        <div className="absolute inset-0 bg-black/10" />
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

            {/* VENUE LISTING */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" /> Top Picks
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {venues.map(v => <VenueCard key={v.id} venue={v} />)}
              </div>
            </div>
          </>
        )}

        {/* SYSTEM DATA FEED (FOR DEBUGGING) */}
        <div className="mt-12 p-5 bg-slate-900 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Database className="w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Supabase Live Payload</h3>
          </div>
          <pre className="text-[9px] text-slate-500 overflow-x-auto bg-black/50 p-5 rounded-2xl leading-relaxed border border-white/5">
            {debugData ? JSON.stringify(debugData, null, 2) : "// Awaiting data packets..."}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function Explore() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600"/></div>}>
      <ExploreContent />
    </Suspense>
  )
}