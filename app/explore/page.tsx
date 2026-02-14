"use client"

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Heart, Ticket, Coffee, Music, Utensils, Map as MapIcon, List, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vibe = searchParams.get('vibe') || 'All'
  
  const [venues, setVenues] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false) // Toggle State
  const isFetching = useRef(false)

  const getVibeIcon = () => {
    if (vibe.toLowerCase().includes('cafe')) return <Coffee className="w-6 h-6 text-slate-400" />
    if (vibe.toLowerCase().includes('club')) return <Music className="w-6 h-6 text-slate-400" />
    if (vibe.toLowerCase().includes('restaurant')) return <Utensils className="w-6 h-6 text-slate-400" />
    return <Compass className="w-6 h-6 text-slate-400" />
  }

  useEffect(() => {
    const loadSystemData = async (retryCount = 0) => {
      if (isFetching.current && retryCount === 0) return;
      isFetching.current = true;
      setLoading(true);
      
      try {
        const { data, error } = await supabase.from('venues').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (data) {
          const filtered = data.filter(v => vibe === 'All' || v.type?.toLowerCase().trim() === vibe.toLowerCase().trim());
          setVenues(filtered.length > 0 ? filtered : data);
        }

        const { data: eventData } = await supabase.from('events').select('*');
        if (eventData) setEvents(eventData);

        setLoading(false);
        isFetching.current = false;

      } catch (err: any) {
        if ((err.name === 'AbortError' || err.message?.includes('aborted')) && retryCount < 3) {
          setTimeout(() => loadSystemData(retryCount + 1), 500);
        } else {
          setLoading(false);
          isFetching.current = false;
        }
      }
    };
    loadSystemData();
  }, [vibe]);

  const VenueCard = ({ venue }: { venue: any }) => (
    <div 
      onClick={() => router.push(`/venues/${venue.id}`)}
      className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-all cursor-pointer mb-6 group"
    >
      <div className="h-56 relative overflow-hidden">
        <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={venue.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
          {venue.type === 'club' && <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />}
          {venue.type}
        </div>
      </div>
      <div className="p-6 relative">
        <div className="flex justify-between items-start">
          <div>
              <h3 className="font-black text-xl text-slate-900 leading-tight">{venue.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-slate-600">{venue.rating || '4.8'}</span>
              </div>
          </div>
          <div className="bg-slate-50 p-2 rounded-full border border-slate-100">
             <ArrowLeft className="w-4 h-4 text-slate-900 rotate-180" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-500 text-sm font-medium">
          <MapPin className="w-3 h-3 text-red-400" /> {venue.location}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-50 border-b border-slate-100/50">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="text-slate-900"/>
                </Button>
                <div>
                    <h1 className="text-lg font-black text-slate-900 capitalize leading-none">{vibe}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {loading ? 'Updating...' : `${venues.length} results`}
                    </p>
                </div>
            </div>
            
            {/* MAP TOGGLE SWITCH */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                <button 
                    onClick={() => setShowMap(false)}
                    className={`p-2 rounded-full transition-all ${!showMap ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                >
                    <List className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setShowMap(true)}
                    className={`p-2 rounded-full transition-all ${showMap ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                >
                    <MapIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {loading && venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 opacity-50">
            <Loader2 className="animate-spin text-slate-900 w-8 h-8"/>
          </div>
        ) : showMap ? (
            // --- MAP VIEW PLACEHOLDER ---
            <div className="h-[70vh] w-full bg-slate-200 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center text-slate-400 border border-slate-300">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/93.725,25.906,13,0/600x600?access_token=YOUR_TOKEN')] bg-cover opacity-20 grayscale" />
                <MapPin className="w-12 h-12 text-slate-300 mb-2" />
                <p className="font-bold text-sm">Interactive Map Coming Soon</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Dimapur Area</p>
                
                {/* Floating "Vibe" Pins (Visual Demo) */}
                <div className="absolute top-1/4 left-1/3 animate-bounce">
                    <div className="bg-white p-2 rounded-full shadow-lg">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                    </div>
                </div>
                <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-100">
                    <div className="bg-white p-2 rounded-full shadow-lg">
                        <Coffee className="w-5 h-5 text-brown-500" />
                    </div>
                </div>
            </div>
        ) : (
          <>
            {/* EVENTS */}
            {events.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 px-1">
                  <Ticket className="w-4 h-4 text-purple-600" /> Happening Soon
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
                  {events.map(ev => (
                    <div 
                        key={ev.id} 
                        onClick={() => router.push(`/venues/${ev.venue_id}`)}
                        className="min-w-[260px] snap-center bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-transform"
                    >
                      <div className="h-28 relative">
                        <img src={ev.image_url} className="w-full h-full object-cover" alt={ev.title}/>
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-[10px] font-bold">
                            {new Date(ev.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 truncate leading-tight">{ev.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ev.venue_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VENUES */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 px-1">
                <Heart className="w-4 h-4 text-red-500" /> Top Picks
              </h2>
              <div className="px-1">
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
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900"/></div>}>
      <ExploreContent />
    </Suspense>
  )
}