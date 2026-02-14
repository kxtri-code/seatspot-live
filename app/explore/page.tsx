"use client"

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MapPin, Star, ArrowLeft, Compass, Heart, Ticket, Flame, Zap, Coffee, Music, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StoryViewer from '@/components/StoryViewer'

// --- MOCK STORIES DATA (Simulating Live Updates) ---
const STORIES = [
    { id: 1, name: 'The Box', img: 'https://images.unsplash.com/photo-1574096079513-d82599697559?w=400&h=400&fit=crop', hasUpdate: true },
    { id: 2, name: 'SkyDeck', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop', hasUpdate: true },
    { id: 3, name: 'Bambusa', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop', hasUpdate: false },
    { id: 4, name: 'Playground', img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&h=400&fit=crop', hasUpdate: false },
]

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get URL Params (e.g., ?vibe=club&guests=4)
  const vibe = searchParams.get('vibe') || 'All'
  const guests = searchParams.get('guests') || '2'
  
  // Data State
  const [venues, setVenues] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isFetching = useRef(false)

  // Smart Lists
  const [matches, setMatches] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [topPicks, setTopPicks] = useState<any[]>([])

  // Story Viewer State
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)

  // Helper: Get Icon based on Venue Type
  const getVibeIcon = (type: string) => {
    if (type?.toLowerCase().includes('cafe')) return <Coffee className="w-4 h-4" />
    if (type?.toLowerCase().includes('club')) return <Music className="w-4 h-4" />
    return <Utensils className="w-4 h-4" />
  }

  // Fetch Data on Load or Vibe Change
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
          
          // 1. Filter Matches
          const strictMatches = data.filter(v => 
            vibe === 'All' || v.type?.toLowerCase().includes(vibe.toLowerCase())
          );
          setMatches(strictMatches.length > 0 ? strictMatches : data.slice(0, 3)); 

          // 2. Randomize Trending (Simulated)
          const sortedByVibe = [...data].sort(() => 0.5 - Math.random());
          setTrending(sortedByVibe.slice(0, 4));

          // 3. Filter Top Picks (Rating >= 4.5)
          const highRated = data.filter(v => (v.rating || 0) >= 4.5);
          setTopPicks(highRated);
        }

        const { data: eventData } = await supabase.from('events').select('*');
        if (eventData) setEvents(eventData);

        setLoading(false);
        isFetching.current = false;

      } catch (err: any) {
        // Retry logic for connection glitches
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

  // Venue Card Component
  const VenueCard = ({ venue, tag, color }: { venue: any, tag?: string, color?: string }) => (
    <div 
      onClick={() => router.push(`/venues/${venue.id}`)}
      className="min-w-[280px] bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-all cursor-pointer group relative"
    >
      <div className="h-40 relative overflow-hidden">
        <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={venue.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
          {getVibeIcon(venue.type)} {venue.type}
        </div>

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
      
      {/* 1. IMMERSIVE STORY VIEWER OVERLAY */}
      {selectedStoryIndex !== null && (
          <StoryViewer 
            stories={STORIES} 
            initialIndex={selectedStoryIndex} 
            onClose={() => setSelectedStoryIndex(null)} 
          />
      )}
      
      {/* HEADER (Sticky) */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-16 z-30 border-b border-slate-100/50 flex items-center justify-between">
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

      <div className="p-4 space-y-8">
        
        {/* NEW: LIVE STORIES SECTION */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
            {/* My Story (Add Button) */}
            <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center relative active:scale-95 transition-transform cursor-pointer">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center absolute bottom-0 right-0 border-2 border-white text-white font-bold">+</div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">My Story</span>
            </div>

            {/* Venue Stories List */}
            {STORIES.map((story, index) => (
                <div 
                    key={story.id} 
                    onClick={() => setSelectedStoryIndex(index)} // Opens the Viewer
                    className="flex flex-col items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className={`w-16 h-16 rounded-full p-[2px] ${story.hasUpdate ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : 'bg-slate-200'}`}>
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                            <img src={story.img} className="w-full h-full object-cover" alt={story.name} />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{story.name}</span>
                </div>
            ))}
        </div>

        {/* LOADING STATE */}
        {loading && venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 opacity-50">
            <Loader2 className="animate-spin text-slate-900 w-8 h-8"/>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Curating your night...</p>
          </div>
        ) : (
          <>
            {/* Matches Section */}
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

            {/* Trending Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" /> Most Vibing
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
                {trending.map(v => <VenueCard key={v.id} venue={v} tag="98% Hype" color="bg-orange-500" />)}
              </div>
            </div>

            {/* Events Section */}
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

            {/* Top Picks Section */}
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

            {/* Bottom CTA */}
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