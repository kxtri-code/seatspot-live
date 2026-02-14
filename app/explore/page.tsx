"use client"

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Heart, Ticket, Flame, Zap, Coffee, Music, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // GET PARAMS
  const vibe = searchParams.get('vibe') || 'All'
  const guests = searchParams.get('guests') || '2'
  
  const [venues, setVenues] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isFetching = useRef(false)

  // Derived Lists
  const [matches, setMatches] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [topPicks, setTopPicks] = useState<any[]>([])

  const getVibeIcon = (type: string) => {
    if (type?.toLowerCase().includes('cafe')) return <Coffee className="w-4 h-4" />
    if (type?.toLowerCase().includes('club')) return <Music className="w-4 h-4" />
    return <Utensils className="w-4 h-4" />
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
          setVenues(data);
          
          // 1. YOUR MATCHES (Strict Filter)
          const strictMatches = data.filter(v => 
            vibe === 'All' || v.type?.toLowerCase().includes(vibe.toLowerCase())
          );
          setMatches(strictMatches.length > 0 ? strictMatches : data.slice(0, 3)); // Fallback if no match

          // 2. TRENDING / MOST VIBING (Simulated by ID hash or random for now)
          // In a real app, this would be a DB column 'current_vibe_score'
          const sortedByVibe = [...data].sort(() => 0.5 - Math.random());
          setTrending(sortedByVibe.slice(0, 4));

          // 3. TOP PICKS (High Rating)
          const highRated = data.filter(v => (v.rating || 0) >= 4.5);
          setTopPicks(highRated);
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

  const VenueCard = ({ venue, tag, color }: { venue: any, tag?: string, color?: string }) => (
    <div 
      onClick={() => router.push(`/venues/${venue.id}`)}
      className="min-w-[280px] bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-all cursor-pointer group relative"
    >
      <div className="h-40 relative overflow-hidden">
        <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={venue.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        {/* TYPE BADGE */}
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
          {getVibeIcon(venue.type)} {venue.type}
        </div>

        {/* OPTIONAL TAG (e.g. "98% Match") */}
        {tag && (
            <div className={`absolute bottom-3 right-3 ${color || 'bg-blue-600'} px-2 py-1 rounded-lg text-white text-[10px] font-bold shadow-lg flex items-center gap-1`}>
                <Zap className="w-3 h-3 fill-current" /> {tag}
            </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
            <h3 className="font-black text-lg text-slate-900 leading-tight truncate">{venue.name}</h3>
            <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-slate-600">{venue.rating || '4.8'}</span>
            </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-slate-500 text-xs font-medium truncate">
          <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {venue.location}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-50 border-b border-slate-100/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="text-slate-900"/>
                </Button>
                <div>
                    <h1 className="text-lg font-black text-slate-900 capitalize leading-none">Exploring {vibe}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {loading ? 'Thinking...' : `Party of ${guests}`}
                    </p>
                </div>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Compass className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </div>
      </div>

      <div className="p-4 space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 opacity-50">
            <Loader2 className="animate-spin text-slate-900 w-8 h-8"/>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Curating your night...</p>
          </div>
        ) : (
          <>
            {/* SECTION 1: YOUR MATCHES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600 fill-blue-600" /> Your Matches
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{matches.length} found</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
                {matches.map(v => <VenueCard key={v.id} venue={v} tag="Perfect Fit" color="bg-blue-600" />)}
              </div>
            </div>

            {/* SECTION 2: MOST VIBING (Trending) */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" /> Most Vibing
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
                {trending.map(v => <VenueCard key={v.id} venue={v} tag="98% Hype" color="bg-orange-500" />)}
              </div>
            </div>

            {/* SECTION 3: EVENTS */}
            {events.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
                  <Ticket className="w-5 h-5 text-purple-600" /> Happening Tonight
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
                  {events.map(ev => (
                    <div 
                        key={ev.id} 
                        onClick={() => router.push(`/venues/${ev.venue_id}`)}
                        className="min-w-[300px] snap-center bg-slate-900 rounded-[2rem] overflow-hidden shadow-lg border border-slate-800 cursor-pointer active:scale-95 transition-transform relative group"
                    >
                      <div className="h-32 relative opacity-80 group-hover:opacity-100 transition-opacity">
                        <img src={ev.image_url} className="w-full h-full object-cover" alt={ev.title}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      </div>
                      <div className="p-5 relative -mt-10">
                        <div className="flex justify-between items-end mb-1">
                             <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-900/50 px-2 py-1 rounded border border-purple-500/30">
                                {new Date(ev.date).toLocaleDateString()}
                             </span>
                        </div>
                        <h3 className="font-black text-xl text-white leading-tight mb-1">{ev.title}</h3>
                        <p className="text-xs text-slate-400 font-medium">{ev.venue_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: TOP PICKS / ALL VENUES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" /> Top Picks
                  </h2>
                  <Button variant="ghost" size="sm" className="text-slate-400 text-xs font-bold uppercase">View All</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {topPicks.map(v => <VenueCard key={v.id} venue={v} />)}
              </div>
            </div>

            {/* BOTTOM CTA */}
            <div className="pt-8 pb-10 text-center">
                <p className="text-slate-400 text-sm font-medium mb-4">Didn't find what you're looking for?</p>
                <Button variant="outline" className="rounded-full px-8 border-slate-300 text-slate-600 font-bold" onClick={() => setVenues(venues)}>
                    Explore All Venues
                </Button>
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