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
  const [rawOutput, setRawOutput] = useState<any>(null)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)
  const fetchLock = useRef(false) // Prevents double-fetching which triggers AbortError

  useEffect(() => {
    // If a fetch is already in progress, don't start a new one
    if (fetchLock.current) return;
    
    const loadData = async () => {
      fetchLock.current = true;
      setLoading(true);
      setErrorStatus(null);
      
      try {
        // Fetch all 7 venues without strict filters initially
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Save raw output for the debugger
        setRawOutput(data || []);

        if (data && data.length > 0) {
          // Perform local filtering to avoid "Abort" triggers on URL change
          const matches = data.filter(v => 
            vibe === 'All' || v.type?.toLowerCase().trim() === vibe.toLowerCase().trim()
          );
          
          // Force display all 7 if the specific vibe (like 'cafe') isn't found
          setVenues(matches.length > 0 ? matches : data);
        } else {
          setVenues([]);
        }

        // Fetch events separately
        const { data: eventData } = await supabase.from('events').select('*');
        if (eventData) setEvents(eventData);

      } catch (err: any) {
        // SILENTLY HANDLE ABORTERRORS: Do not show red text for this
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          console.warn("Recovering from Abort Signal...");
          return;
        }
        setErrorStatus(err.message || "Database connection timed out.");
      } finally {
        setLoading(true); // Small delay for UX
        setTimeout(() => {
            setLoading(false);
            fetchLock.current = false;
        }, 300);
      }
    };

    loadData();
  }, [vibe]);

  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
      onClick={() => router.push(`/venue/${venue.id}`)}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 active:scale-95 transition-all cursor-pointer group mb-6"
    >
      <div className="h-56 relative">
        <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={venue.name} />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-tighter">
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
        <p className="text-slate-500 text-sm mt-3 flex items-center gap-1 font-semibold">
          <MapPin className="w-3 h-3 text-red-500" /> {venue.location}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* HEADER NAVIGATION */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="text-slate-900"/>
          </Button>
          <div>
            <h1 className="text-lg font-black text-slate-900 capitalize leading-none">{vibe}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {loading ? 'Polling Database...' : `${venues.length} results live`}
            </p>
          </div>
        </div>
        <Compass className={`w-6 h-6 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
      </div>

      <div className="p-4 space-y-8">
        {loading && venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-600 w-12 h-12"/>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Feed...</p>
          </div>
        ) : errorStatus ? (
          <div className="p-10 bg-white border-2 border-slate-100 rounded-[3rem] text-center shadow-2xl">
            <h2 className="text-slate-900 font-black text-xl mb-2">Connection Offline</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">{errorStatus}</p>
            <Button onClick={() => window.location.reload()} className="bg-slate-900 text-white rounded-2xl px-10 h-14 font-black tracking-widest uppercase text-xs hover:bg-slate-800 transition-all">Retry Link</Button>
          </div>
        ) : (
          <>
            {/* LIVE EVENTS */}
            {events.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2 tracking-tight">
                  <Ticket className="w-5 h-5 text-purple-600" /> Happening Soon
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x px-2">
                  {events.map(ev => (
                    <div key={ev.id} className="min-w-[280px] snap-center bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
                      <div className="h-32 relative">
                        <img src={ev.image_url} className="w-full h-full object-cover" alt={ev.title}/>
                        <div className="absolute inset-0 bg-black/5 shadow-inner" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-slate-900 truncate leading-tight">{ev.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ev.venue_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOP PICKS LIST */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2 tracking-tight">
                <Heart className="w-5 h-5 text-red-500" /> Top Picks
              </h2>
              <div className="px-2">
                {venues.map(v => <VenueCard key={v.id} venue={v} />)}
              </div>
            </div>
          </>
        )}

        {/* SYSTEM PAYLOAD DEBUGGER */}
        <div className="mt-12 p-6 bg-slate-950 rounded-[2.5rem] shadow-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Database className="w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Supabase Data Integrity</h3>
          </div>
          <pre className="text-[9px] text-slate-600 overflow-x-auto bg-black/50 p-6 rounded-2xl leading-loose font-mono">
            {rawOutput ? JSON.stringify(rawOutput, null, 2) : "// Awaiting stable data packets..."}
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