"use client"

// 1. Force Dynamic (No Caching)
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Heart, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vibe = searchParams.get('vibe') || 'All'
  
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [debugData, setDebugData] = useState<any>(null)
  const [errorInfo, setErrorInfo] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setErrorInfo(null)
      
      try {
        // Fetch ALL venues - No filters yet to see if connection works
        const { data, error } = await supabase.from('venues').select('*')

        if (error) {
            setErrorInfo(error.message)
            return
        }

        setDebugData(data) // Save raw data for the debugger below

        if (data && data.length > 0) {
            // Apply simple filter
            const filtered = data.filter(v => {
               if (vibe === 'All') return true
               return v.type?.toLowerCase() === vibe.toLowerCase()
            })
            
            // If filter results in 0, show all 7 as a safety net
            setVenues(filtered.length > 0 ? filtered : data)
        } else {
            setVenues([])
        }

      } catch (err: any) {
         setErrorInfo(err.message)
      } finally {
         setLoading(false)
      }
    }

    fetchData()
  }, [vibe])

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                <ArrowLeft className="text-slate-900"/>
            </Button>
            <div>
                <h1 className="text-lg font-black text-slate-900">{vibe}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {loading ? 'Searching...' : `${venues.length} venues live`}
                </p>
            </div>
        </div>
        <Compass className={`w-6 h-6 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
      </div>

      <div className="p-4 space-y-6">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Accessing Database...</p>
            </div>
        ) : venues.length > 0 ? (
            <div className="grid gap-6">
                {venues.map((v) => (
                    <div 
                        key={v.id} 
                        onClick={() => router.push(`/venue/${v.id}`)}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 active:scale-[0.98] transition-all"
                    >
                        <div className="h-56 relative">
                            <img src={v.image_url} className="w-full h-full object-cover" alt={v.name} />
                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-tighter">
                                {v.type}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-xl text-slate-900">{v.name}</h3>
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-black text-yellow-700">{v.rating || '4.5'}</span>
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
            <div className="text-center py-20">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Venues Found</p>
                {errorInfo && <p className="text-red-500 text-xs mt-2">{errorInfo}</p>}
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 rounded-full">Retry Connection</Button>
            </div>
        )}

        {/* --- RAW DATA DEBUGGER --- */}
        <div className="mt-10 p-4 bg-slate-900 rounded-3xl overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
                <Database className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">Raw Database Feed</h3>
            </div>
            <pre className="text-[10px] text-slate-500 overflow-x-auto bg-black/40 p-4 rounded-xl leading-relaxed">
                {debugData ? JSON.stringify(debugData, null, 2) : "// No data received yet"}
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