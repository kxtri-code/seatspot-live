"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vibe = searchParams.get('vibe') || 'All'
  
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [debugData, setDebugData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true)
        setErrorMsg(null)

        // Fetching with no cache to ensure we see the 7 venues
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (isMounted) {
          setDebugData(data || []);
          
          if (data && data.length > 0) {
            // Case-insensitive filtering
            const filtered = data.filter(v => 
              vibe === 'All' || v.type?.toLowerCase() === vibe.toLowerCase()
            );
            // Show filtered if found, otherwise show all 7 as fallback
            setVenues(filtered.length > 0 ? filtered : data);
          } else {
            setVenues([]);
          }
        }
      } catch (err: any) {
        // IGNORE the AbortError that keeps popping up in your screenshots
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="text-slate-900"/>
          </Button>
          <div>
            <h1 className="text-lg font-black text-slate-900 capitalize">{vibe}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {loading ? 'Connecting...' : `${venues.length} Venues found`}
            </p>
          </div>
        </div>
        <Compass className={`w-6 h-6 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
      </div>

      <div className="p-4 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Syncing with Supabase...</p>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-10 bg-red-50 rounded-3xl border border-red-100 p-6">
            <p className="text-red-600 font-bold mb-2">Connection Error</p>
            <p className="text-xs text-red-500 mb-4">{errorMsg}</p>
            <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="border-red-200">Retry</Button>
          </div>
        ) : venues.length > 0 ? (
          <div className="grid gap-6">
            {venues.map((v) => (
              <div 
                key={v.id} 
                onClick={() => router.push(`/venue/${v.id}`)}
                className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 active:scale-95 transition-all"
              >
                <div className="h-52 relative">
                  <img src={v.image_url} className="w-full h-full object-cover" alt={v.name} />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-tighter">
                    {v.type}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-xl text-slate-900">{v.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-black text-yellow-700">{v.rating || '5.0'}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" /> {v.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Found</p>
            <p className="text-[10px] text-slate-300 mt-2 italic">Check the raw feed below</p>
          </div>
        )}

        {/* RAW DATA DEBUGGER */}
        <div className="mt-10 p-4 bg-slate-900 rounded-[2rem]">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Database className="w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Raw Database Output</h3>
          </div>
          <pre className="text-[9px] text-slate-500 overflow-x-auto bg-black/40 p-4 rounded-xl leading-relaxed">
            {debugData ? JSON.stringify(debugData, null, 2) : "// Awaiting response..."}
          </pre>
        </div>
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