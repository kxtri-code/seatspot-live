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
  
  const [venues, setVenues] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Fetch the 7 venues you just confirmed in SQL
        const { data: allVenues, error } = await supabase.from('venues').select('*')
        const { data: allEvents } = await supabase.from('events').select('*')

        if (error) throw error

        if (allVenues) {
            // Filter by vibe (cafe, club, etc.)
            const match = allVenues.filter(v => 
               vibe === 'All' || 
               (v.type && v.type.toLowerCase().includes(vibe.toLowerCase()))
            )
            
            // SMART FALLBACK: If "cafe" finds 0, show all 7 venues instead
            setVenues(match.length > 0 ? match : allVenues)
        }
        
        if (allEvents) setEvents(allEvents)

      } catch (err: any) {
         console.error("Fetch Error:", err.message)
      } finally {
         setLoading(false)
      }
    }
    fetchData()
  }, [vibe])

  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
        onClick={() => router.push(`/venue/${venue.id}`)}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-transform"
    >
        <div className="h-48 overflow-hidden relative">
            <img src={venue.image_url} className="w-full h-full object-cover" alt={venue.name} />
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-white text-[10px] font-bold uppercase">
                {venue.type}
            </div>
        </div>
        <div className="p-4">
            <h3 className="font-bold text-lg text-slate-900">{venue.name}</h3>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-red-500"/> {venue.location}
            </p>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white sticky top-0 z-20 px-4 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                <ArrowLeft className="text-slate-900"/>
            </Button>
            <div>
                <h1 className="text-lg font-black capitalize text-slate-900">{vibe}</h1>
                <p className="text-xs text-slate-500">Showing {venues.length} results</p>
            </div>
        </div>
        <Compass className="w-6 h-6 text-slate-400" />
      </div>

      <div className="p-4 space-y-6">
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600"/></div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {venues.map(v => <VenueCard key={v.id} venue={v} />)}
            </div>
        )}
      </div>
    </div>
  )
}

export default function Explore() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>}>
      <ExploreContent />
    </Suspense>
  )
}