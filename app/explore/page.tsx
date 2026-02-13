"use client"

import { useEffect, useState, Suspense, useRef } from 'react'
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
  const [debugLog, setDebugLog] = useState<any>(null)
  const isFetching = useRef(false)

  useEffect(() => {
    const loadSystemData = async (retryCount = 0) => {
      if (isFetching.current && retryCount === 0) return;
      
      isFetching.current = true;
      setLoading(true);
      
      try {
        // Fetching with a fresh timestamp to bypass any stalled cache
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setDebugLog(data);
          // Case-insensitive local filter
          const filtered = data.filter(v => 
            vibe === 'All' || v.type?.toLowerCase().trim() === vibe.toLowerCase().trim()
          );
          
          // Force-display all 7 venues if specific filter is empty
          setVenues(filtered.length > 0 ? filtered : data);
        }

        const { data: eventData } = await supabase.from('events').select('*');
        if (eventData) setEvents(eventData);

        setLoading(false);
        isFetching.current = false;

      } catch (err: any) {
        // AUTOMATIC RETRY LOGIC for AbortErrors
        if ((err.name === 'AbortError' || err.message?.includes('aborted')) && retryCount < 3) {
          console.warn(`Abort detected. Retrying attempt ${retryCount + 1}...`);
          setTimeout(() => loadSystemData(retryCount + 1), 500);
        } else {
          console.error("Final Connection Failure:", err);
          setLoading(false);
          isFetching.current = false;
        }
      }
    };

    loadSystemData();
  }, [vibe]);

  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
      onClick={() => router.push(`/venue/${venue.id}`)}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100 active:scale-95 transition-all cursor-pointer mb-6"
    >
      <div className="h-56 relative">
        <img src={venue.image_url} className="w-full h-full object-cover" alt={venue.name} />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase">
          {venue.type}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-xl text-slate-900">{venue.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-black text-yellow-700">{venue.rating || '5.0'}</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-3 flex items-center gap-1 font-bold">
          <MapPin className="w-3 h-3 text-red-500" /> {venue.location}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="text-slate-900"/>
          </Button>
          <div>
            <h1 className="text-lg font-black text-slate-900 capitalize leading-none">{vibe}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {loading ? 'Bypassing Signal Block...' : `${venues.length} venues active`}
            </p>
          </div>
        </div>
        <Compass className={`w-6 h-6 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
      </div>

      <div className="p-4 space-y-8">
        {loading && venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-600 w-12 h-12"/>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Forcing Data Sync...</p>
          </div>
        ) : (
          <>
            {/* EVENTS */}
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
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-slate-900 truncate">{ev.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ev.venue_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VENUES */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" /> Recommended
              </h2>
              {venues.map(v => <VenueCard key={v.id} venue={v} />)}
            </div>
          </>
        )}

        {/* RAW PAYLOAD DEBUGGER */}
        <div className="mt-12 p-6 bg-slate-950 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Database className="w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Supabase Integrity Feed</h3>
          </div>
          <pre className="text-[9px] text-slate-600 overflow-x-auto bg-black/50 p-6 rounded-2xl leading-loose font-mono">
            {debugLog ? JSON.stringify(debugLog, null, 2) : "// Forcing data packets through..."}
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